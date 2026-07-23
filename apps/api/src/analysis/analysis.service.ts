import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MatchStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  AnalysisEngineService,
  MarketOddInput,
  calculateExpectedGoals,
  mostLikelyScoreCell,
  scoreMatrix,
} from '../engines/analysis-engine/analysis-engine.service';
import type {
  ComputedTeamStats,
  H2HStats,
} from '../engines/statistics-engine/statistics-engine.service';
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

  /**
 * Sugestões por campeonato:
   * 6 múltiplas 1X2 (B01–B06) + 4 placares H2H + 4 bilhetes pós-análise
   * (temas variáveis entre mercados de docs/betting/markets).
   */
  async getLeagueTicketSuggestions(
    legsPerTicket = 10,
    competitionId?: string,
  ) {
    const maxLegs = Math.min(10, Math.max(3, legsPerTicket));

    const snapshots = await this.prisma.snapshot.findMany({
      where: {
        match: {
          status: { in: ANALYZABLE_STATUSES },
          ...(competitionId
            ? {
                OR: [
                  { competitionId },
                  { competition: { name: competitionId } },
                ],
              }
            : {}),
        },
      },
      orderBy: { analyzedAt: 'desc' },
      take: competitionId ? 80 : 400,
      include: {
        match: {
          include: { homeTeam: true, awayTeam: true, competition: true },
        },
      },
    });

    type MatchCtx = {
      matchId: string;
      matchLabel: string;
      competitionId: string | null;
      competition: string;
      homeTeamId: string;
      awayTeamId: string;
      homeExternalId: string | null;
      awayExternalId: string | null;
      homeTeam: string;
      awayTeam: string;
      homeLogoUrl: string | null;
      awayLogoUrl: string | null;
      confidence: number;
      homeXg: number;
      awayXg: number;
      hasSnapshotXg: boolean;
      predictedScore: string | null;
      markets: Array<{
        marketType: string;
        selection: string;
        probability: number;
        fairOdd: number;
        bookmakerOdd: number;
        ev: number;
        confidence: number;
        recommendation: string;
      }>;
    };

    const byMatch = new Map<string, MatchCtx>();
    for (const snap of snapshots) {
      if (byMatch.has(snap.matchId)) continue;
      const data = snap.data as {
        homeExpectedGoals?: number;
        awayExpectedGoals?: number;
        markets?: MatchCtx['markets'];
      };
      const hasSnapshotXg =
        typeof data.homeExpectedGoals === 'number' &&
        typeof data.awayExpectedGoals === 'number';
      byMatch.set(snap.matchId, {
        matchId: snap.matchId,
        matchLabel: `${snap.match.homeTeam.name} vs ${snap.match.awayTeam.name}`,
        competitionId: snap.match.competitionId ?? null,
        competition: snap.match.competition?.name ?? 'Sem campeonato',
        homeTeamId: snap.match.homeTeamId,
        awayTeamId: snap.match.awayTeamId,
        homeExternalId: snap.match.homeTeam.externalId ?? null,
        awayExternalId: snap.match.awayTeam.externalId ?? null,
        homeTeam: snap.match.homeTeam.name,
        awayTeam: snap.match.awayTeam.name,
        homeLogoUrl: snap.match.homeTeam.logoUrl ?? null,
        awayLogoUrl: snap.match.awayTeam.logoUrl ?? null,
        confidence: snap.overallConfidence,
        homeXg: data.homeExpectedGoals ?? 1.3,
        awayXg: data.awayExpectedGoals ?? 1.1,
        hasSnapshotXg,
        predictedScore: snap.predictedResult,
        markets: data.markets ?? [],
      });
    }

    // Sem campeonato: só lista para o select (sem montar bilhetes / sem API remota)
    if (!competitionId) {
      const counts = new Map<string, { competitionId: string | null; competition: string; matchCount: number }>();
      for (const ctx of byMatch.values()) {
        const key = ctx.competitionId ?? ctx.competition;
        const cur = counts.get(key);
        if (cur) cur.matchCount += 1;
        else {
          counts.set(key, {
            competitionId: ctx.competitionId,
            competition: ctx.competition,
            matchCount: 1,
          });
        }
      }
      const competitions = [...counts.values()]
        .sort(
          (a, b) =>
            b.matchCount - a.matchCount ||
            a.competition.localeCompare(b.competition),
        )
        .map((c) => ({ ...c, tickets: [] as unknown[] }));

      return {
        legsPerTicket: maxLegs,
        competitionCount: competitions.length,
        competitions,
      };
    }

    const matches = [...byMatch.values()].slice(0, maxLegs);
    const canRemote = this.dataEngine.isApiFootballConfigured();
    // Free plan ~10 req/min — prioriza H2H para placares
    let remoteBudget = 12;

    const enriched: Array<{
      m: MatchCtx;
      h2h: H2HStats;
      exact: ReturnType<typeof suggestExactScoreFromAnalysis>;
      homeForm: ComputedTeamStats;
      awayForm: ComputedTeamStats;
      oneXTwo: OneXTwoIndex;
    }> = [];
    for (const m of matches) {
      let h2h = await this.statisticsEngine.getH2H(
        m.homeTeamId,
        m.awayTeamId,
        10,
      );
      let homeForm = await this.statisticsEngine.computeTeamStats(
        m.homeTeamId,
        10,
        'home',
      );
      let awayForm = await this.statisticsEngine.computeTeamStats(
        m.awayTeamId,
        10,
        'away',
      );
      if (homeForm.matchesPlayed < 2) {
        homeForm = await this.statisticsEngine.computeTeamStats(
          m.homeTeamId,
          10,
          'all',
        );
      }
      if (awayForm.matchesPlayed < 2) {
        awayForm = await this.statisticsEngine.computeTeamStats(
          m.awayTeamId,
          10,
          'all',
        );
      }

      // Busca H2H/forma na API quando o banco local não tem amostra
      if (
        canRemote &&
        remoteBudget > 0 &&
        h2h.totalGames === 0 &&
        m.homeExternalId &&
        m.awayExternalId
      ) {
        try {
          remoteBudget -= 1;
          const remote = await this.dataEngine.fetchRemoteH2H(
            m.homeExternalId,
            m.awayExternalId,
            10,
          );
          if (remote.length) {
            h2h = h2hFromRemoteScores(remote);
          }
        } catch {
          // rate limit / rede — segue com o que houver
        }
      }
      if (
        canRemote &&
        remoteBudget > 0 &&
        homeForm.source === 'fallback' &&
        m.homeExternalId
      ) {
        try {
          remoteBudget -= 1;
          const remote = await this.dataEngine.fetchRemoteTeamForm(
            m.homeExternalId,
            10,
          );
          if (remote.length) {
            homeForm = formFromRemoteResults(remote, m.homeTeamId, 'all');
          }
        } catch {
          /* ignore */
        }
      }
      if (
        canRemote &&
        remoteBudget > 0 &&
        awayForm.source === 'fallback' &&
        m.awayExternalId
      ) {
        try {
          remoteBudget -= 1;
          const remote = await this.dataEngine.fetchRemoteTeamForm(
            m.awayExternalId,
            10,
          );
          if (remote.length) {
            awayForm = formFromRemoteResults(remote, m.awayTeamId, 'all');
          }
        } catch {
          /* ignore */
        }
      }

      const oneXTwo = index1x2Markets(m);
      const exact = suggestExactScoreFromAnalysis({
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        h2h,
        homeForm,
        awayForm,
        snapshotHomeXg: m.homeXg,
        snapshotAwayXg: m.awayXg,
        hasSnapshotXg: m.hasSnapshotXg,
        predictedScore: m.predictedScore,
        oneXTwo,
      });
      enriched.push({ m, h2h, exact, homeForm, awayForm, oneXTwo });
    }

    // 6 variações operacionais (bilhete-variacoes-brasileirao.md)
    const profileTickets = VARIATION_PROFILES.map((profile) => {
      const legs = enriched
        .map(({ m, oneXTwo, h2h }, index) => {
          const pick = pick1x2ForProfile(profile.id, oneXTwo, h2h, index);
          if (!pick) return null;
          const selectionLabel =
            pick.selection === 'Casa'
              ? m.homeTeam
              : pick.selection === 'Fora'
                ? m.awayTeam
                : 'Empate';
          return {
            matchId: m.matchId,
            matchLabel: m.matchLabel,
            competition: m.competition,
            homeTeam: m.homeTeam,
            awayTeam: m.awayTeam,
            homeLogoUrl: m.homeLogoUrl,
            awayLogoUrl: m.awayLogoUrl,
            marketType: 'MATCH_RESULT',
            market: 'Resultado Final',
            selection: pick.selection,
            selectionLabel,
            score: null as string | null,
            probability: pick.probability,
            fairOdd: pick.fairOdd,
            bookmakerOdd: pick.bookmakerOdd,
            ev: pick.ev,
            confidence: pick.confidence,
            recommendation: pick.recommendation,
            why: `${profile.name}: ${selectionLabel} · odd ${pick.bookmakerOdd.toFixed(2)} · EV ${(pick.ev * 100).toFixed(1)}%${h2h.totalGames ? ` · H2H ${h2h.homeWins}-${h2h.draws}-${h2h.awayWins}` : ''}`,
            oddSource: 'bookmaker' as const,
          };
        })
        .filter((x): x is NonNullable<typeof x> => x != null);

      return buildLeagueTicket(
        profile.id,
        `B${profile.code} ${profile.name} · ${legs.length} jogos`,
        profile.objective,
        'docs/betting/examples/bilhete-variacoes-brasileirao.md',
        legs,
        2,
      );
    });

    // 4 bilhetes de placares exatos (H2H por confronto)
    const placaresTickets = buildPlacaresH2HTickets(enriched);

    // 4 bilhetes pós-análise (temas variáveis entre mercados de docs/betting/markets)
    const analysisTickets = buildDeepAnalysisTickets(
      enriched,
      competitionId ?? matches[0]?.competition ?? 'league',
    );

    const tickets = [
      ...profileTickets,
      ...placaresTickets,
      ...analysisTickets,
    ].filter((t) => t.buildable);

    const competition = matches[0]?.competition ?? 'Sem campeonato';

    return {
      legsPerTicket: maxLegs,
      competitionCount: 1,
      competitions: [
        {
          competitionId: matches[0]?.competitionId ?? competitionId,
          competition,
          matchCount: byMatch.size,
          tickets,
        },
      ],
    };
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

function round3(n: number) {
  return Math.round(n * 1000) / 1000;
}

type OneXTwoPick = {
  selection: 'Casa' | 'Empate' | 'Fora';
  probability: number;
  fairOdd: number;
  bookmakerOdd: number;
  ev: number;
  confidence: number;
  recommendation: string;
};

type OneXTwoIndex = {
  Casa: OneXTwoPick | null;
  Empate: OneXTwoPick | null;
  Fora: OneXTwoPick | null;
};

const VARIATION_PROFILES = [
  {
    id: 'seguro',
    code: '01',
    name: 'Seguro',
    objective: '1X2 conservador (favorito) · odd 1,40–2,00 · stake 1,5%',
  },
  {
    id: 'medio',
    code: '02',
    name: 'Médio',
    objective: 'Mix resultado + empate como hedge · odd 2,00–3,50 · stake 1%',
  },
  {
    id: 'equilibrado',
    code: '03',
    name: 'Equilibrado',
    objective: 'Resultado direto com risco moderado · odd 2,50–4,00 · stake 1%',
  },
  {
    id: 'variacao',
    code: '04',
    name: 'Variação',
    objective: 'Alternar mandante/visitante vs favorito · odd 3,00–5,00 · stake 0,75%',
  },
  {
    id: 'agressivo',
    code: '05',
    name: 'Agressivo',
    objective: 'Zebra / resultado estreito · odd 6,00–15,00 · stake 0,25–0,5%',
  },
  {
    id: 'protecao',
    code: '06',
    name: 'Proteção',
    objective: 'Favorito ou empate · odd 1,50–2,20 · stake 1–1,5%',
  },
] as const;

function h2hFromRemoteScores(
  rows: Array<{ homeGoals: number; awayGoals: number }>,
): H2HStats {
  let homeWins = 0;
  let awayWins = 0;
  let draws = 0;
  const lastMeetings: string[] = [];
  for (const r of rows) {
    lastMeetings.push(`${r.homeGoals}-${r.awayGoals}`);
    if (r.homeGoals > r.awayGoals) homeWins++;
    else if (r.homeGoals < r.awayGoals) awayWins++;
    else draws++;
  }
  return {
    homeWins,
    awayWins,
    draws,
    totalGames: rows.length,
    lastMeetings,
  };
}

function formFromRemoteResults(
  rows: Array<{ scored: number; conceded: number }>,
  teamId: string,
  side: 'home' | 'away' | 'all',
): ComputedTeamStats {
  let goalsFor = 0;
  let goalsAgainst = 0;
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let btts = 0;
  let over25 = 0;
  const form: Array<'W' | 'D' | 'L'> = [];

  for (const r of rows) {
    goalsFor += r.scored;
    goalsAgainst += r.conceded;
    if (r.scored > r.conceded) {
      wins++;
      form.push('W');
    } else if (r.scored === r.conceded) {
      draws++;
      form.push('D');
    } else {
      losses++;
      form.push('L');
    }
    if (r.scored > 0 && r.conceded > 0) btts++;
    if (r.scored + r.conceded > 2) over25++;
  }

  const n = rows.length || 1;
  return {
    teamId,
    period: rows.length,
    side,
    matchesPlayed: rows.length,
    wins,
    draws,
    losses,
    avgGoalsFor: goalsFor / n,
    avgGoalsAgainst: goalsAgainst / n,
    form,
    bttsPct: (btts / n) * 100,
    over25Pct: (over25 / n) * 100,
    avgCorners: 5,
    avgShots: 11,
    avgPossession: 50,
    avgXg: goalsFor / n,
    avgXga: goalsAgainst / n,
    avgCards: 2.5,
    source: 'computed',
  };
}

function parseScoreLine(s: string): { h: number; a: number } | null {
  const m = /^(\d+)\s*[-x×]\s*(\d+)$/i.exec(s.trim());
  if (!m) return null;
  return { h: Number(m[1]), a: Number(m[2]) };
}

/** Snapshot λ genérico (fallback) — não diferencia confrontos */
function isGenericSnapshotLambda(homeXg: number, awayXg: number) {
  return (
    Math.abs(homeXg - awayXg) < 0.05 &&
    homeXg > 0.55 &&
    homeXg < 0.85
  );
}

/**
 * λ por confronto a partir das odds 1X2 da casa (diferencia jogos mesmo
 * sem forma/H2H local — evita o mesmo 0-0 em todos).
 */
function expectedGoalsFromBookmaker1x2(
  idx: OneXTwoIndex | null | undefined,
): { home: number; away: number; fav: 'Casa' | 'Empate' | 'Fora'; notes: string } | null {
  if (!idx?.Casa || !idx?.Empate || !idx?.Fora) return null;
  const rawH = 1 / idx.Casa.bookmakerOdd;
  const rawD = 1 / idx.Empate.bookmakerOdd;
  const rawA = 1 / idx.Fora.bookmakerOdd;
  const sum = rawH + rawD + rawA || 1;
  const ph = rawH / sum;
  const pd = rawD / sum;
  const pa = rawA / sum;

  // Menos gols quando o mercado aponta empate; mais quando há favorito claro
  const total = Math.max(1.4, Math.min(3.1, 2.55 - 1.2 * pd + 0.35 * Math.abs(ph - pa)));
  const strength = Math.max(0.15, Math.min(0.85, ph / (ph + pa + 1e-9)));
  let λh = total * strength;
  let λa = total * (1 - strength);
  // Empate alto → equaliza e reduz um pouco
  if (pd >= Math.max(ph, pa)) {
    const mid = (λh + λa) / 2;
    λh = 0.55 * λh + 0.45 * mid;
    λa = 0.55 * λa + 0.45 * mid;
  }
  λh = Math.max(0.35, Math.min(3.2, λh));
  λa = Math.max(0.35, Math.min(3.2, λa));

  const fav =
    idx.Casa.bookmakerOdd <= idx.Empate.bookmakerOdd &&
    idx.Casa.bookmakerOdd <= idx.Fora.bookmakerOdd
      ? ('Casa' as const)
      : idx.Fora.bookmakerOdd <= idx.Empate.bookmakerOdd &&
          idx.Fora.bookmakerOdd <= idx.Casa.bookmakerOdd
        ? ('Fora' as const)
        : ('Empate' as const);

  return {
    home: λh,
    away: λa,
    fav,
    notes: `odds 1X2 ${idx.Casa.bookmakerOdd.toFixed(2)}/${idx.Empate.bookmakerOdd.toFixed(2)}/${idx.Fora.bookmakerOdd.toFixed(2)} → λ ${λh.toFixed(2)}–${λa.toFixed(2)} (fav ${fav})`,
  };
}

function favoriteFromBookmaker1x2(
  idx: OneXTwoIndex | null | undefined,
): 'Casa' | 'Empate' | 'Fora' | null {
  if (!idx?.Casa && !idx?.Empate && !idx?.Fora) return null;
  const opts = [
    idx.Casa ? ({ sel: 'Casa' as const, odd: idx.Casa.bookmakerOdd }) : null,
    idx.Empate ? ({ sel: 'Empate' as const, odd: idx.Empate.bookmakerOdd }) : null,
    idx.Fora ? ({ sel: 'Fora' as const, odd: idx.Fora.bookmakerOdd }) : null,
  ].filter((x): x is { sel: 'Casa' | 'Empate' | 'Fora'; odd: number } => x != null);
  if (!opts.length) return null;
  opts.sort((a, b) => a.odd - b.odd);
  return opts[0].sel;
}

/**
 * Análise de placar por confronto (H2H → forma → odds 1X2 do jogo).
 * Devolve até 4 variantes distintas para montar bilhetes de placares.
 */
function analyzeExactScoreVariants(input: {
  homeTeam: string;
  awayTeam: string;
  h2h: H2HStats;
  homeForm: ComputedTeamStats;
  awayForm: ComputedTeamStats;
  snapshotHomeXg: number;
  snapshotAwayXg: number;
  hasSnapshotXg: boolean;
  predictedScore?: string | null;
  oneXTwo?: OneXTwoIndex | null;
}): Array<{
  score: string;
  selectionLabel: string;
  probability: number;
  fairOdd: number;
  confidence: number;
  dataQuality: number;
  why: string;
  variant: 'primary' | 'h2h_mode' | 'alt' | 'longshot';
}> | null {
  const { h2h, homeForm, awayForm } = input;
  const h2hScores = h2h.lastMeetings
    .map(parseScoreLine)
    .filter((x): x is { h: number; a: number } => x != null);

  const hasForm =
    homeForm.source === 'computed' &&
    awayForm.source === 'computed' &&
    homeForm.matchesPlayed >= 1 &&
    awayForm.matchesPlayed >= 1;
  const hasH2h = h2hScores.length >= 1;
  const snapshotUsable =
    input.hasSnapshotXg &&
    !isGenericSnapshotLambda(input.snapshotHomeXg, input.snapshotAwayXg);
  const fromOdds = expectedGoalsFromBookmaker1x2(input.oneXTwo);
  const predicted = input.predictedScore
    ? parseScoreLine(input.predictedScore)
    : null;

  if (!hasForm && !hasH2h && !snapshotUsable && !fromOdds) {
    return null;
  }

  const notes: string[] = [];
  let λh: number;
  let λa: number;
  let dataQuality = 0;

  // Prioridade: H2H real → forma real → odds do confronto → snapshot útil
  if (hasH2h) {
    const avgH =
      h2hScores.reduce((s, p) => s + p.h, 0) / h2hScores.length;
    const avgA =
      h2hScores.reduce((s, p) => s + p.a, 0) / h2hScores.length;
    λh = Math.max(0.25, avgH);
    λa = Math.max(0.25, avgA);
    dataQuality += 45 + Math.min(30, h2hScores.length * 5);
    notes.push(
      `H2H ${h2h.totalGames}j (${h2h.homeWins}-${h2h.draws}-${h2h.awayWins}): ${h2h.lastMeetings.slice(0, 6).join(', ')}`,
    );

    if (hasForm) {
      const fromForm = calculateExpectedGoals(
        homeForm.avgGoalsFor,
        homeForm.avgGoalsAgainst,
        awayForm.avgGoalsFor,
        awayForm.avgGoalsAgainst,
      );
      λh = 0.55 * λh + 0.45 * fromForm.home;
      λa = 0.55 * λa + 0.45 * fromForm.away;
      dataQuality += Math.min(
        20,
        homeForm.matchesPlayed + awayForm.matchesPlayed,
      );
      notes.push(
        `forma casa ${homeForm.avgGoalsFor.toFixed(2)}/${homeForm.avgGoalsAgainst.toFixed(2)} · fora ${awayForm.avgGoalsFor.toFixed(2)}/${awayForm.avgGoalsAgainst.toFixed(2)}`,
      );
    } else if (fromOdds) {
      λh = 0.6 * λh + 0.4 * fromOdds.home;
      λa = 0.6 * λa + 0.4 * fromOdds.away;
      dataQuality += 18;
      notes.push(fromOdds.notes);
    }
  } else if (hasForm) {
    const fromForm = calculateExpectedGoals(
      homeForm.avgGoalsFor,
      homeForm.avgGoalsAgainst,
      awayForm.avgGoalsFor,
      awayForm.avgGoalsAgainst,
    );
    λh = fromForm.home;
    λa = fromForm.away;
    dataQuality +=
      50 + Math.min(25, homeForm.matchesPlayed + awayForm.matchesPlayed);
    notes.push(
      `forma ${input.homeTeam}: ${homeForm.avgGoalsFor.toFixed(2)}/${homeForm.avgGoalsAgainst.toFixed(2)} · ${input.awayTeam}: ${awayForm.avgGoalsFor.toFixed(2)}/${awayForm.avgGoalsAgainst.toFixed(2)}`,
    );
    if (fromOdds) {
      λh = 0.65 * λh + 0.35 * fromOdds.home;
      λa = 0.65 * λa + 0.35 * fromOdds.away;
      dataQuality += 12;
      notes.push(fromOdds.notes);
    }
  } else if (fromOdds) {
    λh = fromOdds.home;
    λa = fromOdds.away;
    dataQuality += 42;
    notes.push(fromOdds.notes);
  } else if (snapshotUsable) {
    λh = input.snapshotHomeXg;
    λa = input.snapshotAwayXg;
    dataQuality += 35;
    notes.push(`λ snapshot ${λh.toFixed(2)}–${λa.toFixed(2)}`);
  } else {
    return null;
  }

  if (snapshotUsable && (hasH2h || hasForm || fromOdds)) {
    λh = 0.85 * λh + 0.15 * input.snapshotHomeXg;
    λa = 0.85 * λa + 0.15 * input.snapshotAwayXg;
  }

  const matrix = scoreMatrix(λh, λa);
  const cells: Array<{ home: number; away: number; probability: number }> =
    [];
  for (let h = 0; h < matrix.length; h++) {
    for (let a = 0; a < matrix[h].length; a++) {
      cells.push({ home: h, away: a, probability: matrix[h][a] });
    }
  }
  cells.sort((a, b) => b.probability - a.probability);
  const top = cells.slice(0, 10);

  let h2hMode: { h: number; a: number } | null = null;
  if (h2hScores.length) {
    const counts = new Map<string, number>();
    for (const s of h2hScores) {
      const k = `${s.h}-${s.a}`;
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    let best = 0;
    for (const [k, n] of counts) {
      if (n > best) {
        best = n;
        const [hh, aa] = k.split('-').map(Number);
        h2hMode = { h: hh, a: aa };
      }
    }
    if (h2hMode) notes.push(`moda H2H ${h2hMode.h}-${h2hMode.a} (${best}x)`);
  }

  const fav1x2 = favoriteFromBookmaker1x2(input.oneXTwo) ?? fromOdds?.fav;
  if (fav1x2) notes.push(`favorito casa (odd) ${fav1x2}`);
  if (predicted && !isGenericSnapshotLambda(input.snapshotHomeXg, input.snapshotAwayXg)) {
    notes.push(`predito ${predicted.h}-${predicted.a}`);
  }

  const scored = top.map((cell) => {
    let boost = 0;
    if (
      predicted &&
      !isGenericSnapshotLambda(input.snapshotHomeXg, input.snapshotAwayXg) &&
      cell.home === predicted.h &&
      cell.away === predicted.a
    ) {
      boost += 0.035;
    }
    if (h2hMode && cell.home === h2hMode.h && cell.away === h2hMode.a) {
      boost += 0.05;
    }
    if (fav1x2 === 'Casa' && cell.home > cell.away) boost += 0.03;
    if (fav1x2 === 'Fora' && cell.away > cell.home) boost += 0.03;
    if (fav1x2 === 'Empate' && cell.home === cell.away) boost += 0.035;
    if (fav1x2 === 'Casa' && cell.home === cell.away + 1) boost += 0.018;
    if (fav1x2 === 'Fora' && cell.away === cell.home + 1) boost += 0.018;
    if (fav1x2 === 'Casa' && cell.home === cell.away + 2) boost += 0.01;
    if (fav1x2 === 'Fora' && cell.away === cell.home + 2) boost += 0.01;
    return { ...cell, rank: cell.probability + boost };
  });
  scored.sort((a, b) => b.rank - a.rank);

  const toPick = (
    cell: { home: number; away: number; probability: number },
    variant: 'primary' | 'h2h_mode' | 'alt' | 'longshot',
    extraWhy: string,
  ) => {
    const score = `${cell.home}-${cell.away}`;
    const selectionLabel =
      cell.home === cell.away
        ? `Empate ${score}`
        : cell.home > cell.away
          ? `${input.homeTeam} ${score}`
          : `${input.awayTeam} ${score}`;
    return {
      score,
      selectionLabel,
      probability: round3(cell.probability),
      fairOdd: round3(cell.probability > 0 ? 1 / cell.probability : 99),
      confidence: Math.min(92, Math.round(40 + dataQuality * 0.4)),
      dataQuality,
      why: `Placar ${score} (P=${(cell.probability * 100).toFixed(1)}%, λ ${λh.toFixed(2)}–${λa.toFixed(2)}) · ${extraWhy} · ${notes.join(' · ')}`,
      variant,
    };
  };

  const used = new Set<string>();
  const out: Array<{
    score: string;
    selectionLabel: string;
    probability: number;
    fairOdd: number;
    confidence: number;
    dataQuality: number;
    why: string;
    variant: 'primary' | 'h2h_mode' | 'alt' | 'longshot';
  }> = [];

  const pushUnique = (
    cell: { home: number; away: number; probability: number } | undefined,
    variant: 'primary' | 'h2h_mode' | 'alt' | 'longshot',
    extraWhy: string,
  ) => {
    if (!cell) return;
    const key = `${cell.home}-${cell.away}`;
    if (used.has(key)) return;
    used.add(key);
    out.push(toPick(cell, variant, extraWhy));
  };

  pushUnique(scored[0], 'primary', 'principal do confronto');

  if (h2hMode) {
    const modeCell =
      scored.find((c) => c.home === h2hMode!.h && c.away === h2hMode!.a) ??
      top.find((c) => c.home === h2hMode!.h && c.away === h2hMode!.a);
    pushUnique(modeCell, 'h2h_mode', 'moda dos confrontos diretos');
  } else if (fav1x2) {
    // Sem H2H: 2ª hipótese alinhada ao favorito das odds
    const aligned = scored.find((c) => {
      const key = `${c.home}-${c.away}`;
      if (used.has(key)) return false;
      if (fav1x2 === 'Casa') return c.home > c.away;
      if (fav1x2 === 'Fora') return c.away > c.home;
      return c.home === c.away;
    });
    pushUnique(aligned ?? scored[1], 'h2h_mode', 'alternativa alinhada ao favorito 1X2');
  }

  pushUnique(scored[1] ?? top[1], 'alt', '2ª célula Poisson do confronto');

  const longshot = [...scored]
    .filter((c) => c.probability >= 0.04 && c.probability <= 0.12)
    .sort((a, b) => a.probability - b.probability)[0];
  pushUnique(
    longshot ?? scored[2] ?? top[2],
    'longshot',
    'maior odd ainda suportada pelo modelo do confronto',
  );

  return out.length ? out : null;
}

function suggestExactScoreFromAnalysis(input: {
  homeTeam: string;
  awayTeam: string;
  h2h: H2HStats;
  homeForm: ComputedTeamStats;
  awayForm: ComputedTeamStats;
  snapshotHomeXg: number;
  snapshotAwayXg: number;
  hasSnapshotXg: boolean;
  predictedScore?: string | null;
  oneXTwo?: OneXTwoIndex | null;
}): {
  score: string;
  selectionLabel: string;
  probability: number;
  fairOdd: number;
  confidence: number;
  dataQuality: number;
  why: string;
} | null {
  const variants = analyzeExactScoreVariants(input);
  if (!variants?.length) return null;
  const primary = variants[0];
  return {
    score: primary.score,
    selectionLabel: primary.selectionLabel,
    probability: primary.probability,
    fairOdd: primary.fairOdd,
    confidence: primary.confidence,
    dataQuality: primary.dataQuality,
    why: primary.why,
  };
}

/**
 * 4 bilhetes de Resultado Correto — placares por confronto H2H.
 */
function buildPlacaresH2HTickets(
  enriched: Array<{
    m: {
      matchId: string;
      matchLabel: string;
      competition: string;
      homeTeam: string;
      awayTeam: string;
      homeLogoUrl: string | null;
      awayLogoUrl: string | null;
      homeXg: number;
      awayXg: number;
      hasSnapshotXg: boolean;
      predictedScore: string | null;
    };
    h2h: H2HStats;
    homeForm: ComputedTeamStats;
    awayForm: ComputedTeamStats;
    oneXTwo: OneXTwoIndex;
  }>,
) {
  type Row = {
    m: (typeof enriched)[number]['m'];
    h2h: H2HStats;
    variants: NonNullable<ReturnType<typeof analyzeExactScoreVariants>>;
  };

  const rows: Row[] = [];
  for (const row of enriched) {
    const variants = analyzeExactScoreVariants({
      homeTeam: row.m.homeTeam,
      awayTeam: row.m.awayTeam,
      h2h: row.h2h,
      homeForm: row.homeForm,
      awayForm: row.awayForm,
      snapshotHomeXg: row.m.homeXg,
      snapshotAwayXg: row.m.awayXg,
      hasSnapshotXg: row.m.hasSnapshotXg,
      predictedScore: row.m.predictedScore,
      oneXTwo: row.oneXTwo,
    });
    if (!variants?.length) continue;
    rows.push({ m: row.m, h2h: row.h2h, variants });
  }

  rows.sort(
    (a, b) =>
      b.h2h.totalGames - a.h2h.totalGames ||
      b.variants[0].dataQuality - a.variants[0].dataQuality,
  );

  const profiles: Array<{
    id: string;
    code: string;
    name: string;
    variant: 'primary' | 'h2h_mode' | 'alt' | 'longshot';
    objective: string;
  }> = [
    {
      id: 'placar-1',
      code: '01',
      name: 'H2H principal',
      variant: 'primary',
      objective:
        'Placar mais suportado pelo confronto (H2H + forma) — stake 0,25–0,5%',
    },
    {
      id: 'placar-2',
      code: '02',
      name: 'Moda / favorito',
      variant: 'h2h_mode',
      objective:
        'Moda H2H ou placar alinhado ao favorito das odds — stake 0,25–0,5%',
    },
    {
      id: 'placar-3',
      code: '03',
      name: 'Alternativa',
      variant: 'alt',
      objective:
        '2ª hipótese Poisson do confronto (cobertura) — stake 0,25%',
    },
    {
      id: 'placar-4',
      code: '04',
      name: 'Long shot',
      variant: 'longshot',
      objective:
        'Placar de maior odd ainda alinhado ao modelo H2H — stake 0,15–0,25%',
    },
  ];

  return profiles.map((profile, idx) => {
    const start = rows.length ? idx % rows.length : 0;
    const ordered = rows.length
      ? [...rows.slice(start), ...rows.slice(0, start)]
      : [];
    const targetLegs = Math.min(
      3,
      Math.max(1, ordered.filter((r) => r.h2h.totalGames > 0).length || ordered.length),
    );

    const legs = [];
    const usedScoresInTicket = new Set<string>();
    for (const row of ordered) {
      if (legs.length >= targetLegs) break;
      let pick =
        row.variants.find((v) => v.variant === profile.variant) ??
        row.variants[0];
      // Evita o mesmo placar em todas as pernas quando o confronto tem alternativa
      if (usedScoresInTicket.has(pick.score)) {
        const different = row.variants.find(
          (v) => !usedScoresInTicket.has(v.score),
        );
        if (different) pick = different;
      }
      usedScoresInTicket.add(pick.score);
      legs.push({
        matchId: row.m.matchId,
        matchLabel: row.m.matchLabel,
        competition: row.m.competition,
        homeTeam: row.m.homeTeam,
        awayTeam: row.m.awayTeam,
        homeLogoUrl: row.m.homeLogoUrl,
        awayLogoUrl: row.m.awayLogoUrl,
        marketType: 'EXACT_SCORE',
        market: 'Resultado Correto',
        selection: pick.selectionLabel,
        selectionLabel: pick.selectionLabel,
        score: pick.score,
        probability: pick.probability,
        fairOdd: pick.fairOdd,
        bookmakerOdd: pick.fairOdd,
        ev: 0,
        confidence: pick.confidence,
        recommendation: pick.probability >= 0.1 ? 'WATCH' : 'SKIP',
        why: pick.why,
        oddSource: 'model_fair' as const,
      });
    }

    return buildLeagueTicket(
      profile.id,
      `P${profile.code} ${profile.name} · ${legs.length} jogos`,
      profile.objective,
      'docs/betting/examples/bilhete-placares.md',
      legs,
      1,
    );
  });
}

/** Temas alinhados a docs/betting/markets — usados nas 3 sugestões pós-análise */
type MarketDocTheme = {
  id: string;
  label: string;
  stakeHint: string;
  docPath: string;
  types: string[] | null;
  allowExactScore: boolean;
};

const MARKET_DOC_THEMES: MarketDocTheme[] = [
  {
    id: 'resultados',
    label: 'Resultados',
    stakeHint: '0,75–1,5%',
    docPath: 'docs/betting/markets/01-resultados.md',
    types: [
      'MATCH_RESULT',
      'DOUBLE_CHANCE',
      'HT_RESULT',
      'HT_FT',
      'HANDICAP',
    ],
    allowExactScore: true,
  },
  {
    id: 'gols',
    label: 'Gols',
    stakeHint: '0,5–1%',
    docPath: 'docs/betting/markets/02-gols.md',
    types: ['OVER_UNDER', 'BTTS', 'HT_OVER_UNDER'],
    allowExactScore: false,
  },
  {
    id: 'escanteios',
    label: 'Escanteios',
    stakeHint: '0,5–1%',
    docPath: 'docs/betting/markets/03-escanteios.md',
    types: ['CORNERS'],
    allowExactScore: false,
  },
  {
    id: 'cartoes',
    label: 'Cartões',
    stakeHint: '0,5–1%',
    docPath: 'docs/betting/markets/04-cartoes-faltas.md',
    types: ['CARDS'],
    allowExactScore: false,
  },
  {
    id: 'chutes',
    label: 'Chutes',
    stakeHint: '0,5–1%',
    docPath: 'docs/betting/markets/05-chutes.md',
    types: ['SHOTS', 'SHOTS_ON_TARGET', 'GOALKEEPER_SAVES'],
    allowExactScore: false,
  },
  {
    id: 'jogador',
    label: 'Jogador',
    stakeHint: '0,25–0,75%',
    docPath: 'docs/betting/markets/06-estatisticas-jogador.md',
    types: ['PLAYER', 'PLAYER_SHOTS', 'FIRST_SCORER'],
    allowExactScore: false,
  },
  {
    id: 'intervalos',
    label: '1º/2º tempo',
    stakeHint: '0,5–1%',
    docPath: 'docs/betting/markets/08-primeiro-segundo-tempo.md',
    types: ['HT_RESULT', 'HT_OVER_UNDER', 'HT_FT'],
    allowExactScore: false,
  },
  {
    id: 'misto',
    label: 'Mix mercados',
    stakeHint: '0,5–1%',
    docPath: 'docs/betting/markets',
    types: null,
    allowExactScore: true,
  },
];

type AnalysisLeg = {
  matchId: string;
  matchLabel: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  homeLogoUrl: string | null;
  awayLogoUrl: string | null;
  marketType: string;
  market: string;
  selection: string;
  selectionLabel: string;
  score: string | null;
  probability: number;
  fairOdd: number;
  bookmakerOdd: number;
  ev: number;
  confidence: number;
  recommendation: string;
  why: string;
  oddSource: 'bookmaker' | 'model_fair';
  _score: number;
  _themeKey: string;
};

function marketCategoryLabel(marketType: string): string {
  const t = marketType.toUpperCase();
  const map: Record<string, string> = {
    MATCH_RESULT: 'Resultado Final',
    OVER_UNDER: 'Total de Gols',
    BTTS: 'Ambas Marcam',
    CORNERS: 'Escanteios',
    CARDS: 'Cartões',
    HANDICAP: 'Handicap',
    PLAYER: 'Jogador',
    SHOTS: 'Chutes',
    SHOTS_ON_TARGET: 'Chutes no Gol',
    GOALKEEPER_SAVES: 'Defesas',
    PLAYER_SHOTS: 'Chutes do Jogador',
    DOUBLE_CHANCE: 'Chance Dupla',
    HT_RESULT: 'Resultado 1º Tempo',
    HT_OVER_UNDER: 'Gols 1º Tempo',
    HT_FT: 'Intervalo/Final',
    FIRST_SCORER: 'Primeiro Marcador',
    EXACT_SCORE: 'Resultado Correto',
  };
  return map[t] ?? t;
}

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  let s = seed || 1;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function analysisLegScore(input: {
  ev: number;
  confidence: number;
  recommendation: string;
  dataQuality?: number;
}): number {
  let s = input.ev * 100 + input.confidence * 0.2;
  if (input.recommendation === 'BET') s += 10;
  else if (input.recommendation === 'WATCH') s += 4;
  if (input.dataQuality != null) s += input.dataQuality * 0.15;
  return s;
}

function collectAnalysisPool(
  enriched: Array<{
    m: {
      matchId: string;
      matchLabel: string;
      competition: string;
      homeTeam: string;
      awayTeam: string;
      homeLogoUrl: string | null;
      awayLogoUrl: string | null;
      markets: Array<{
        marketType: string;
        selection: string;
        probability: number;
        fairOdd: number;
        bookmakerOdd: number;
        ev: number;
        confidence: number;
        recommendation: string;
      }>;
    };
    h2h: H2HStats;
    exact: ReturnType<typeof suggestExactScoreFromAnalysis>;
  }>,
): AnalysisLeg[] {
  const pool: AnalysisLeg[] = [];

  for (const { m, h2h, exact } of enriched) {
    for (const x of m.markets) {
      const type = (x.marketType ?? '').toUpperCase();
      if (!type) continue;
      const eligible =
        x.recommendation === 'BET' ||
        (x.recommendation === 'WATCH' && x.ev > 0.015) ||
        x.ev > 0.03;
      if (!eligible) continue;

      const selectionLabel =
        x.selection === 'Casa'
          ? m.homeTeam
          : x.selection === 'Fora'
            ? m.awayTeam
            : x.selection;
      const market = marketCategoryLabel(type);
      pool.push({
        matchId: m.matchId,
        matchLabel: m.matchLabel,
        competition: m.competition,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        homeLogoUrl: m.homeLogoUrl,
        awayLogoUrl: m.awayLogoUrl,
        marketType: type,
        market,
        selection: x.selection,
        selectionLabel,
        score: null,
        probability: x.probability,
        fairOdd: x.fairOdd,
        bookmakerOdd: x.bookmakerOdd,
        ev: x.ev,
        confidence: x.confidence,
        recommendation: x.recommendation,
        why: `${market} · ${selectionLabel} · EV ${(x.ev * 100).toFixed(1)}% · odd ${x.bookmakerOdd.toFixed(2)}${h2h.totalGames ? ` · H2H ${h2h.homeWins}-${h2h.draws}-${h2h.awayWins}` : ''}`,
        oddSource: 'bookmaker',
        _score: analysisLegScore(x),
        _themeKey: type,
      });
    }

    if (exact && exact.dataQuality >= 40) {
      pool.push({
        matchId: m.matchId,
        matchLabel: m.matchLabel,
        competition: m.competition,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        homeLogoUrl: m.homeLogoUrl,
        awayLogoUrl: m.awayLogoUrl,
        marketType: 'EXACT_SCORE',
        market: 'Resultado Correto',
        selection: exact.selectionLabel,
        selectionLabel: exact.selectionLabel,
        score: exact.score,
        probability: exact.probability,
        fairOdd: exact.fairOdd,
        bookmakerOdd: exact.fairOdd,
        ev: 0,
        confidence: exact.confidence,
        recommendation: exact.probability >= 0.1 ? 'WATCH' : 'SKIP',
        why: exact.why,
        oddSource: 'model_fair',
        _score: analysisLegScore({
          ev: Math.max(0, exact.probability - 0.08),
          confidence: exact.confidence,
          recommendation: exact.probability >= 0.12 ? 'WATCH' : 'SKIP',
          dataQuality: exact.dataQuality,
        }),
        _themeKey: 'EXACT_SCORE',
      });
    }
  }

  return pool.sort((a, b) => b._score - a._score);
}

function pickLegsForTheme(
  pool: AnalysisLeg[],
  theme: MarketDocTheme,
  usedKeys: Set<string>,
  targetLegs: number,
): AnalysisLeg[] {
  const matchesTheme = (leg: AnalysisLeg) => {
    if (theme.types == null) return true;
    if (leg.marketType === 'EXACT_SCORE') return theme.allowExactScore;
    return theme.types.includes(leg.marketType);
  };

  const preferred = pool.filter(
    (leg) =>
      matchesTheme(leg) &&
      !usedKeys.has(`${leg.matchId}|${leg.marketType}|${leg.selection}`),
  );
  const fallback = pool.filter(
    (leg) =>
      !usedKeys.has(`${leg.matchId}|${leg.marketType}|${leg.selection}`),
  );

  const legs: AnalysisLeg[] = [];
  const usedMatches = new Set<string>();
  const usedTypes = new Set<string>();

  const tryPick = (candidates: AnalysisLeg[]) => {
    for (const leg of candidates) {
      if (legs.length >= targetLegs) break;
      if (usedMatches.has(leg.matchId)) continue;
      // Prefer diversificar tipo de mercado dentro do bilhete
      if (
        usedTypes.has(leg.marketType) &&
        candidates.some(
          (c) =>
            !usedMatches.has(c.matchId) &&
            !usedTypes.has(c.marketType) &&
            !usedKeys.has(`${c.matchId}|${c.marketType}|${c.selection}`),
        )
      ) {
        continue;
      }
      legs.push(leg);
      usedMatches.add(leg.matchId);
      usedTypes.add(leg.marketType);
      usedKeys.add(`${leg.matchId}|${leg.marketType}|${leg.selection}`);
    }
  };

  tryPick(preferred);
  if (legs.length < targetLegs) tryPick(fallback);
  return legs;
}

/**
 * 4 bilhetes com temas sorteados entre docs/betting/markets,
 * montados só com seleções que passaram na análise (EV/confiança/H2H/placar).
 */
function buildDeepAnalysisTickets(
  enriched: Array<{
    m: {
      matchId: string;
      matchLabel: string;
      competition: string;
      homeTeam: string;
      awayTeam: string;
      homeLogoUrl: string | null;
      awayLogoUrl: string | null;
      markets: Array<{
        marketType: string;
        selection: string;
        probability: number;
        fairOdd: number;
        bookmakerOdd: number;
        ev: number;
        confidence: number;
        recommendation: string;
      }>;
    };
    h2h: H2HStats;
    exact: ReturnType<typeof suggestExactScoreFromAnalysis>;
  }>,
  seedKey: string,
) {
  const pool = collectAnalysisPool(enriched);
  const day = new Date().toISOString().slice(0, 10);
  const themes = seededShuffle(
    [...MARKET_DOC_THEMES],
    hashSeed(`${seedKey}:${day}`),
  ).slice(0, 4);

  const usedKeys = new Set<string>();
  return themes.map((theme, idx) => {
    const sizeSeed = hashSeed(`${seedKey}:${day}:${theme.id}:${idx}`);
    // Tamanho variável 1–5 conforme tema/dia e qualidade do pool
    const targetLegs = Math.min(
      5,
      Math.max(1, 1 + (sizeSeed % 5)),
    );
    const rawLegs = pickLegsForTheme(pool, theme, usedKeys, targetLegs);
    const legs = rawLegs.map(({ _score: _s, _themeKey: _t, ...leg }) => leg);
    const marketsUsed = [...new Set(rawLegs.map((l) => l.market))].join(', ');
    return buildLeagueTicket(
      `analise-${idx + 1}`,
      `${theme.label} · ${legs.length} seleções`,
      `Pós-análise · ${marketsUsed || theme.label} — stake ${theme.stakeHint}`,
      theme.docPath,
      legs,
      1,
    );
  });
}

function index1x2Markets(m: {
  markets: Array<{
    marketType: string;
    selection: string;
    probability: number;
    fairOdd: number;
    bookmakerOdd: number;
    ev: number;
    confidence: number;
    recommendation: string;
  }>;
}): OneXTwoIndex {
  const empty: OneXTwoIndex = { Casa: null, Empate: null, Fora: null };
  for (const x of m.markets) {
    if ((x.marketType ?? '').toUpperCase() !== 'MATCH_RESULT') continue;
    if (
      x.selection !== 'Casa' &&
      x.selection !== 'Empate' &&
      x.selection !== 'Fora'
    ) {
      continue;
    }
    empty[x.selection] = {
      selection: x.selection,
      probability: x.probability,
      fairOdd: x.fairOdd,
      bookmakerOdd: x.bookmakerOdd,
      ev: x.ev,
      confidence: x.confidence,
      recommendation: x.recommendation,
    };
  }
  return empty;
}

function pick1x2ForProfile(
  profileId: (typeof VARIATION_PROFILES)[number]['id'],
  idx: OneXTwoIndex,
  h2h: {
    homeWins: number;
    awayWins: number;
    draws: number;
    totalGames: number;
  },
  matchIndex: number,
): OneXTwoPick | null {
  const options = [idx.Casa, idx.Empate, idx.Fora].filter(
    (x): x is OneXTwoPick => x != null,
  );
  if (!options.length) return null;

  const byProb = [...options].sort((a, b) => b.probability - a.probability);
  const byOddAsc = [...options].sort(
    (a, b) => a.bookmakerOdd - b.bookmakerOdd,
  );
  const favorite = byProb[0];
  const underdog =
    options.find((o) => o.selection !== 'Empate' && o !== favorite) ??
    byOddAsc[byOddAsc.length - 1];
  const draw = idx.Empate;

  let h2hLean: 'Casa' | 'Empate' | 'Fora' | null = null;
  if (h2h.totalGames >= 3) {
    if (h2h.homeWins >= h2h.awayWins && h2h.homeWins >= h2h.draws) {
      h2hLean = 'Casa';
    } else if (h2h.awayWins >= h2h.homeWins && h2h.awayWins >= h2h.draws) {
      h2hLean = 'Fora';
    } else {
      h2hLean = 'Empate';
    }
  }

  switch (profileId) {
    case 'seguro': {
      const safe = byOddAsc.find(
        (o) =>
          o.selection !== 'Empate' &&
          o.bookmakerOdd <= 2.05 &&
          o.probability >= 0.38,
      );
      return safe ?? favorite;
    }
    case 'medio': {
      if (matchIndex % 2 === 1 && draw) return draw;
      return favorite.selection === 'Empate' ? underdog ?? favorite : favorite;
    }
    case 'equilibrado': {
      if (h2hLean && idx[h2hLean]) return idx[h2hLean]!;
      return byProb.find((o) => o.selection !== 'Empate') ?? favorite;
    }
    case 'variacao': {
      if (matchIndex % 2 === 0 && draw) return draw;
      return underdog ?? draw ?? favorite;
    }
    case 'agressivo': {
      const zebra = [...options]
        .filter((o) => o.selection !== favorite.selection)
        .sort((a, b) => b.bookmakerOdd - a.bookmakerOdd)[0];
      return zebra ?? underdog ?? draw ?? favorite;
    }
    case 'protecao': {
      const favLow = byOddAsc.find((o) => o.selection !== 'Empate');
      if (favLow && favLow.bookmakerOdd <= 2.2) return favLow;
      return draw ?? favLow ?? favorite;
    }
    default:
      return favorite;
  }
}

function buildLeagueTicket(
  id: string,
  title: string,
  objective: string,
  docPath: string,
  legs: Array<{
    matchId: string;
    matchLabel: string;
    competition: string;
    homeTeam: string;
    awayTeam: string;
    homeLogoUrl: string | null;
    awayLogoUrl: string | null;
    marketType: string;
    market: string;
    selection: string;
    selectionLabel?: string;
    score: string | null;
    probability: number;
    fairOdd: number;
    bookmakerOdd: number;
    ev: number;
    confidence: number;
    recommendation: string;
    why: string;
    oddSource: 'bookmaker' | 'model_fair';
  }>,
  minLegs = 2,
) {
  if (legs.length < minLegs) {
    return {
      id,
      title,
      objective,
      docPath,
      legs: [],
      combinedOdd: 0,
      avgEv: 0,
      avgConfidence: 0,
      buildable: false,
      unavailableReason:
        id === 'resultado-correto'
          ? 'Menos de 1 jogo com placar analisável neste campeonato.'
          : 'Menos de 2 mercados elegíveis (cantos/BTTS/gols) neste campeonato. Analise mais jogos.',
    };
  }

  const combinedOdd = Number(
    legs.reduce((acc, l) => acc * l.bookmakerOdd, 1).toFixed(2),
  );
  const avgEv = legs.reduce((acc, l) => acc + l.ev, 0) / legs.length;
  const avgConfidence =
    legs.reduce((acc, l) => acc + l.confidence, 0) / legs.length;

  return {
    id,
    title,
    objective,
    docPath,
    legs,
    combinedOdd,
    avgEv: round3(avgEv),
    avgConfidence: Math.round(avgConfidence),
    buildable: true,
  };
}
