import { Injectable } from '@nestjs/common';
import { TicketStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BankrollService } from '../bankroll/bankroll.service';
import { AnalysisService } from '../analysis/analysis.service';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private bankroll: BankrollService,
    private analysis: AnalysisService,
  ) {}

  async getPerformanceReport() {
    const [bankroll, tickets, resolvedSnapshots, evPlus] = await Promise.all([
      this.bankroll.getSummary(),
      this.prisma.ticket.findMany({
        where: {
          status: { in: [TicketStatus.WON, TicketStatus.LOST, TicketStatus.PLACED] },
        },
        orderBy: { updatedAt: 'desc' },
        take: 20,
      }),
      this.prisma.snapshot.findMany({
        where: { accuracy: { not: null } },
        orderBy: { analyzedAt: 'desc' },
        take: 30,
        include: {
          match: { include: { homeTeam: true, awayTeam: true } },
        },
      }),
      this.analysis.getAnalyzedMarkets('ev-plus'),
    ]);

    const accurate = resolvedSnapshots.filter((s) => s.accuracy === 100).length;
    const accuracyRate =
      resolvedSnapshots.length > 0
        ? Math.round((accurate / resolvedSnapshots.length) * 1000) / 10
        : 0;

    return {
      generatedAt: new Date().toISOString(),
      bankroll,
      tickets: tickets.map((t) => ({
        id: t.id,
        name: t.name,
        status: t.status,
        stake: t.stake,
        combinedOdd: t.combinedOdd,
        actualReturn: t.actualReturn,
        updatedAt: t.updatedAt,
      })),
      analysis: {
        snapshotsResolved: resolvedSnapshots.length,
        accuracyRate,
        evPlusMarkets: evPlus.length,
        recentResults: resolvedSnapshots.slice(0, 10).map((s) => ({
          matchLabel: s.match
            ? `${s.match.homeTeam.name} vs ${s.match.awayTeam.name}`
            : '—',
          predicted: s.predictedResult,
          actual: s.actualResult,
          accurate: s.accuracy === 100,
          analyzedAt: s.analyzedAt,
        })),
      },
    };
  }
}
