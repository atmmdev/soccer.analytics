import { BadRequestException, Injectable } from '@nestjs/common';
import { MatchStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ApiFootballProvider } from './api-football.provider';
import {
  DataProviderStatus,
  ImportedFixture,
  ImportedOdd,
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
  matchesProcessed: number;
  oddsCreated: number;
  errors: string[];
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

    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);

    const matches = await this.prisma.match.findMany({
      where: {
        matchDate: { gte: start, lte: end },
        externalId: { not: null },
        status: MatchStatus.SCHEDULED,
      },
    });

    const result: ImportOddsResult = {
      provider: provider.name,
      date,
      matchesProcessed: 0,
      oddsCreated: 0,
      errors: [],
    };

    for (const match of matches) {
      if (!match.externalId) continue;

      try {
        const odds = await provider.fetchOdds(match.externalId);
        const created = await this.replaceOdds(match.id, odds);
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

    return result;
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
}
