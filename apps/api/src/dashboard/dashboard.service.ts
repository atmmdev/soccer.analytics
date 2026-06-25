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
      this.getTodayMatches(),
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

    const matchAnalysis = todayMatchesRaw[0]
      ? await this.buildMatchAnalysis(todayMatchesRaw[0].id)
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

  private async getTodayMatches() {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    const matches = await this.prisma.match.findMany({
      where: {
        matchDate: { gte: start, lte: end },
        status: { in: [MatchStatus.SCHEDULED, MatchStatus.LIVE] },
      },
      include: { homeTeam: true, awayTeam: true, competition: true },
      orderBy: { matchDate: 'asc' },
      take: 8,
    });

    const result = [];
    for (const m of matches) {
      const snapshot = await this.prisma.snapshot.findFirst({
        where: { matchId: m.id },
        orderBy: { analyzedAt: 'desc' },
      });
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
      });
    }
    return result;
  }

  private async buildMatchAnalysis(matchId: string) {
    try {
      const analysis = await this.analyzer.analyzeMatch(matchId, 10, 'home');
      return {
        homeTeam: analysis.match.homeTeam.name,
        awayTeam: analysis.match.awayTeam.name,
        homeFlag: '',
        awayFlag: '',
        stats: analysis.stats.map((s) => ({
          label: s.label,
          home: s.home,
          away: s.away,
          suffix: s.suffix,
        })),
        homeForm: analysis.homeForm,
        awayForm: analysis.awayForm,
      };
    } catch {
      return this.emptyMatchAnalysis();
    }
  }

  private emptyMatchAnalysis() {
    return {
      homeTeam: '—',
      awayTeam: '—',
      homeFlag: '',
      awayFlag: '',
      stats: [],
      homeForm: [] as ('W' | 'D' | 'L')[],
      awayForm: [] as ('W' | 'D' | 'L')[],
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
