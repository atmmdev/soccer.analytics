import { Injectable } from '@nestjs/common';
import { MatchStatus, TicketStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BankrollService } from '../bankroll/bankroll.service';
import { AnalysisService } from '../analysis/analysis.service';
import { AnalyzerService } from '../analyzer/analyzer.service';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private bankroll: BankrollService,
    private analysis: AnalysisService,
    private analyzer: AnalyzerService,
  ) {}

  async getDashboard() {
    const [
      bankrollSummary,
      bankrollHistory,
      evPlusRaw,
      todayMatchesRaw,
      latestTicket,
      recentTickets,
      todayEntries,
    ] = await Promise.all([
      this.bankroll.getSummary(),
      this.bankroll.getHistory(),
      this.analysis.getAnalyzedMarkets('ev-plus'),
      this.getScheduleMatches(),
      this.prisma.ticket.findFirst({
        where: { status: TicketStatus.DRAFT },
        orderBy: { updatedAt: 'desc' },
        include: { selections: true },
      }),
      this.prisma.ticket.findMany({
        where: { status: { in: [TicketStatus.WON, TicketStatus.LOST] } },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
      this.getTodayBankrollProfit(),
    ]);

    const featuredMatch =
      todayMatchesRaw.find((m) => m.day === 'today' && m.status !== 'finished') ??
      todayMatchesRaw[0];

    const matchAnalysis = featuredMatch
      ? await this.buildMatchAnalysis(featuredMatch.id)
      : this.emptyMatchAnalysis();

    const evMarkets = evPlusRaw.slice(0, 8).map((m, i) => ({
      id: `${m.matchId}-${i}`,
      market: `${m.matchLabel} — ${m.market}`,
      probability: Math.round(m.probability * 1000) / 10,
      fairOdd: m.fairOdd,
      bookmakerOdd: m.bookmakerOdd,
      ev: Math.round(m.ev * 1000) / 10,
    }));

    const ticketBuilder = latestTicket
      ? {
          selections: latestTicket.selections.map((s) => ({
            market: s.selection,
            odd: s.odd,
          })),
          combinedOdd: latestTicket.combinedOdd ?? 0,
          probability: 0,
          ev: Math.round((latestTicket.overallEV ?? 0) * 1000) / 10,
          suggestedStake: latestTicket.stake ?? 0,
          potentialReturn: latestTicket.potentialReturn ?? 0,
        }
      : {
          selections: [],
          combinedOdd: 0,
          probability: 0,
          ev: 0,
          suggestedStake: 0,
          potentialReturn: 0,
        };

    const recentEntries = recentTickets.map((t) => ({
      id: t.id,
      date: new Date(t.updatedAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      }),
      market: t.name ?? 'Bilhete',
      odd: t.combinedOdd ?? 0,
      stake: t.stake ?? 0,
      result: t.status === TicketStatus.WON ? ('win' as const) : ('loss' as const),
      profit:
        t.status === TicketStatus.WON
          ? (t.actualReturn ?? 0) - (t.stake ?? 0)
          : -(t.stake ?? 0),
    }));

    const topEv = evPlusRaw[0];

    return {
      summary: {
        bankroll: {
          value: bankrollSummary.balance,
          change: bankrollSummary.profit,
          changePercent: bankrollSummary.roi,
        },
        profitToday: {
          value: todayEntries,
          changePercent: bankrollSummary.roi,
        },
        roi: { value: bankrollSummary.roi, change: bankrollSummary.yield },
        greens: {
          count: bankrollSummary.ticketsWon,
          percent: bankrollSummary.winRate,
        },
        reds: {
          count: bankrollSummary.ticketsLost,
          percent:
            bankrollSummary.ticketsWon + bankrollSummary.ticketsLost > 0
              ? Math.round(
                  (bankrollSummary.ticketsLost /
                    (bankrollSummary.ticketsWon + bankrollSummary.ticketsLost)) *
                    1000,
                ) / 10
              : 0,
        },
        evPlusToday: evPlusRaw.length,
      },
      todayMatches: todayMatchesRaw,
      matchAnalysis,
      ticketBuilder,
      evMarkets,
      bankrollHistory: bankrollHistory.map(({ date, value }) => ({ date, value })),
      recentEntries,
      tip: topEv
        ? `Destaque EV+: ${topEv.market} em ${topEv.matchLabel} (+${(topEv.ev * 100).toFixed(1)}%). Execute análises nos jogos do dia para mais oportunidades.`
        : 'Execute análises nos jogos agendados para descobrir mercados EV+.',
    };
  }

  private async getScheduleMatches() {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(23, 59, 59, 999);

    // Busca hoje e amanhã em paralelo — evita que finalizados de hoje
    // consumam o take:N e escondam os jogos de amanhã.
    const [todayMatches, tomorrowMatches] = await Promise.all([
      this.prisma.match.findMany({
        where: {
          externalId: { not: null },
          matchDate: { gte: todayStart, lte: todayEnd },
          status: { in: [MatchStatus.SCHEDULED, MatchStatus.LIVE] },
        },
        include: { homeTeam: true, awayTeam: true, competition: true },
        orderBy: { matchDate: 'asc' },
        take: 40,
      }),
      this.prisma.match.findMany({
        where: {
          externalId: { not: null },
          matchDate: { gte: tomorrowStart, lte: tomorrowEnd },
          status: MatchStatus.SCHEDULED,
        },
        include: { homeTeam: true, awayTeam: true, competition: true },
        orderBy: { matchDate: 'asc' },
        take: 40,
      }),
    ]);

    const matches = [...todayMatches, ...tomorrowMatches];

    const result = [];
    for (const m of matches) {
      const snapshot = await this.prisma.snapshot.findFirst({
        where: { matchId: m.id },
        orderBy: { analyzedAt: 'desc' },
      });

      const matchDay = m.matchDate <= todayEnd ? 'today' : 'tomorrow';

      result.push({
        id: m.id,
        time: new Date(m.matchDate).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        homeTeam: m.homeTeam.name,
        awayTeam: m.awayTeam.name,
        homeFlag: '',
        awayFlag: '',
        competition: m.competition.name,
        score: snapshot ? Math.round(snapshot.overallConfidence) : 0,
        status:
          m.status === MatchStatus.LIVE
            ? ('live' as const)
            : ('scheduled' as const),
        day: matchDay as 'today' | 'tomorrow',
      });
    }
    return result;
  }

  private async buildMatchAnalysis(matchId: string) {
    try {
      const [statsAnalysis, poisson] = await Promise.all([
        this.analyzer.analyzeMatch(matchId, 10, 'home'),
        this.analysis.getLatest(matchId),
      ]);

      let poissonBlock = null;
      if (poisson?.markets?.length) {
        const markets = poisson.markets as Array<{
          selection: string;
          ev: number;
        }>;
        const topEv = [...markets].sort((a, b) => b.ev - a.ev)[0];

        poissonBlock = {
          predictedScore: poisson.predictedResult,
          confidence: poisson.overallConfidence,
          homeExpectedGoals: poisson.homeExpectedGoals ?? 0,
          awayExpectedGoals: poisson.awayExpectedGoals ?? 0,
          topEvMarket: topEv?.selection ?? null,
          topEv: topEv ? Math.round(topEv.ev * 1000) / 10 : null,
        };
      }

      return {
        matchId,
        homeTeam: statsAnalysis.match.homeTeam.name,
        awayTeam: statsAnalysis.match.awayTeam.name,
        homeFlag: '',
        awayFlag: '',
        stats: statsAnalysis.stats.map((s) => ({
          label: s.label,
          home: s.home,
          away: s.away,
          suffix: s.suffix,
        })),
        homeForm: statsAnalysis.homeForm,
        awayForm: statsAnalysis.awayForm,
        statsSource: statsAnalysis.meta.source as 'computed' | 'fallback',
        poisson: poissonBlock,
      };
    } catch {
      return this.emptyMatchAnalysis();
    }
  }

  private emptyMatchAnalysis() {
    return {
      matchId: null,
      homeTeam: '—',
      awayTeam: '—',
      homeFlag: '',
      awayFlag: '',
      stats: [],
      homeForm: [] as ('W' | 'D' | 'L')[],
      awayForm: [] as ('W' | 'D' | 'L')[],
      statsSource: null,
      poisson: null,
    };
  }

  private async getTodayBankrollProfit() {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    const entries = await this.prisma.bankrollEntry.findMany({
      where: { createdAt: { gte: start } },
    });

    return Math.round(entries.reduce((sum, e) => sum + e.amount, 0) * 100) / 100;
  }
}
