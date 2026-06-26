import { Injectable } from '@nestjs/common';
import { MatchStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export type ResearchMarket =
  | 'HOME_WIN'
  | 'DRAW'
  | 'AWAY_WIN'
  | 'OVER_2_5'
  | 'UNDER_2_5'
  | 'BTTS_YES'
  | 'BTTS_NO';

export interface StrategyFilters {
  market: ResearchMarket;
  team?: string;
  competition?: string;
  minOdd?: number;
  maxOdd?: number;
  sampleSize: number;
  flatStake: number;
}

export interface SimulatedBet {
  matchLabel: string;
  odd: number;
  won: boolean;
  profit: number;
  score: string;
}

export interface SimulationResult {
  totalBets: number;
  wins: number;
  losses: number;
  winRate: number;
  profit: number;
  roi: number;
  yield: number;
  maxDrawdown: number;
  finalBankroll: number;
  sampleSize: number;
  isSynthetic: boolean;
  dataSource: 'history' | 'synthetic';
  bets: SimulatedBet[];
  bankrollCurve: { index: number; value: number }[];
}

const TEAMS = [
  { name: 'Brasil', country: 'Brasil', gf: 2.1, ga: 0.8 },
  { name: 'Escócia', country: 'Escócia', gf: 1.3, ga: 1.5 },
  { name: 'França', country: 'França', gf: 1.9, ga: 0.9 },
  { name: 'Flamengo', country: 'Brasil', gf: 1.8, ga: 0.9 },
  { name: 'Palmeiras', country: 'Brasil', gf: 1.6, ga: 0.7 },
  { name: 'Alemanha', country: 'Alemanha', gf: 2.0, ga: 1.0 },
  { name: 'Itália', country: 'Itália', gf: 1.5, ga: 0.8 },
  { name: 'Real Madrid', country: 'Espanha', gf: 2.2, ga: 0.9 },
];

const COMPETITIONS = [
  'Brasileirão Série A',
  'Champions League',
  'Amistoso Internacional',
  'Eliminatórias UEFA',
];

const DEFAULT_ODDS: Record<ResearchMarket, number> = {
  HOME_WIN: 1.85,
  DRAW: 3.4,
  AWAY_WIN: 4.2,
  OVER_2_5: 1.9,
  UNDER_2_5: 1.95,
  BTTS_YES: 1.75,
  BTTS_NO: 2.05,
};

const MARKET_SELECTION: Record<ResearchMarket, string> = {
  HOME_WIN: 'Casa',
  DRAW: 'Empate',
  AWAY_WIN: 'Fora',
  OVER_2_5: 'Over 2.5',
  UNDER_2_5: 'Under 2.5',
  BTTS_YES: 'BTTS Sim',
  BTTS_NO: 'BTTS Não',
};

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function simulateScore(homeGf: number, homeGa: number, awayGf: number, awayGa: number, seed: number) {
  const homeLambda = Math.max(0.4, (homeGf + awayGa) / 2.2);
  const awayLambda = Math.max(0.4, (awayGf + homeGa) / 2.2);
  const home = Math.min(5, Math.round(homeLambda + seededRandom(seed) * 2 - 0.5));
  const away = Math.min(5, Math.round(awayLambda + seededRandom(seed + 1) * 2 - 0.5));
  return { home: Math.max(0, home), away: Math.max(0, away) };
}

function betWon(market: ResearchMarket, home: number, away: number): boolean {
  const total = home + away;
  switch (market) {
    case 'HOME_WIN':
      return home > away;
    case 'DRAW':
      return home === away;
    case 'AWAY_WIN':
      return away > home;
    case 'OVER_2_5':
      return total > 2;
    case 'UNDER_2_5':
      return total <= 2;
    case 'BTTS_YES':
      return home > 0 && away > 0;
    case 'BTTS_NO':
      return home === 0 || away === 0;
    default:
      return false;
  }
}

function buildResult(
  bets: SimulatedBet[],
  sampleSize: number,
  flatStake: number,
  isSynthetic: boolean,
  dataSource: 'history' | 'synthetic',
): SimulationResult {
  let bankroll = 1000;
  const bankrollCurve: { index: number; value: number }[] = [{ index: 0, value: bankroll }];
  let peak = bankroll;
  let maxDrawdown = 0;
  let wins = 0;
  let totalStaked = 0;

  for (const bet of bets) {
    bankroll += bet.profit;
    totalStaked += flatStake;
    if (bet.won) wins++;
    peak = Math.max(peak, bankroll);
    const dd = peak > 0 ? ((peak - bankroll) / peak) * 100 : 0;
    maxDrawdown = Math.max(maxDrawdown, dd);
    bankrollCurve.push({ index: bankrollCurve.length, value: Math.round(bankroll * 100) / 100 });
  }

  const losses = bets.length - wins;
  const profit = bankroll - 1000;
  const roi = totalStaked > 0 ? (profit / totalStaked) * 100 : 0;
  const winRate = bets.length > 0 ? (wins / bets.length) * 100 : 0;
  const yieldPct = bets.length > 0 ? profit / bets.length : 0;

  return {
    totalBets: bets.length,
    wins,
    losses,
    winRate: Math.round(winRate * 10) / 10,
    profit: Math.round(profit * 100) / 100,
    roi: Math.round(roi * 100) / 100,
    yield: Math.round(yieldPct * 100) / 100,
    maxDrawdown: Math.round(maxDrawdown * 10) / 10,
    finalBankroll: Math.round(bankroll * 100) / 100,
    sampleSize,
    isSynthetic,
    dataSource,
    bets: bets.slice(-20),
    bankrollCurve: bankrollCurve.filter(
      (_, idx) =>
        idx === 0 ||
        idx % Math.max(1, Math.floor(bankrollCurve.length / 30)) === 0 ||
        idx === bankrollCurve.length - 1,
    ),
  };
}

export function runSyntheticSimulation(filters: StrategyFilters): SimulationResult {
  const sampleSize = Math.min(500, Math.max(20, filters.sampleSize));
  const flatStake = filters.flatStake > 0 ? filters.flatStake : 10;
  const bets: SimulatedBet[] = [];

  for (let i = 0; i < sampleSize; i++) {
    const seed = i * 17 + filters.market.length * 31;
    const homeIdx = Math.floor(seededRandom(seed) * TEAMS.length);
    let awayIdx = Math.floor(seededRandom(seed + 2) * TEAMS.length);
    if (awayIdx === homeIdx) awayIdx = (awayIdx + 1) % TEAMS.length;

    const home = TEAMS[homeIdx];
    const away = TEAMS[awayIdx];
    const competition = COMPETITIONS[Math.floor(seededRandom(seed + 3) * COMPETITIONS.length)];

    if (filters.team) {
      const teamLower = filters.team.toLowerCase();
      const matchesTeam =
        home.name.toLowerCase().includes(teamLower) ||
        away.name.toLowerCase().includes(teamLower);
      if (!matchesTeam) continue;
    }

    if (filters.competition) {
      if (!competition.toLowerCase().includes(filters.competition.toLowerCase())) continue;
    }

    let odd = DEFAULT_ODDS[filters.market] * (0.9 + seededRandom(seed + 4) * 0.2);
    if (filters.minOdd && odd < filters.minOdd) continue;
    if (filters.maxOdd && odd > filters.maxOdd) continue;
    odd = Math.round(odd * 100) / 100;

    const score = simulateScore(home.gf, home.ga, away.gf, away.ga, seed + 5);
    const won = betWon(filters.market, score.home, score.away);
    const profit = won ? flatStake * (odd - 1) : -flatStake;

    bets.push({
      matchLabel: `${home.name} vs ${away.name}`,
      odd,
      won,
      profit: Math.round(profit * 100) / 100,
      score: `${score.home}-${score.away}`,
    });
  }

  return buildResult(bets, sampleSize, flatStake, true, 'synthetic');
}

@Injectable()
export class SimulationEngineService {
  constructor(private prisma: PrismaService) {}

  async simulate(filters: StrategyFilters): Promise<SimulationResult> {
    const history = await this.simulateFromHistory(filters);
    if (history.totalBets >= 10) {
      return history;
    }
    return runSyntheticSimulation(filters);
  }

  private async simulateFromHistory(filters: StrategyFilters): Promise<SimulationResult> {
    const sampleSize = Math.min(500, Math.max(20, filters.sampleSize));
    const flatStake = filters.flatStake > 0 ? filters.flatStake : 10;
    const selection = MARKET_SELECTION[filters.market];

    const where: Prisma.MatchWhereInput = {
      externalId: { not: null },
      status: MatchStatus.FINISHED,
      homeScore: { not: null },
      awayScore: { not: null },
    };

    if (filters.team) {
      where.OR = [
        { homeTeam: { name: { contains: filters.team, mode: 'insensitive' } } },
        { awayTeam: { name: { contains: filters.team, mode: 'insensitive' } } },
      ];
    }

    if (filters.competition) {
      where.competition = {
        name: { contains: filters.competition, mode: 'insensitive' },
      };
    }

    const matches = await this.prisma.match.findMany({
      where,
      include: {
        homeTeam: true,
        awayTeam: true,
        odds: { include: { market: true } },
      },
      orderBy: { matchDate: 'desc' },
      take: sampleSize * 3,
    });

    const bets: SimulatedBet[] = [];

    for (const match of matches) {
      if (bets.length >= sampleSize) break;

      const home = match.homeScore!;
      const away = match.awayScore!;

      const oddRow = match.odds.find((o) => o.selection === selection);
      let odd = oddRow?.value;

      if (!odd) {
        odd = DEFAULT_ODDS[filters.market];
      }

      if (filters.minOdd && odd < filters.minOdd) continue;
      if (filters.maxOdd && odd > filters.maxOdd) continue;

      const won = betWon(filters.market, home, away);
      const profit = won ? flatStake * (odd - 1) : -flatStake;

      bets.push({
        matchLabel: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
        odd: Math.round(odd * 100) / 100,
        won,
        profit: Math.round(profit * 100) / 100,
        score: `${home}-${away}`,
      });
    }

    return buildResult(bets, sampleSize, flatStake, false, 'history');
  }
}
