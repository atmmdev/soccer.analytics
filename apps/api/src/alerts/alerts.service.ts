import { Injectable } from '@nestjs/common';
import { MatchStatus, RecommendationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface AlertItem {
  id: string;
  matchId: string;
  matchLabel: string;
  competition: string;
  market: string;
  ev: number;
  confidence: number;
  bookmakerOdd: number;
  recommendation: RecommendationType;
  matchDate: string;
  status: MatchStatus;
}

export interface AlertsSummary {
  total: number;
  bet: number;
  watch: number;
  evPlus: number;
}

@Injectable()
export class AlertsService {
  constructor(private prisma: PrismaService) {}

  async getAlerts() {
    const { start, end } = this.getUpcomingWindow();

    const snapshots = await this.prisma.snapshot.findMany({
      orderBy: { analyzedAt: 'desc' },
      take: 80,
      include: {
        match: {
          include: { homeTeam: true, awayTeam: true, competition: true },
        },
      },
    });

    const alerts: AlertItem[] = [];
    const seen = new Set<string>();

    for (const snap of snapshots) {
      const match = snap.match;
      if (!match) continue;

      const inWindow =
        match.matchDate >= start &&
        match.matchDate <= end &&
        (match.status === MatchStatus.SCHEDULED || match.status === MatchStatus.LIVE);

      if (!inWindow) continue;

      const data = snap.data as {
        markets?: Array<{
          selection: string;
          ev: number;
          confidence: number;
          bookmakerOdd: number;
          recommendation: RecommendationType;
        }>;
      };

      if (!data.markets) continue;

      for (const m of data.markets) {
        if (m.ev <= 0.05 || m.recommendation === RecommendationType.SKIP) continue;

        const key = `${snap.matchId}-${m.selection}`;
        if (seen.has(key)) continue;
        seen.add(key);

        alerts.push({
          id: key,
          matchId: snap.matchId,
          matchLabel: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
          competition: match.competition.name,
          market: m.selection,
          ev: m.ev,
          confidence: m.confidence,
          bookmakerOdd: m.bookmakerOdd,
          recommendation: m.recommendation,
          matchDate: match.matchDate.toISOString(),
          status: match.status,
        });
      }
    }

    alerts.sort((a, b) => b.ev - a.ev);

    const summary: AlertsSummary = {
      total: alerts.length,
      bet: alerts.filter((a) => a.recommendation === RecommendationType.BET).length,
      watch: alerts.filter((a) => a.recommendation === RecommendationType.WATCH).length,
      evPlus: alerts.filter((a) => a.ev > 0.05).length,
    };

    return { summary, alerts };
  }

  async getSummary(): Promise<AlertsSummary> {
    const { summary } = await this.getAlerts();
    return summary;
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
