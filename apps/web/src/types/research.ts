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
  allowSynthetic?: boolean;
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
  dataSource?: 'history' | 'synthetic';
  bets: Array<{
    matchLabel: string;
    odd: number;
    won: boolean;
    profit: number;
    score: string;
  }>;
  bankrollCurve: Array<{ index: number; value: number }>;
}

export interface ResearchStrategy {
  id: string;
  name: string;
  description: string | null;
  filters: StrategyFilters;
  results: SimulationResult | null;
  createdAt: string;
  simulations?: Array<{
    id: string;
    results: SimulationResult;
    executedAt: string;
  }>;
}

export const MARKET_LABELS: Record<ResearchMarket, string> = {
  HOME_WIN: 'Vitória Casa',
  DRAW: 'Empate',
  AWAY_WIN: 'Vitória Fora',
  OVER_2_5: 'Over 2.5',
  UNDER_2_5: 'Under 2.5',
  BTTS_YES: 'BTTS Sim',
  BTTS_NO: 'BTTS Não',
};
