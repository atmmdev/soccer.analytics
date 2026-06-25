import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnalysisView } from './dto/analyze-match.dto';
import {
  ComputedTeamStats,
  StatisticsEngineService,
} from '../engines/statistics-engine/statistics-engine.service';

@Injectable()
export class AnalyzerService {
  constructor(
    private prisma: PrismaService,
    private statisticsEngine: StatisticsEngineService,
  ) {}

  async analyzeMatch(matchId: string, period: number, view: AnalysisView) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: { homeTeam: true, awayTeam: true, competition: true },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    const { homeStats, awayStats } = await this.statisticsEngine.getComparisonStats(
      match.homeTeamId,
      match.awayTeamId,
      period,
      view,
    );

    const stats = this.buildStatRows(homeStats, awayStats);
    const h2h =
      view === 'h2h'
        ? await this.statisticsEngine.getH2H(match.homeTeamId, match.awayTeamId, period)
        : undefined;

    const source =
      homeStats.source === 'computed' || awayStats.source === 'computed'
        ? 'computed'
        : 'fallback';

    return {
      match: {
        id: match.id,
        matchDate: match.matchDate,
        status: match.status,
        competition: match.competition.name,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
      },
      period,
      view,
      stats,
      homeForm: homeStats.form.slice(0, Math.min(5, period)),
      awayForm: awayStats.form.slice(0, Math.min(5, period)),
      h2h,
      meta: {
        source,
        note:
          source === 'computed'
            ? `Baseado em ${homeStats.matchesPlayed}/${awayStats.matchesPlayed} jogos finalizados`
            : 'Poucos jogos no histórico — usando médias padrão da liga',
      },
    };
  }

  private buildStatRows(home: ComputedTeamStats, away: ComputedTeamStats) {
    return [
      { label: 'Gols marcados (média)', home: home.avgGoalsFor, away: away.avgGoalsFor },
      { label: 'Gols sofridos (média)', home: home.avgGoalsAgainst, away: away.avgGoalsAgainst },
      { label: 'Escanteios (média)', home: home.avgCorners, away: away.avgCorners },
      { label: 'Finalizações (média)', home: home.avgShots, away: away.avgShots },
      {
        label: 'Posse (média)',
        home: home.avgPossession,
        away: away.avgPossession,
        suffix: '%',
      },
      { label: 'xG (média) — Expected Goals', home: home.avgXg, away: away.avgXg },
      { label: 'xGA (média) — Expected Goals Against', home: home.avgXga, away: away.avgXga },
      { label: 'BTTS', home: home.bttsPct, away: away.bttsPct, suffix: '%' },
      { label: 'Over 2.5', home: home.over25Pct, away: away.over25Pct, suffix: '%' },
      { label: 'Cartões (média)', home: home.avgCards, away: away.avgCards },
    ];
  }
}
