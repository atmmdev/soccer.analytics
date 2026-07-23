import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnalysisView } from './dto/analyze-match.dto';
import {
  ComputedTeamStats,
  StatisticsEngineService,
  type H2HStats,
} from '../engines/statistics-engine/statistics-engine.service';
import { DataEngineService } from '../engines/data-engine/data-engine.service';

@Injectable()
export class AnalyzerService {
  private readonly logger = new Logger(AnalyzerService.name);

  constructor(
    private prisma: PrismaService,
    private statisticsEngine: StatisticsEngineService,
    private dataEngine: DataEngineService,
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
    let h2h: H2HStats | undefined;
    let h2hSource: 'local' | 'remote' | 'empty' | undefined;
    let h2hNote: string | undefined;

    if (view === 'h2h') {
      h2h = await this.statisticsEngine.getH2H(
        match.homeTeamId,
        match.awayTeamId,
        period,
      );
      h2hSource = h2h.totalGames > 0 ? 'local' : 'empty';

      const needsRemote =
        h2h.totalGames < Math.min(5, period) &&
        !!match.homeTeam.externalId &&
        !!match.awayTeam.externalId &&
        this.dataEngine.isApiFootballConfigured();

      if (needsRemote) {
        try {
          const remote = await this.dataEngine.fetchRemoteH2H(
            match.homeTeam.externalId!,
            match.awayTeam.externalId!,
            period,
          );
          if (remote.length > h2h.totalGames) {
            h2h = this.h2hFromRemote(remote);
            h2hSource = 'remote';
            h2hNote = `Confrontos carregados da API-Football (${remote.length}).`;
            // Cacheia no banco para a próxima visita
            void this.dataEngine
              .persistRemoteH2HFixtures(remote)
              .catch((err) =>
                this.logger.warn(
                  `Falha ao persistir H2H remoto: ${err instanceof Error ? err.message : 'unknown'}`,
                ),
              );
          } else if (remote.length === 0 && h2h.totalGames === 0) {
            h2hSource = 'empty';
            h2hNote =
              'Nenhum confronto finalizado encontrado no banco nem na API-Football para este duelo.';
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'erro desconhecido';
          this.logger.warn(
            `H2H remoto falhou (${match.homeTeam.name} vs ${match.awayTeam.name}): ${msg}`,
          );
          h2hNote =
            h2h.totalGames === 0
              ? `Sem histórico local. Falha ao buscar na API: ${msg}`
              : `Usando só histórico local. API: ${msg}`;
        }
      } else if (h2h.totalGames === 0) {
        if (!this.dataEngine.isApiFootballConfigured()) {
          h2hNote =
            'Sem confrontos no banco. Configure API_FOOTBALL_KEY para buscar H2H remoto.';
        } else if (!match.homeTeam.externalId || !match.awayTeam.externalId) {
          h2hNote =
            'Sem confrontos no banco e times sem externalId — não é possível consultar a API.';
        } else {
          h2hNote = 'Nenhum confronto direto disponível para este duelo.';
        }
      }
    }

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
        h2hSource,
        h2hNote,
      },
    };
  }

  private h2hFromRemote(
    rows: Array<{
      homeGoals: number;
      awayGoals: number;
      date?: string;
      homeName?: string;
      awayName?: string;
      scoreAsPlayed?: string;
      competition?: string | null;
    }>,
  ): H2HStats {
    let homeWins = 0;
    let awayWins = 0;
    let draws = 0;
    const lastMeetings: string[] = [];
    const meetings: H2HStats['meetings'] = [];
    for (const r of rows) {
      const score = `${r.homeGoals}-${r.awayGoals}`;
      lastMeetings.push(score);
      meetings.push({
        date: r.date ?? new Date().toISOString(),
        score,
        scoreAsPlayed: r.scoreAsPlayed ?? score,
        homeName: r.homeName ?? 'Casa',
        awayName: r.awayName ?? 'Fora',
        competition: r.competition ?? null,
      });
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
      meetings,
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
