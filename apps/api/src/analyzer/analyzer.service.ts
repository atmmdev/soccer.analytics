import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnalysisView } from './dto/analyze-match.dto';

type FormResult = 'W' | 'D' | 'L';

interface TeamProfile {
  base: {
    goalsFor: number;
    goalsAgainst: number;
    corners: number;
    shots: number;
    possession: number;
    btts: number;
    over25: number;
    cards: number;
    xg: number;
    xga: number;
  };
  homeBoost: number;
  awayPenalty: number;
  form: FormResult[];
}

const TEAM_PROFILES: Record<string, TeamProfile> = {
  Brasil: {
    base: { goalsFor: 2.1, goalsAgainst: 0.8, corners: 6.2, shots: 14.5, possession: 58, btts: 62, over25: 71, cards: 2.4, xg: 2.0, xga: 0.9 },
    homeBoost: 1.15,
    awayPenalty: 0.95,
    form: ['W', 'W', 'D', 'W', 'W'],
  },
  Escócia: {
    base: { goalsFor: 1.3, goalsAgainst: 1.5, corners: 4.8, shots: 10.2, possession: 46, btts: 48, over25: 55, cards: 3.1, xg: 1.2, xga: 1.6 },
    homeBoost: 1.1,
    awayPenalty: 0.85,
    form: ['L', 'D', 'W', 'L', 'D'],
  },
  França: {
    base: { goalsFor: 1.9, goalsAgainst: 0.9, corners: 5.5, shots: 13.0, possession: 55, btts: 55, over25: 58, cards: 2.2, xg: 1.8, xga: 1.0 },
    homeBoost: 1.12,
    awayPenalty: 0.9,
    form: ['W', 'D', 'W', 'W', 'L'],
  },
  Noruega: {
    base: { goalsFor: 1.4, goalsAgainst: 1.2, corners: 4.5, shots: 9.8, possession: 44, btts: 50, over25: 52, cards: 2.8, xg: 1.3, xga: 1.3 },
    homeBoost: 1.08,
    awayPenalty: 0.88,
    form: ['L', 'W', 'D', 'L', 'W'],
  },
  Flamengo: {
    base: { goalsFor: 1.8, goalsAgainst: 0.9, corners: 5.8, shots: 12.5, possession: 54, btts: 58, over25: 62, cards: 3.0, xg: 1.7, xga: 1.0 },
    homeBoost: 1.2,
    awayPenalty: 0.82,
    form: ['W', 'W', 'W', 'D', 'W'],
  },
  Palmeiras: {
    base: { goalsFor: 1.6, goalsAgainst: 0.7, corners: 5.2, shots: 11.8, possession: 52, btts: 52, over25: 55, cards: 2.6, xg: 1.5, xga: 0.8 },
    homeBoost: 1.18,
    awayPenalty: 0.85,
    form: ['W', 'D', 'W', 'W', 'L'],
  },
  Alemanha: {
    base: { goalsFor: 2.0, goalsAgainst: 1.0, corners: 5.6, shots: 13.2, possession: 56, btts: 60, over25: 65, cards: 2.3, xg: 1.9, xga: 1.1 },
    homeBoost: 1.1,
    awayPenalty: 0.9,
    form: ['W', 'L', 'W', 'D', 'W'],
  },
  Itália: {
    base: { goalsFor: 1.5, goalsAgainst: 0.8, corners: 4.9, shots: 10.5, possession: 50, btts: 45, over25: 48, cards: 2.9, xg: 1.4, xga: 0.9 },
    homeBoost: 1.1,
    awayPenalty: 0.88,
    form: ['D', 'W', 'D', 'W', 'D'],
  },
};

const DEFAULT_PROFILE: TeamProfile = {
  base: { goalsFor: 1.4, goalsAgainst: 1.3, corners: 5.0, shots: 11.0, possession: 50, btts: 50, over25: 50, cards: 2.5, xg: 1.3, xga: 1.3 },
  homeBoost: 1.05,
  awayPenalty: 0.95,
  form: ['D', 'W', 'L', 'D', 'W'],
};

@Injectable()
export class AnalyzerService {
  constructor(private prisma: PrismaService) {}

  async analyzeMatch(matchId: string, period: number, view: AnalysisView) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: { homeTeam: true, awayTeam: true, competition: true },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    const homeProfile = TEAM_PROFILES[match.homeTeam.name] ?? DEFAULT_PROFILE;
    const awayProfile = TEAM_PROFILES[match.awayTeam.name] ?? DEFAULT_PROFILE;

    const periodFactor = period / 10;
    const homeStats = this.buildTeamStats(homeProfile, 'home', view, periodFactor);
    const awayStats = this.buildTeamStats(awayProfile, 'away', view, periodFactor);

    const stats = [
      { label: 'Gols marcados (média)', home: homeStats.goalsFor, away: awayStats.goalsFor },
      { label: 'Gols sofridos (média)', home: homeStats.goalsAgainst, away: awayStats.goalsAgainst },
      { label: 'Escanteios (média)', home: homeStats.corners, away: awayStats.corners },
      { label: 'Finalizações (média)', home: homeStats.shots, away: awayStats.shots },
      { label: 'Posse (média)', home: homeStats.possession, away: awayStats.possession, suffix: '%' },
      { label: 'xG (média)', home: homeStats.xg, away: awayStats.xg },
      { label: 'xGA (média)', home: homeStats.xga, away: awayStats.xga },
      { label: 'BTTS', home: homeStats.btts, away: awayStats.btts, suffix: '%' },
      { label: 'Over 2.5', home: homeStats.over25, away: awayStats.over25, suffix: '%' },
      { label: 'Cartões (média)', home: homeStats.cards, away: awayStats.cards },
    ].map((s) => ({
      ...s,
      home: round(s.home),
      away: round(s.away),
    }));

    const h2h = view === 'h2h' ? this.buildH2H(match.homeTeam.name, match.awayTeam.name) : undefined;

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
      homeForm: homeProfile.form.slice(0, Math.min(5, period)),
      awayForm: awayProfile.form.slice(0, Math.min(5, period)),
      h2h,
      meta: {
        source: 'mock',
        note: 'Dados de exemplo até integração do Statistics Engine',
      },
    };
  }

  private buildTeamStats(
    profile: TeamProfile,
    side: 'home' | 'away',
    view: AnalysisView,
    periodFactor: number,
  ) {
    const { base, homeBoost, awayPenalty } = profile;
    let modifier = 1;

    if (view === 'home' && side === 'home') modifier = homeBoost;
    if (view === 'home' && side === 'away') modifier = awayPenalty;
    if (view === 'away' && side === 'away') modifier = homeBoost;
    if (view === 'away' && side === 'home') modifier = awayPenalty;
    if (view === 'h2h') modifier = 1;

    const f = modifier * (0.9 + periodFactor * 0.05);

    return {
      goalsFor: base.goalsFor * f,
      goalsAgainst: base.goalsAgainst * (2 - f * 0.5),
      corners: base.corners * f,
      shots: base.shots * f,
      possession: Math.min(70, base.possession * f),
      btts: Math.min(95, base.btts * f),
      over25: Math.min(95, base.over25 * f),
      cards: base.cards * (2 - f * 0.3),
      xg: base.xg * f,
      xga: base.xga * (2 - f * 0.5),
    };
  }

  private buildH2H(homeName: string, awayName: string) {
    const key = [homeName, awayName].sort().join('-');
    const presets: Record<string, { homeWins: number; awayWins: number; draws: number }> = {
      'Brasil-Escócia': { homeWins: 4, awayWins: 1, draws: 2 },
      'Flamengo-Palmeiras': { homeWins: 3, awayWins: 3, draws: 4 },
      'França-Noruega': { homeWins: 5, awayWins: 2, draws: 1 },
      'Alemanha-Itália': { homeWins: 3, awayWins: 4, draws: 3 },
    };

    const data = presets[key] ?? { homeWins: 2, awayWins: 2, draws: 2 };

    return {
      ...data,
      totalGames: data.homeWins + data.awayWins + data.draws,
      lastMeetings: ['2-1', '1-1', '0-2', '3-0', '1-0'].slice(0, 5),
    };
  }
}

function round(n: number) {
  return Math.round(n * 10) / 10;
}
