export type MarketType =
  | 'MATCH_RESULT'
  | 'BTTS'
  | 'OVER_UNDER'
  | 'CORNERS'
  | 'CARDS'
  | 'PLAYER'
  | 'HANDICAP'
  | 'DOUBLE_CHANCE'
  | 'HT_FT'
  | 'EXACT_SCORE'
  | 'WINNING_MARGIN'
  | 'SHOTS'
  | 'SHOTS_ON_TARGET'
  | 'RED_CARD'
  | 'BOTH_TEAMS_CARDS'
  | 'GOALKEEPER_SAVES'
  | 'PLAYER_SHOTS'
  | 'PLAYER_SHOTS_ON_TARGET'
  | 'PLAYER_CARDS'
  | 'PLAYER_FOULS'
  | 'PLAYER_TACKLES'
  | 'PLAYER_ASSIST_OR_GOAL';

export type TicketStatus = 'DRAFT' | 'PLACED' | 'WON' | 'LOST' | 'VOID' | 'CASHED_OUT';

export interface DraftSelection {
  matchId: string;
  matchLabel: string;
  marketType: MarketType;
  selection: string;
  odd: number;
  probability?: number;
  ev?: number;
  confidence?: number;
}

export interface CorrelationWarning {
  code: 'DUPLICATE' | 'SAME_MATCH_RESULT' | 'CORRELATED';
  message: string;
  matchIds: string[];
}

export interface TicketCalculation {
  combinedOdd: number;
  combinedProbability: number | null;
  overallEV: number | null;
  suggestedStake: number;
  potentialReturn: number | null;
  warnings: CorrelationWarning[];
  valid: boolean;
}

export interface TicketSelection {
  id: string;
  matchId: string;
  marketType: MarketType;
  selection: string;
  odd: number;
  probability: number | null;
  ev: number | null;
  confidence: number | null;
  match: {
    id: string;
    homeTeam: { name: string };
    awayTeam: { name: string };
    competition?: { name: string };
  };
}

export interface Ticket {
  id: string;
  name: string | null;
  status: TicketStatus;
  combinedOdd: number | null;
  stake: number | null;
  potentialReturn: number | null;
  actualReturn: number | null;
  overallEV: number | null;
  createdAt: string;
  selections: TicketSelection[];
}

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  DRAFT: 'Rascunho',
  PLACED: 'Apostado',
  WON: 'Green',
  LOST: 'Red',
  VOID: 'Anulado',
  CASHED_OUT: 'Cash Out',
};
