export type Recommendation = 'BET' | 'WATCH' | 'SKIP';
export type FormResult = 'W' | 'D' | 'L';

export interface MarketAnalysis {
  marketType: string;
  selection: string;
  probability: number;
  fairOdd: number;
  bookmakerOdd: number;
  ev: number;
  confidence: number;
  recommendation: Recommendation;
  playerModel?: boolean;
}

export interface AnalysisTeamInput {
  name: string;
  source: 'computed' | 'fallback' | string;
  side: string;
  matchesPlayed: number;
  avgGoalsFor: number;
  avgGoalsAgainst: number;
  avgCorners: number;
  avgCards: number;
  bttsPct: number;
  over25Pct: number;
  form: FormResult[];
}

export interface AnalysisTeamInputs {
  home: AnalysisTeamInput;
  away: AnalysisTeamInput;
}

export interface AnalysisStatsSource {
  home?: string;
  away?: string;
  homeMatches?: number;
  awayMatches?: number;
}

export interface AnalysisResult {
  homeExpectedGoals: number;
  awayExpectedGoals: number;
  expectedCorners?: number;
  expectedCards?: number;
  predictedScore: string;
  overallConfidence: number;
  markets: MarketAnalysis[];
  snapshotId: string;
  predictionId: string;
  analyzedAt: string;
  period?: number;
  statsSource?: AnalysisStatsSource | null;
  teamInputs?: AnalysisTeamInputs | null;
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
  expectedCorners?: number;
  expectedCards?: number;
  markets: MarketAnalysis[];
  period: number;
  statsSource?: AnalysisStatsSource | null;
  teamInputs?: AnalysisTeamInputs | null;
}

export interface EvPlusMarket {
  snapshotId: string;
  matchId: string;
  matchLabel: string;
  competition: string;
  competitionId?: string | null;
  homeTeam?: string;
  awayTeam?: string;
  homeLogoUrl?: string | null;
  awayLogoUrl?: string | null;
  market: string;
  marketType?: string;
  probability: number;
  fairOdd: number;
  bookmakerOdd: number;
  ev: number;
  confidence: number;
  recommendation: Recommendation;
  playerModel?: boolean;
  modelSupported?: boolean;
}

export const MARKET_TYPE_LABELS: Record<string, string> = {
  MATCH_RESULT: 'Resultado',
  OVER_UNDER: 'Gols O/U',
  BTTS: 'BTTS',
  CORNERS: 'Escanteios',
  CARDS: 'Cartões',
  HANDICAP: 'Handicap',
  PLAYER: 'Jogador',
};

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
