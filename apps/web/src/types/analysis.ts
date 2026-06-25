export type Recommendation = 'BET' | 'WATCH' | 'SKIP';

export interface MarketAnalysis {
  marketType: string;
  selection: string;
  probability: number;
  fairOdd: number;
  bookmakerOdd: number;
  ev: number;
  confidence: number;
  recommendation: Recommendation;
}

export interface AnalysisResult {
  homeExpectedGoals: number;
  awayExpectedGoals: number;
  predictedScore: string;
  overallConfidence: number;
  markets: MarketAnalysis[];
  snapshotId: string;
  predictionId: string;
  analyzedAt: string;
  match: {
    id: string;
    homeTeam: string;
    awayTeam: string;
    competition: string;
  };
}

export interface LatestAnalysis {
  snapshotId: string;
  analyzedAt: string;
  overallConfidence: number;
  predictedResult: string | null;
  actualResult: string | null;
  accuracy: number | null;
  homeExpectedGoals?: number;
  awayExpectedGoals?: number;
  markets: MarketAnalysis[];
  period: number;
}

export interface EvPlusMarket {
  snapshotId: string;
  matchId: string;
  matchLabel: string;
  competition: string;
  market: string;
  probability: number;
  fairOdd: number;
  bookmakerOdd: number;
  ev: number;
  confidence: number;
  recommendation: Recommendation;
}

export const RECOMMENDATION_LABELS: Record<Recommendation, string> = {
  BET: 'Apostar',
  WATCH: 'Observar',
  SKIP: 'Ignorar',
};

export const RECOMMENDATION_VARIANT: Record<
  Recommendation,
  'success' | 'warning' | 'secondary'
> = {
  BET: 'success',
  WATCH: 'warning',
  SKIP: 'secondary',
};
