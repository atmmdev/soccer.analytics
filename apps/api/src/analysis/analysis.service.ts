import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MatchStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  AnalysisEngineService,
  MarketOddInput,
  calculateExpectedGoals,
} from '../engines/analysis-engine/analysis-engine.service';
import { StatisticsEngineService } from '../engines/statistics-engine/statistics-engine.service';
import { PlayerEngineService } from '../engines/player-engine/player-engine.service';
import { DataEngineService } from '../engines/data-engine/data-engine.service';

const ANALYSIS_STALE_MS = 4 * 60 * 60 * 1000;
const ANALYZABLE_STATUSES: MatchStatus[] = [
  MatchStatus.SCHEDULED,
  MatchStatus.LIVE,
];

@Injectable()
export class AnalysisService {
  constructor(
    private prisma: PrismaService,
    private analysisEngine: AnalysisEngineService,
    private statisticsEngine: StatisticsEngineService,
    private playerEngine: PlayerEngineService,
    private dataEngine: DataEngineService,
  ) {}

  async runAnalysis(matchId: string, period = 10) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: true,
        awayTeam: true,
        competition: true,
        odds: { include: { market: true } },
      },
    });

    if (!match) throw new NotFoundException('Match not found');

    if (!ANALYZABLE_STATUSES.includes(match.status)) {
      throw new BadRequestException(
        'Análise só é permitida para jogos agendados ou ao vivo. Jogos encerrados não são analisados.',
      );
    }

    const [homeTeamStats, awayTeamStats] = await Promise.all([
      this.statisticsEngine.computeTeamStats(match.homeTeamId, period, 'home'),
      this.statisticsEngine.computeTeamStats(match.awayTeamId, period, 'away'),
    ]);

    const odds: MarketOddInput[] = match.odds.map((o) => ({
      marketType: o.market.type,
      selection: o.selection,
      bookmakerOdd: o.value,
    }));

    if (odds.length === 0) {
      throw new BadRequestException(
        'Odds não disponíveis para este jogo. Aguarde a sincronização automática.',
      );
    }

    const statsQuality =
      homeTeamStats.source === 'computed' && awayTeamStats.source === 'computed'
        ? 88
        : 68;

    const { home: homeXg, away: awayXg } = calculateExpectedGoals(
      homeTeamStats.avgGoalsFor,
      homeTeamStats.avgGoalsAgainst,
      awayTeamStats.avgGoalsFor,
      awayTeamStats.avgGoalsAgainst,
    );

    const playerSelections = odds
      .filter((o) => o.marketType.toUpperCase() === 'PLAYER')
      .map((o) => o.selection);

    const starterIds = match.externalId
      ? await this.dataEngine.fetchLineupStarters(match.externalId)
      : new Set<string>();

    const playerCtxRaw = await this.playerEngine.buildPlayerContextForMatch(
      match.id,
      match.homeTeamId,
      match.awayTeamId,
      homeXg,
      awayXg,
      homeTeamStats.avgGoalsFor,
      awayTeamStats.avgGoalsFor,
      playerSelections,
      period,
      starterIds,
    );

    const playerContext = Object.fromEntries(
      Object.entries(playerCtxRaw).map(([key, value]) => [
        key,
        { probability: value.probability, hasModel: value.hasModel },
      ]),
    );

    const result = this.analysisEngine.analyze(
      {
        goalsFor: homeTeamStats.avgGoalsFor,
        goalsAgainst: homeTeamStats.avgGoalsAgainst,
        avgCorners: homeTeamStats.avgCorners,
        avgCards: homeTeamStats.avgCards,
      },
      {
        goalsFor: awayTeamStats.avgGoalsFor,
        goalsAgainst: awayTeamStats.avgGoalsAgainst,
        avgCorners: awayTeamStats.avgCorners,
        avgCards: awayTeamStats.avgCards,
      },
      odds,
      period,
      statsQuality,
      playerContext,
    );

    const snapshotData = {
      match: {
        id: match.id,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        competition: match.competition.name,
      },
      homeExpectedGoals: result.homeExpectedGoals,
      awayExpectedGoals: result.awayExpectedGoals,
      expectedCorners: result.expectedCorners,
      expectedCards: result.expectedCards,
      markets: result.markets,
      period,
      statsSource: {
        home: homeTeamStats.source,
        away: awayTeamStats.source,
        homeMatches: homeTeamStats.matchesPlayed,
        awayMatches: awayTeamStats.matchesPlayed,
      },
    };

    const [snapshot, prediction] = await this.prisma.$transaction([
      this.prisma.snapshot.create({
        data: {
          matchId,
          data: snapshotData as unknown as Prisma.InputJsonValue,
          overallConfidence: result.overallConfidence,
          predictedResult: result.predictedScore,
        },
      }),
      this.prisma.prediction.create({
        data: {
          matchId,
          predictedHomeScore: parseInt(result.predictedScore.split('-')[0], 10),
          predictedAwayScore: parseInt(result.predictedScore.split('-')[1], 10),
          confidence: result.overallConfidence,
          data: result as unknown as Prisma.InputJsonValue,
        },
      }),
    ]);

    return {
      ...result,
      snapshotId: snapshot.id,
      predictionId: prediction.id,
      analyzedAt: snapshot.analyzedAt,
      match: {
        id: match.id,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        competition: match.competition.name,
      },
    };
  }

  async getLatest(matchId: string) {
    const snapshot = await this.prisma.snapshot.findFirst({
      where: { matchId },
      orderBy: { analyzedAt: 'desc' },
    });

    if (!snapshot) return null;

    const data = snapshot.data as {
      markets: unknown[];
      homeExpectedGoals?: number;
      awayExpectedGoals?: number;
      expectedCorners?: number;
      expectedCards?: number;
      period?: number;
    };

    return {
      snapshotId: snapshot.id,
      analyzedAt: snapshot.analyzedAt,
      overallConfidence: snapshot.overallConfidence,
      predictedResult: snapshot.predictedResult,
      actualResult: snapshot.actualResult,
      accuracy: snapshot.accuracy,
      homeExpectedGoals: data.homeExpectedGoals,
      awayExpectedGoals: data.awayExpectedGoals,
      expectedCorners: data.expectedCorners,
      expectedCards: data.expectedCards,
      markets: data.markets,
      period: data.period ?? 10,
    };
  }

  async resolveSnapshot(snapshotId: string) {
    const snapshot = await this.prisma.snapshot.findUnique({
      where: { id: snapshotId },
      include: { match: true },
    });

    if (!snapshot) throw new NotFoundException('Snapshot not found');

    const match = snapshot.match;
    if (match.status !== 'FINISHED' || match.homeScore === null || match.awayScore === null) {
      throw new NotFoundException('Match not finished yet');
    }

    const actualResult = `${match.homeScore}-${match.awayScore}`;
    const predicted = snapshot.predictedResult ?? '';
    const accuracy = predicted === actualResult ? 100 : 0;

    return this.prisma.snapshot.update({
      where: { id: snapshotId },
      data: { actualResult, accuracy },
    });
  }

  async getAnalyzedMarkets(
    filter: 'all' | 'ev-plus' | 'bet' = 'all',
    competitionId?: string,
  ) {
    const snapshots = await this.prisma.snapshot.findMany({
      where: {
        match: {
          status: { in: ANALYZABLE_STATUSES },
          ...(competitionId ? { competitionId } : {}),
        },
      },
      orderBy: { analyzedAt: 'desc' },
      take: 50,
      include: {
        match: {
          include: { homeTeam: true, awayTeam: true, competition: true },
        },
      },
    });

    type MarketRow = {
      snapshotId: string;
      matchId: string;
      matchLabel: string;
      competition: string;
      competitionId: string | null;
      homeTeam: string;
      awayTeam: string;
      homeLogoUrl: string | null;
      awayLogoUrl: string | null;
      market: string;
      marketType: string;
      probability: number;
      fairOdd: number;
      bookmakerOdd: number;
      ev: number;
      confidence: number;
      recommendation: string;
      playerModel?: boolean;
      modelSupported?: boolean;
    };

    const rows: MarketRow[] = [];
    const seen = new Set<string>();

    for (const snap of snapshots) {
      const data = snap.data as {
        markets?: Array<{
          selection: string;
          marketType?: string;
          probability: number;
          fairOdd: number;
          bookmakerOdd: number;
          ev: number;
          confidence: number;
          recommendation: string;
          playerModel?: boolean;
          modelSupported?: boolean;
        }>;
      };

      if (!data.markets) continue;

      for (const m of data.markets) {
        const key = `${snap.matchId}-${m.selection}`;
        if (seen.has(key)) continue;
        seen.add(key);

        if (filter === 'ev-plus' && (m.ev <= 0.05 || m.recommendation === 'SKIP')) continue;
        if (filter === 'bet' && m.recommendation !== 'BET') continue;

        rows.push({
          snapshotId: snap.id,
          matchId: snap.matchId,
          matchLabel: `${snap.match.homeTeam.name} vs ${snap.match.awayTeam.name}`,
          competition: snap.match.competition?.name ?? '',
          competitionId: snap.match.competitionId ?? null,
          homeTeam: snap.match.homeTeam.name,
          awayTeam: snap.match.awayTeam.name,
          homeLogoUrl: snap.match.homeTeam.logoUrl ?? null,
          awayLogoUrl: snap.match.awayTeam.logoUrl ?? null,
          market: m.selection,
          marketType: m.marketType ?? 'MATCH_RESULT',
          probability: m.probability,
          fairOdd: m.fairOdd,
          bookmakerOdd: m.bookmakerOdd,
          ev: m.ev,
          confidence: m.confidence,
          recommendation: m.recommendation,
          playerModel: m.playerModel,
          modelSupported: m.modelSupported,
        });
      }
    }

    return rows.sort((a, b) => b.ev - a.ev);
  }

  async getEvPlusMarkets() {
    return this.getAnalyzedMarkets('ev-plus');
  }

  async autoAnalyzeUpcoming(): Promise<number> {
    const { start, end } = this.getUpcomingWindow();
    const now = Date.now();

    const matches = await this.prisma.match.findMany({
      where: {
        externalId: { not: null },
        status: { in: [MatchStatus.SCHEDULED, MatchStatus.LIVE] },
        matchDate: { gte: start, lte: end },
        odds: { some: {} },
      },
      include: {
        snapshots: {
          orderBy: { analyzedAt: 'desc' },
          take: 1,
        },
      },
    });

    let count = 0;
    for (const match of matches) {
      const last = match.snapshots[0];
      const stale =
        !last || now - last.analyzedAt.getTime() > ANALYSIS_STALE_MS;

      if (!stale) continue;

      try {
        await this.runAnalysis(match.id);
        count++;
      } catch {
        // Skip matches that fail validation (e.g. missing stats)
      }
    }

    return count;
  }

  /**
   * Descarta snapshots de jogos que não estão agendados/ao vivo.
   * Análises de mercado só valem para jogos ainda em aberto.
   */
  async discardInactiveAnalyses(): Promise<number> {
    const result = await this.prisma.snapshot.deleteMany({
      where: {
        match: {
          status: { notIn: ANALYZABLE_STATUSES },
        },
      },
    });
    return result.count;
  }

  /** @deprecated Prefer discardInactiveAnalyses — placares encerrados não mantêm análise de mercado */
  async resolveFinishedSnapshots(): Promise<number> {
    return this.discardInactiveAnalyses();
  }

  async getHistory(page = 1, limit = 20, status: 'all' | 'resolved' | 'pending' = 'all') {
    const skip = (page - 1) * limit;

    const where: Prisma.SnapshotWhereInput = {
      match: { status: { in: ANALYZABLE_STATUSES } },
      ...(status === 'resolved'
        ? { accuracy: { not: null } }
        : status === 'pending'
          ? { accuracy: null }
          : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.snapshot.findMany({
        where,
        orderBy: { analyzedAt: 'desc' },
        skip,
        take: limit,
        include: {
          match: {
            include: { homeTeam: true, awayTeam: true, competition: true },
          },
        },
      }),
      this.prisma.snapshot.count({ where }),
    ]);

    const data = rows.map((snap) => {
      const payload = snap.data as {
        markets?: Array<{ ev: number; recommendation: string }>;
      };
      const markets = payload.markets ?? [];
      const evPlus = markets.filter((m) => m.ev > 0.05 && m.recommendation !== 'SKIP').length;
      const bet = markets.filter((m) => m.recommendation === 'BET').length;

      return {
        id: snap.id,
        matchId: snap.matchId,
        matchLabel: snap.match
          ? `${snap.match.homeTeam.name} vs ${snap.match.awayTeam.name}`
          : '—',
        competition: snap.match?.competition?.name ?? '',
        matchStatus: snap.match?.status ?? null,
        analyzedAt: snap.analyzedAt,
        predictedResult: snap.predictedResult,
        actualResult: snap.actualResult,
        accuracy: snap.accuracy,
        overallConfidence: snap.overallConfidence,
        evPlusCount: evPlus,
        betCount: bet,
      };
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private getUpcomingWindow() {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 2);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
}
