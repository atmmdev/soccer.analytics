export type MarketType =
  | 'MATCH_RESULT'
  | 'BTTS'
  | 'OVER_UNDER'
  | 'CORNERS'
  | 'CARDS'
  | 'PLAYER'
  | 'HANDICAP';

export type TicketStatus = 'DRAFT' | 'PLACED' | 'WON' | 'LOST' | 'VOID';

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
};
