import { BadRequestException, Injectable } from '@nestjs/common';
import { MatchStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ApiFootballProvider } from './api-football.provider';
import {
  DataProviderStatus,
  ImportedFixture,
  ImportedOdd,
  ImportedPlayerPerformance,
} from './data-provider.interface';

export interface ImportFixturesResult {
  provider: string;
  date: string;
  fixturesFound: number;
  fixturesCreated: number;
  fixturesUpdated: number;
  errors: string[];
}

export interface ImportOddsResult {
  provider: string;
  date: string;
  fixturesWithOdds: number;
  matchesProcessed: number;
  oddsCreated: number;
  skippedNoOdds: number;
  remainingWithoutOdds: number;
  rateLimited: boolean;
  errors: string[];
}

export interface ImportStatisticsResult {
  provider: string;
  date: string;
  matchesProcessed: number;
  statisticsCreated: number;
  statisticsUpdated: number;
  skippedNoStats: number;
  remainingWithoutStats: number;
  rateLimited: boolean;
  errors: string[];
}

export interface ImportPlayerStatsResult {
  provider: string;
  date: string;
  matchesProcessed: number;
  playersUpserted: number;
  performancesCreated: number;
  skippedNoData: number;
  remainingWithoutPlayers: number;
  rateLimited: boolean;
  errors: string[];
}

/** Plano free: 10 req/min — pausa de 6,5s entre requests extras */
const STATS_BATCH_LIMIT = 5;
const PLAYERS_BATCH_LIMIT = 5;
const ODDS_FIXTURE_BATCH_LIMIT = 5;
const STATS_REQUEST_DELAY_MS = 6500;

function isRateLimitError(message: string): boolean {
  return /rate limit|too many requests|limite de requisi/i.test(message);
}

@Injectable()
export class DataEngineService {
  constructor(
    private prisma: PrismaService,
    private apiFootball: ApiFootballProvider,
  ) {}

  getStatus(): { providers: DataProviderStatus[] } {
    return {
      providers: [this.apiFootball.getStatus()],
    };
  }

  async importFixtures(date: string): Promise<ImportFixturesResult> {
    this.assertDate(date);
    const provider = this.getActiveProvider();

    const result: ImportFixturesResult = {
      provider: provider.name,
      date,
      fixturesFound: 0,
      fixturesCreated: 0,
      fixturesUpdated: 0,
      errors: [],
    };

    let fixtures: ImportedFixture[];
    try {
      fixtures = await provider.fetchFixtures(date);
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Falha ao buscar jogos',
      );
    }

    result.fixturesFound = fixtures.length;

    for (const fixture of fixtures) {
      try {
        const { created } = await this.upsertFixture(fixture);
        if (created) result.fixturesCreated++;
        else result.fixturesUpdated++;
      } catch (err) {
        result.errors.push(
          `${fixture.homeTeam.name} x ${fixture.awayTeam.name}: ${
            err instanceof Error ? err.message : 'erro desconhecido'
          }`,
        );
      }
    }

    return result;
  }

  async importOdds(date: string): Promise<ImportOddsResult> {
    this.assertDate(date);
    const provider = this.getActiveProvider();
    const { start, end } = this.getLocalDateRange(date);

    const result: ImportOddsResult = {
      provider: provider.name,
      date,
      fixturesWithOdds: 0,
      matchesProcessed: 0,
      oddsCreated: 0,
      skippedNoOdds: 0,
      remainingWithoutOdds: 0,
      rateLimited: false,
      errors: [],
    };

    const oddsByFixture = new Map<string, ImportedOdd[]>();
    let bulkAttempted = false;

    try {
      const byDate = await provider.fetchOddsByDate(date);
      bulkAttempted = true;
      for (const [fixtureId, odds] of byDate) {
        oddsByFixture.set(fixtureId, odds);
      }
    } catch (err) {
      bulkAttempted = true;
      const message = err instanceof Error ? err.message : 'Falha ao buscar odds';
      result.errors.push(`Bulk por data: ${message}`);
      if (isRateLimitError(message)) {
        result.rateLimited = true;
      }
    }

    const matches = await this.prisma.match.findMany({
      where: {
        externalId: { not: null },
        status: { in: [MatchStatus.SCHEDULED, MatchStatus.LIVE] },
        matchDate: { gte: start, lte: end },
      },
      include: { _count: { select: { odds: true } } },
      orderBy: { matchDate: 'asc' },
    });

    // Prioriza jogos sem odds no DB e sem cobertura no bulk
    const missing = matches
      .filter((m) => m.externalId && !oddsByFixture.has(m.externalId))
      .sort((a, b) => a._count.odds - b._count.odds);

    if (!result.rateLimited && missing.length > 0) {
      // Bulk já consumiu até 3 requests — espera antes do fallback por fixture
      if (bulkAttempted) {
        await this.sleep(STATS_REQUEST_DELAY_MS);
      }

      for (let i = 0; i < missing.length && i < ODDS_FIXTURE_BATCH_LIMIT; i++) {
        const match = missing[i];
        if (!match.externalId) continue;
        try {
          if (i > 0) await this.sleep(STATS_REQUEST_DELAY_MS);
          const odds = await provider.fetchOdds(match.externalId);
          if (odds.length > 0) {
            oddsByFixture.set(match.externalId, odds);
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'erro desconhecido';
          result.errors.push(`Fixture ${match.externalId}: ${message}`);
          if (isRateLimitError(message)) {
            result.rateLimited = true;
            break;
          }
        }
      }
    }

    result.fixturesWithOdds = oddsByFixture.size;

    if (oddsByFixture.size === 0 && matches.length === 0) {
      result.errors.push(
        'Nenhum jogo agendado nesta data e nenhuma odd retornada.',
      );
      return result;
    }

    if (oddsByFixture.size === 0) {
      result.errors.push(
        'Nenhuma odd retornada para esta data. Odds costumam aparecer 1–14 dias antes do jogo; tente outra data ou liga.',
      );
      result.remainingWithoutOdds = matches.length;
      return result;
    }

    for (const match of matches) {
      if (!match.externalId) continue;

      const odds = oddsByFixture.get(match.externalId);
      if (!odds || odds.length === 0) {
        result.skippedNoOdds++;
        continue;
      }

      try {
        const created = await this.replaceOdds(match.id, this.dedupeOdds(odds));
        result.matchesProcessed++;
        result.oddsCreated += created;
      } catch (err) {
        result.errors.push(
          `Match ${match.externalId}: ${
            err instanceof Error ? err.message : 'erro desconhecido'
          }`,
        );
      }
    }

    result.remainingWithoutOdds = matches.filter(
      (m) => m.externalId && !oddsByFixture.has(m.externalId),
    ).length;

    return result;
  }

  async importStatistics(date: string): Promise<ImportStatisticsResult> {
    this.assertDate(date);
    const provider = this.getActiveProvider();
    const { start, end } = this.getLocalDateRange(date);

    const result: ImportStatisticsResult = {
      provider: provider.name,
      date,
      matchesProcessed: 0,
      statisticsCreated: 0,
      statisticsUpdated: 0,
      skippedNoStats: 0,
      remainingWithoutStats: 0,
      rateLimited: false,
      errors: [],
    };

    const candidates = await this.prisma.match.findMany({
      where: {
        externalId: { not: null },
        status: MatchStatus.FINISHED,
        matchDate: { gte: start, lte: end },
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        matchStatistics: true,
      },
      orderBy: { matchDate: 'desc' },
    });

    const pending = candidates.filter((m) => !m.matchStatistics);
    const batch = pending.slice(0, STATS_BATCH_LIMIT);

    for (let i = 0; i < batch.length; i++) {
      const match = batch[i];
      if (!match.externalId || !match.homeTeam.externalId) continue;

      const label = `${match.homeTeam.name} vs ${match.awayTeam.name}`;

      try {
        const stats = await provider.fetchFixtureStatistics(
          match.externalId,
          match.homeTeam.externalId,
        );

        if (!stats) {
          await this.prisma.matchStatistics.create({ data: { matchId: match.id } });
          result.skippedNoStats++;
          continue;
        }

        const hasData =
          stats.homeXG != null ||
          stats.awayXG != null ||
          stats.homeShots != null ||
          stats.homePossession != null;

        if (!hasData) {
          await this.prisma.matchStatistics.create({ data: { matchId: match.id } });
          result.skippedNoStats++;
          continue;
        }

        const data = {
          homePossession: stats.homePossession ?? null,
          awayPossession: stats.awayPossession ?? null,
          homeShots: stats.homeShots ?? null,
          awayShots: stats.awayShots ?? null,
          homeShotsOnTarget: stats.homeShotsOnTarget ?? null,
          awayShotsOnTarget: stats.awayShotsOnTarget ?? null,
          homeCorners: stats.homeCorners ?? null,
          awayCorners: stats.awayCorners ?? null,
          homeYellowCards: stats.homeYellowCards ?? null,
          awayYellowCards: stats.awayYellowCards ?? null,
          homeRedCards: stats.homeRedCards ?? null,
          awayRedCards: stats.awayRedCards ?? null,
          homeXG: stats.homeXG ?? null,
          awayXG: stats.awayXG ?? null,
        };

        if (match.matchStatistics) {
          await this.prisma.matchStatistics.update({
            where: { matchId: match.id },
            data,
          });
          result.statisticsUpdated++;
        } else {
          await this.prisma.matchStatistics.create({
            data: { matchId: match.id, ...data },
          });
          result.statisticsCreated++;
        }

        result.matchesProcessed++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'erro desconhecido';
        if (this.isRateLimitError(msg)) {
          result.rateLimited = true;
          break;
        }
        result.errors.push(`${label}: ${msg}`);
      }

      if (i < batch.length - 1 && !result.rateLimited) {
        await this.sleep(STATS_REQUEST_DELAY_MS);
      }
    }

    result.remainingWithoutStats = await this.countPendingStatistics(start, end);

    return result;
  }

  async importPlayerStats(date: string): Promise<ImportPlayerStatsResult> {
    this.assertDate(date);
    const provider = this.getActiveProvider();
    const { start, end } = this.getLocalDateRange(date);

    const result: ImportPlayerStatsResult = {
      provider: provider.name,
      date,
      matchesProcessed: 0,
      playersUpserted: 0,
      performancesCreated: 0,
      skippedNoData: 0,
      remainingWithoutPlayers: 0,
      rateLimited: false,
      errors: [],
    };

    const candidates = await this.prisma.match.findMany({
      where: {
        externalId: { not: null },
        status: MatchStatus.FINISHED,
        matchDate: { gte: start, lte: end },
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        _count: { select: { playerPerformances: true } },
      },
      orderBy: { matchDate: 'desc' },
    });

    const pending = candidates.filter((m) => m._count.playerPerformances === 0);
    const batch = pending.slice(0, PLAYERS_BATCH_LIMIT);

    for (let i = 0; i < batch.length; i++) {
      const match = batch[i];
      if (!match.externalId) continue;

      const label = `${match.homeTeam.name} vs ${match.awayTeam.name}`;

      try {
        const performances = await provider.fetchFixturePlayers(match.externalId);

        if (performances.length === 0) {
          result.skippedNoData++;
          continue;
        }

        const teamByExternal = new Map<string, string>([
          [match.homeTeam.externalId ?? '', match.homeTeamId],
          [match.awayTeam.externalId ?? '', match.awayTeamId],
        ]);

        const upsertedPlayers = new Set<string>();

        for (const perf of performances) {
          const teamId = teamByExternal.get(perf.teamExternalId);
          if (!teamId) continue;

          const player = await this.upsertPlayer(perf, teamId);
          upsertedPlayers.add(player.id);

          await this.prisma.matchPlayerPerformance.upsert({
            where: {
              matchId_playerId: { matchId: match.id, playerId: player.id },
            },
            create: {
              matchId: match.id,
              playerId: player.id,
              minutes: perf.minutes,
              goals: perf.goals,
              assists: perf.assists,
              shots: perf.shots,
              shotsOnTarget: perf.shotsOnTarget,
              wasStarter: perf.wasStarter,
            },
            update: {
              minutes: perf.minutes,
              goals: perf.goals,
              assists: perf.assists,
              shots: perf.shots,
              shotsOnTarget: perf.shotsOnTarget,
              wasStarter: perf.wasStarter,
            },
          });
          result.performancesCreated++;
        }

        result.playersUpserted += upsertedPlayers.size;
        result.matchesProcessed++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'erro desconhecido';
        if (this.isRateLimitError(msg)) {
          result.rateLimited = true;
          break;
        }
        result.errors.push(`${label}: ${msg}`);
      }

      if (i < batch.length - 1 && !result.rateLimited) {
        await this.sleep(STATS_REQUEST_DELAY_MS);
      }
    }

    result.remainingWithoutPlayers = await this.countPendingPlayerStats(start, end);

    return result;
  }

  async fetchLineupStarters(fixtureExternalId: string): Promise<Set<string>> {
    try {
      const provider = this.getActiveProvider();
      const lineups = await provider.fetchFixtureLineups(fixtureExternalId);
      return new Set(
        lineups.filter((p) => p.isStarter).map((p) => p.playerExternalId),
      );
    } catch {
      return new Set();
    }
  }

  private async upsertPlayer(perf: ImportedPlayerPerformance, teamId: string) {
    const existing = await this.prisma.player.findUnique({
      where: { externalId: perf.playerExternalId },
    });

    if (existing) {
      return this.prisma.player.update({
        where: { id: existing.id },
        data: {
          name: perf.playerName,
          teamId,
          position: perf.position ?? null,
        },
      });
    }

    return this.prisma.player.create({
      data: {
        externalId: perf.playerExternalId,
        name: perf.playerName,
        teamId,
        position: perf.position ?? null,
      },
    });
  }

  private async countPendingPlayerStats(start: Date, end: Date) {
    return this.prisma.match.count({
      where: {
        externalId: { not: null },
        status: MatchStatus.FINISHED,
        matchDate: { gte: start, lte: end },
        playerPerformances: { none: {} },
      },
    });
  }

  private async countPendingStatistics(start: Date, end: Date) {
    return this.prisma.match.count({
      where: {
        externalId: { not: null },
        status: MatchStatus.FINISHED,
        matchDate: { gte: start, lte: end },
        matchStatistics: null,
      },
    });
  }

  private isRateLimitError(message: string) {
    return (
      message.includes('Limite de requisições') ||
      message.includes('rate limit') ||
      message.includes('429')
    );
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private getLocalDateRange(date: string) {
    const [y, m, d] = date.split('-').map(Number);
    const start = new Date(y, m - 1, d, 0, 0, 0, 0);
    const end = new Date(y, m - 1, d, 23, 59, 59, 999);
    return { start, end };
  }

  private getActiveProvider() {
    const status = this.apiFootball.getStatus();
    if (!status.configured) {
      throw new BadRequestException(status.message);
    }
    return this.apiFootball;
  }

  private assertDate(date: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException('Data inválida — use YYYY-MM-DD');
    }
  }

  private dedupeOdds(odds: ImportedOdd[]): ImportedOdd[] {
    const seen = new Set<string>();
    const result: ImportedOdd[] = [];
    for (const odd of odds) {
      const key = `${odd.marketType}:${odd.selection}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(odd);
    }
    return result;
  }

  private async upsertFixture(fixture: ImportedFixture) {
    const competition = await this.upsertCompetition(fixture);
    const homeTeam = await this.upsertTeam(fixture.homeTeam);
    const awayTeam = await this.upsertTeam(fixture.awayTeam);

    const existing = await this.prisma.match.findUnique({
      where: { externalId: fixture.externalId },
    });

    const data = {
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      competitionId: competition.id,
      matchDate: fixture.matchDate,
      status: fixture.status,
      homeScore: fixture.homeScore ?? null,
      awayScore: fixture.awayScore ?? null,
      round: fixture.round ?? null,
      venue: fixture.venue ?? null,
    };

    if (existing) {
      await this.prisma.match.update({
        where: { id: existing.id },
        data,
      });
      return { id: existing.id, created: false };
    }

    const created = await this.prisma.match.create({
      data: { ...data, externalId: fixture.externalId },
    });
    return { id: created.id, created: true };
  }

  private async upsertCompetition(fixture: ImportedFixture) {
    const { competition } = fixture;
    const existing = await this.prisma.competition.findUnique({
      where: { externalId: competition.externalId },
    });

    if (existing) {
      return this.prisma.competition.update({
        where: { id: existing.id },
        data: {
          name: competition.name,
          country: competition.country ?? null,
          logoUrl: competition.logoUrl ?? null,
        },
      });
    }

    return this.prisma.competition.create({
      data: {
        externalId: competition.externalId,
        name: competition.name,
        country: competition.country ?? null,
        logoUrl: competition.logoUrl ?? null,
      },
    });
  }

  private async upsertTeam(team: ImportedFixture['homeTeam']) {
    const existing = await this.prisma.team.findUnique({
      where: { externalId: team.externalId },
    });

    if (existing) {
      return this.prisma.team.update({
        where: { id: existing.id },
        data: {
          name: team.name,
          shortName: team.shortName ?? null,
          logoUrl: team.logoUrl ?? null,
          country: team.country ?? null,
        },
      });
    }

    return this.prisma.team.create({
      data: {
        externalId: team.externalId,
        name: team.name,
        shortName: team.shortName ?? null,
        logoUrl: team.logoUrl ?? null,
        country: team.country ?? null,
      },
    });
  }

  private async replaceOdds(matchId: string, odds: ImportedOdd[]) {
    if (odds.length === 0) return 0;

    const markets = await this.prisma.market.findMany();
    const marketByType = new Map(markets.map((m) => [m.type, m.id]));

    await this.prisma.odd.deleteMany({ where: { matchId } });

    let created = 0;
    for (const odd of odds) {
      const marketId = marketByType.get(odd.marketType);
      if (!marketId) continue;

      await this.prisma.odd.create({
        data: {
          matchId,
          marketId,
          selection: odd.selection,
          value: odd.value,
          bookmaker: odd.bookmaker ?? null,
        },
      });
      created++;
    }

    return created;
  }

  async fetchRemoteH2H(
    homeTeamExternalId: string,
    awayTeamExternalId: string,
    last = 10,
  ) {
    return this.apiFootball.fetchHeadToHead(
      homeTeamExternalId,
      awayTeamExternalId,
      last,
    );
  }

  async fetchRemoteTeamForm(teamExternalId: string, last = 10) {
    return this.apiFootball.fetchTeamRecentResults(teamExternalId, last);
  }

  isApiFootballConfigured() {
    return this.apiFootball.getStatus().configured;
  }
}
