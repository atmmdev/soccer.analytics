export type StudyTicketStatus =
  | 'WON'
  | 'LOST'
  | 'VOID'
  | 'CASHED_OUT'
  | 'PENDING'
  | 'UNKNOWN';

export interface StudyTicketLeg {
  id: string;
  sortOrder: number;
  builderGroup: number | null;
  matchLabel: string;
  matchDate: string | null;
  market: string;
  selection: string;
  period: string | null;
  odd: number | null;
  boostedOdd: number | null;
  status: StudyTicketStatus | null;
  progressValue: number | null;
  progressLine: number | null;
  meta?: Record<string, unknown> | null;
}

export interface StudyTicket {
  id: string;
  sourceFile: string;
  bet365Ref: string | null;
  placedAt: string;
  betType: string | null;
  betLabel: string | null;
  status: StudyTicketStatus;
  stake: number;
  unitStake: number | null;
  numBets: number | null;
  combinedOdd: number | null;
  potentialReturn: number | null;
  actualReturn: number | null;
  cashOutAt: string | null;
  cashOutValue: number | null;
  hasOddsBoost: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  legs: StudyTicketLeg[];
}

export const STUDY_STATUS_LABELS: Record<StudyTicketStatus, string> = {
  WON: 'Green',
  LOST: 'Red',
  VOID: 'Anulado',
  CASHED_OUT: 'Cash Out',
  PENDING: 'Pendente',
  UNKNOWN: '—',
};
