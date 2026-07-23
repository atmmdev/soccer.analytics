import { Injectable, Logger } from '@nestjs/common';
import { MatchStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { DataEngineService } from '../data-engine/data-engine.service';

export type FormResult = 'W' | 'D' | 'L';
export type StatsSide = 'home' | 'away' | 'all';

export interface ComputedTeamStats {
  teamId: string;
  period: number;
  side: StatsSide;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  avgGoalsFor: number;
  avgGoalsAgainst: number;
  form: FormResult[];
  bttsPct: number;
  over25Pct: number;
  avgCorners: number;
  avgShots: number;
  avgShotsOnTarget: number;
  avgPossession: number;
  avgXg: number;
  avgXga: number;
  avgCards: number;
  avgRedCards: number;
  source: 'computed' | 'fallback';
}

export interface H2HStats {
  homeWins: number;
  awayWins: number;
  draws: number;
  totalGames: number;
  lastMeetings: string[];
}

const FALLBACK = {
  avgGoalsFor: 1.35,
  avgGoalsAgainst: 1.35,
  bttsPct: 50,
  over25Pct: 50,
  avgCorners: 5,
  avgShots: 11,
  avgShotsOnTarget: 3.5,
  avgPossession: 50,
  avgXg: 1.25,
  avgXga: 1.25,
  avgCards: 2.5,
  avgRedCards: 0.12,
};

const matchInclude = {
  matchStatistics: true,
} satisfies Prisma.MatchInclude;

type RemoteResult = { scored: number; conceded: number; isHome: boolean };

@Injectable()
export class StatisticsEngineService {
  private readonly logger = new Logger(StatisticsEngineService.name);
  /** Cache curto para não repetir chamadas à API no mesmo processo. */
  private readonly remoteFormCache = new Map<
    string,
    { at: number; results: RemoteResult[] }
  >();
  private static readonly REMOTE_CACHE_MS = 30 * 60 * 1000;

  constructor(
    private prisma: PrismaService,
    private dataEngine: DataEngineService,
  ) {}

  async getGoalAverages(teamId: string, period: number, side: StatsSide = 'all') {
    const stats = await this.computeTeamStats(teamId, period, side);
    return {
      gf: stats.avgGoalsFor,
      ga: stats.avgGoalsAgainst,
      source: stats.source,
      matchesPlayed: stats.matchesPlayed,
    };
  }

  async computeTeamStats(
    teamId: string,
    period: number,
    side: StatsSide = 'all',
  ): Promise<ComputedTeamStats> {
    const matches = await this.fetchFinishedMatches(teamId, period, side);

    if (matches.length === 0) {
      const remote = await this.tryRemoteFormStats(teamId, period, side);
      return remote ?? this.fallbackStats(teamId, period, side);
    }

    let goalsFor = 0;
    let goalsAgainst = 0;
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let btts = 0;
    let over25 = 0;
    let corners = 0;
    let shots = 0;
    let shotsOnTarget = 0;
    let possession = 0;
    let xg = 0;
    let xga = 0;
    let cards = 0;
    let reds = 0;
    let statSamples = 0;
    const form: FormResult[] = [];

    for (const match of matches) {
      const isHome = match.homeTeamId === teamId;
      const scored = isHome ? match.homeScore! : match.awayScore!;
      const conceded = isHome ? match.awayScore! : match.homeScore!;

      goalsFor += scored;
      goalsAgainst += conceded;

      if (scored > conceded) wins++;
      else if (scored === conceded) draws++;
      else losses++;

      if (scored > 0 && conceded > 0) btts++;
      if (scored + conceded > 2) over25++;

      form.push(scored > conceded ? 'W' : scored === conceded ? 'D' : 'L');

      const ms = match.matchStatistics;
      if (ms) {
        statSamples++;
        if (isHome) {
          corners += ms.homeCorners ?? 0;
          shots += ms.homeShots ?? 0;
          shotsOnTarget += ms.homeShotsOnTarget ?? 0;
          possession += ms.homePossession ?? 50;
          xg += ms.homeXG ?? scored * 0.92;
          xga += ms.awayXG ?? conceded * 0.92;
          cards += (ms.homeYellowCards ?? 0) + (ms.homeRedCards ?? 0);
          reds += ms.homeRedCards ?? 0;
        } else {
          corners += ms.awayCorners ?? 0;
          shots += ms.awayShots ?? 0;
          shotsOnTarget += ms.awayShotsOnTarget ?? 0;
          possession += ms.awayPossession ?? 50;
          xg += ms.awayXG ?? scored * 0.92;
          xga += ms.homeXG ?? conceded * 0.92;
          cards += (ms.awayYellowCards ?? 0) + (ms.awayRedCards ?? 0);
          reds += ms.awayRedCards ?? 0;
        }
      }
    }

    const n = matches.length;
    const avgGoalsFor = goalsFor / n;
    const avgGoalsAgainst = goalsAgainst / n;

    return {
      teamId,
      period,
      side,
      matchesPlayed: n,
      wins,
      draws,
      losses,
      avgGoalsFor: round(avgGoalsFor),
      avgGoalsAgainst: round(avgGoalsAgainst),
      form,
      bttsPct: round((btts / n) * 100),
      over25Pct: round((over25 / n) * 100),
      avgCorners: round(statSamples > 0 ? corners / statSamples : avgGoalsFor * 3.2),
      avgShots: round(statSamples > 0 ? shots / statSamples : avgGoalsFor * 8),
      avgShotsOnTarget: round(
        statSamples > 0 ? shotsOnTarget / statSamples : avgGoalsFor * 2.8,
      ),
      avgRedCards: round(statSamples > 0 ? reds / statSamples : 0.12),
      avgPossession: round(statSamples > 0 ? possession / statSamples : 50),
      avgXg: round(statSamples > 0 ? xg / statSamples : avgGoalsFor * 0.92),
      avgXga: round(statSamples > 0 ? xga / statSamples : avgGoalsAgainst * 0.92),
      avgCards: round(statSamples > 0 ? cards / statSamples : 2.5),
      source: 'computed',
    };
  }

  async getH2H(
    homeTeamId: string,
    awayTeamId: string,
    limit = 10,
  ): Promise<H2HStats> {
    const matches = await this.prisma.match.findMany({
      where: {
        status: MatchStatus.FINISHED,
        homeScore: { not: null },
        awayScore: { not: null },
        OR: [
          { homeTeamId, awayTeamId },
          { homeTeamId: awayTeamId, awayTeamId: homeTeamId },
        ],
      },
      orderBy: { matchDate: 'desc' },
      take: limit,
    });

    if (matches.length === 0) {
      return {
        homeWins: 0,
        awayWins: 0,
        draws: 0,
        totalGames: 0,
        lastMeetings: [],
      };
    }

    let homeWins = 0;
    let awayWins = 0;
    let draws = 0;
    const lastMeetings: string[] = [];

    for (const m of matches) {
      const hs = m.homeScore!;
      const as = m.awayScore!;

      const upcomingHomeWasHome = m.homeTeamId === homeTeamId;
      const homeScored = upcomingHomeWasHome ? hs : as;
      const awayScored = upcomingHomeWasHome ? as : hs;
      // Placares no ponto de vista do mandante atual (para Poisson / sugestão)
      lastMeetings.push(`${homeScored}-${awayScored}`);

      if (homeScored > awayScored) homeWins++;
      else if (homeScored < awayScored) awayWins++;
      else draws++;
    }

    return {
      homeWins,
      awayWins,
      draws,
      totalGames: matches.length,
      lastMeetings,
    };
  }

  async getComparisonStats(
    homeTeamId: string,
    awayTeamId: string,
    period: number,
    view: 'home' | 'away' | 'h2h',
  ) {
    const homeSide: StatsSide = view === 'away' ? 'away' : 'home';
    const awaySide: StatsSide = view === 'home' ? 'away' : 'home';

    const [homeStats, awayStats] = await Promise.all([
      view === 'h2h'
        ? this.computeH2HSideStats(homeTeamId, awayTeamId, period, 'home')
        : this.computeTeamStats(homeTeamId, period, homeSide),
      view === 'h2h'
        ? this.computeH2HSideStats(homeTeamId, awayTeamId, period, 'away')
        : this.computeTeamStats(awayTeamId, period, awaySide),
    ]);

    return { homeStats, awayStats };
  }

  private async computeH2HSideStats(
    homeTeamId: string,
    awayTeamId: string,
    period: number,
    perspective: 'home' | 'away',
  ): Promise<ComputedTeamStats> {
    const teamId = perspective === 'home' ? homeTeamId : awayTeamId;
    const matches = await this.prisma.match.findMany({
      where: {
        status: MatchStatus.FINISHED,
        homeScore: { not: null },
        awayScore: { not: null },
        OR: [
          { homeTeamId, awayTeamId },
          { homeTeamId: awayTeamId, awayTeamId: homeTeamId },
        ],
      },
      include: matchInclude,
      orderBy: { matchDate: 'desc' },
      take: period,
    });

    if (matches.length === 0) {
      return this.fallbackStats(teamId, period, 'all');
    }

    let goalsFor = 0;
    let goalsAgainst = 0;
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let btts = 0;
    let over25 = 0;
    const form: FormResult[] = [];

    for (const match of matches) {
      const isHomeInMatch = match.homeTeamId === teamId;
      const scored = isHomeInMatch ? match.homeScore! : match.awayScore!;
      const conceded = isHomeInMatch ? match.awayScore! : match.homeScore!;

      goalsFor += scored;
      goalsAgainst += conceded;
      if (scored > conceded) wins++;
      else if (scored === conceded) draws++;
      else losses++;
      if (scored > 0 && conceded > 0) btts++;
      if (scored + conceded > 2) over25++;
      form.push(scored > conceded ? 'W' : scored === conceded ? 'D' : 'L');
    }

    const n = matches.length;
    const avgGoalsFor = goalsFor / n;
    const avgGoalsAgainst = goalsAgainst / n;

    return {
      teamId,
      period,
      side: 'all',
      matchesPlayed: n,
      wins,
      draws,
      losses,
      avgGoalsFor: round(avgGoalsFor),
      avgGoalsAgainst: round(avgGoalsAgainst),
      form,
      bttsPct: round((btts / n) * 100),
      over25Pct: round((over25 / n) * 100),
      avgCorners: round(avgGoalsFor * 3.2),
      avgShots: round(avgGoalsFor * 8),
      avgShotsOnTarget: round(avgGoalsFor * 2.8),
      avgRedCards: 0.12,
      avgPossession: 50,
      avgXg: round(avgGoalsFor * 0.92),
      avgXga: round(avgGoalsAgainst * 0.92),
      avgCards: 2.5,
      source: 'computed',
    };
  }

  private async fetchFinishedMatches(
    teamId: string,
    period: number,
    side: StatsSide,
  ) {
    const where: Prisma.MatchWhereInput = {
      status: MatchStatus.FINISHED,
      homeScore: { not: null },
      awayScore: { not: null },
      OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
    };

    if (side === 'home') {
      where.homeTeamId = teamId;
      delete where.OR;
    } else if (side === 'away') {
      where.awayTeamId = teamId;
      delete where.OR;
    }

    return this.prisma.match.findMany({
      where,
      include: matchInclude,
      orderBy: { matchDate: 'desc' },
      take: period,
    });
  }

  private async tryRemoteFormStats(
    teamId: string,
    period: number,
    side: StatsSide,
  ): Promise<ComputedTeamStats | null> {
    if (!this.dataEngine.isApiFootballConfigured()) return null;

    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      select: { externalId: true },
    });
    if (!team?.externalId) return null;

    try {
      const results = await this.getRemoteResults(team.externalId, Math.max(period, 10));
      if (results.length === 0) return null;

      let filtered = results;
      if (side === 'home') filtered = results.filter((r) => r.isHome);
      if (side === 'away') filtered = results.filter((r) => !r.isHome);
      // Se o filtro por mando não tiver amostra, usa o histórico completo.
      if (filtered.length === 0) filtered = results;

      const sample = filtered.slice(-period);
      return this.statsFromResults(teamId, period, side, sample);
    } catch (err) {
      this.logger.warn(
        `Falha ao buscar form remota do time ${teamId}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      return null;
    }
  }

  private async getRemoteResults(
    teamExternalId: string,
    last: number,
  ): Promise<RemoteResult[]> {
    const cached = this.remoteFormCache.get(teamExternalId);
    if (
      cached &&
      Date.now() - cached.at < StatisticsEngineService.REMOTE_CACHE_MS
    ) {
      return cached.results;
    }

    const results = await this.dataEngine.fetchRemoteTeamForm(
      teamExternalId,
      last,
    );
    this.remoteFormCache.set(teamExternalId, {
      at: Date.now(),
      results,
    });
    return results;
  }

  private statsFromResults(
    teamId: string,
    period: number,
    side: StatsSide,
    results: RemoteResult[],
  ): ComputedTeamStats {
    let goalsFor = 0;
    let goalsAgainst = 0;
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let btts = 0;
    let over25 = 0;
    const form: FormResult[] = [];

    for (const result of results) {
      const { scored, conceded } = result;
      goalsFor += scored;
      goalsAgainst += conceded;
      if (scored > conceded) wins++;
      else if (scored === conceded) draws++;
      else losses++;
      if (scored > 0 && conceded > 0) btts++;
      if (scored + conceded > 2) over25++;
      form.push(scored > conceded ? 'W' : scored === conceded ? 'D' : 'L');
    }

    const n = results.length;
    const avgGoalsFor = goalsFor / n;
    const avgGoalsAgainst = goalsAgainst / n;

    return {
      teamId,
      period,
      side,
      matchesPlayed: n,
      wins,
      draws,
      losses,
      avgGoalsFor: round(avgGoalsFor),
      avgGoalsAgainst: round(avgGoalsAgainst),
      form,
      bttsPct: round((btts / n) * 100),
      over25Pct: round((over25 / n) * 100),
      avgCorners: round(avgGoalsFor * 3.2),
      avgShots: round(avgGoalsFor * 8),
      avgShotsOnTarget: round(avgGoalsFor * 2.8),
      avgRedCards: 0.12,
      avgPossession: 50,
      avgXg: round(avgGoalsFor * 0.92),
      avgXga: round(avgGoalsAgainst * 0.92),
      avgCards: 2.5,
      source: 'computed',
    };
  }

  private fallbackStats(
    teamId: string,
    period: number,
    side: StatsSide,
  ): ComputedTeamStats {
    return {
      teamId,
      period,
      side,
      matchesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      avgGoalsFor: FALLBACK.avgGoalsFor,
      avgGoalsAgainst: FALLBACK.avgGoalsAgainst,
      form: ['D', 'D', 'D', 'D', 'D'],
      bttsPct: FALLBACK.bttsPct,
      over25Pct: FALLBACK.over25Pct,
      avgCorners: FALLBACK.avgCorners,
      avgShots: FALLBACK.avgShots,
      avgShotsOnTarget: FALLBACK.avgShotsOnTarget,
      avgRedCards: FALLBACK.avgRedCards,
      avgPossession: FALLBACK.avgPossession,
      avgXg: FALLBACK.avgXg,
      avgXga: FALLBACK.avgXga,
      avgCards: FALLBACK.avgCards,
      source: 'fallback',
    };
  }
}

function round(n: number) {
  return Math.round(n * 10) / 10;
}
