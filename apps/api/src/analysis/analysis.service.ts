import { Injectable, NotFoundException } from '@nestjs/common';
import { MarketType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AnalysisEngineService, MarketOddInput } from '../engines/analysis-engine/analysis-engine.service';

const DEFAULT_ODDS: MarketOddInput[] = [
  { marketType: MarketType.MATCH_RESULT, selection: 'Casa', bookmakerOdd: 1.65 },
  { marketType: MarketType.MATCH_RESULT, selection: 'Empate', bookmakerOdd: 3.6 },
  { marketType: MarketType.MATCH_RESULT, selection: 'Fora', bookmakerOdd: 5.2 },
  { marketType: MarketType.OVER_UNDER, selection: 'Over 2.5', bookmakerOdd: 1.85 },
  { marketType: MarketType.OVER_UNDER, selection: 'Under 2.5', bookmakerOdd: 1.95 },
  { marketType: MarketType.BTTS, selection: 'BTTS Sim', bookmakerOdd: 1.75 },
  { marketType: MarketType.BTTS, selection: 'BTTS Não', bookmakerOdd: 2.05 },
];

const TEAM_STATS: Record<string, { gf: number; ga: number }> = {
  Brasil: { gf: 2.1, ga: 0.8 },
  Escócia: { gf: 1.3, ga: 1.5 },
  França: { gf: 1.9, ga: 0.9 },
  Noruega: { gf: 1.4, ga: 1.2 },
  Flamengo: { gf: 1.8, ga: 0.9 },
  Palmeiras: { gf: 1.6, ga: 0.7 },
  Alemanha: { gf: 2.0, ga: 1.0 },
  Itália: { gf: 1.5, ga: 0.8 },
  Marrocos: { gf: 1.4, ga: 1.1 },
  Tunísia: { gf: 1.2, ga: 1.3 },
  'Real Madrid': { gf: 2.2, ga: 0.9 },
  Barcelona: { gf: 2.0, ga: 1.0 },
};

@Injectable()
export class AnalysisService {
  constructor(
    private prisma: PrismaService,
    private analysisEngine: AnalysisEngineService,
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

    const homeStats = TEAM_STATS[match.homeTeam.name] ?? { gf: 1.4, ga: 1.3 };
    const awayStats = TEAM_STATS[match.awayTeam.name] ?? { gf: 1.4, ga: 1.3 };

    const odds: MarketOddInput[] =
      match.odds.length > 0
        ? match.odds.map((o) => ({
            marketType: o.market.type,
            selection: o.selection,
            bookmakerOdd: o.value,
          }))
        : DEFAULT_ODDS;

    const result = this.analysisEngine.analyze(
      homeStats.gf,
      homeStats.ga,
      awayStats.gf,
      awayStats.ga,
      odds,
      period,
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
      markets: result.markets,
      period,
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

  async getAnalyzedMarkets(filter: 'all' | 'ev-plus' | 'bet' = 'all') {
    const snapshots = await this.prisma.snapshot.findMany({
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
      market: string;
      probability: number;
      fairOdd: number;
      bookmakerOdd: number;
      ev: number;
      confidence: number;
      recommendation: string;
    };

    const rows: MarketRow[] = [];
    const seen = new Set<string>();

    for (const snap of snapshots) {
      const data = snap.data as {
        markets?: Array<{
          selection: string;
          probability: number;
          fairOdd: number;
          bookmakerOdd: number;
          ev: number;
          confidence: number;
          recommendation: string;
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
          market: m.selection,
          probability: m.probability,
          fairOdd: m.fairOdd,
          bookmakerOdd: m.bookmakerOdd,
          ev: m.ev,
          confidence: m.confidence,
          recommendation: m.recommendation,
        });
      }
    }

    return rows.sort((a, b) => b.ev - a.ev);
  }

  async getEvPlusMarkets() {
    return this.getAnalyzedMarkets('ev-plus');
  }
}
