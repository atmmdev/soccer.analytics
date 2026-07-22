export type BankrollPeriodStatus = 'OPEN' | 'CLOSED';

export interface BankrollPeriod {
  id: string;
  name: string;
  status: BankrollPeriodStatus;
  startsAt: string;
  endsAt: string | null;
  initialAmount: number;
  closingBalance: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { entries: number };
}

export interface BankrollSummary {
  period?: BankrollPeriod;
  balance: number;
  initialDeposit: number;
  profit: number;
  roi: number;
  yield: number;
  winRate: number;
  maxDrawdown: number;
  totalStaked: number;
  ticketsPlaced: number;
  ticketsWon: number;
  ticketsLost: number;
}

export interface BankrollPoint {
  date: string;
  value: number;
  fullDate?: string;
}

export interface BankrollEntry {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  ticketId: string | null;
  periodId?: string | null;
  createdAt: string;
}

export const ENTRY_TYPE_LABELS: Record<string, string> = {
  DEPOSIT: 'Depósito',
  WITHDRAWAL: 'Saque',
  STAKE: 'Aposta',
  WIN: 'Green',
  LOSS: 'Red',
  REFUND: 'Estorno',
};

export const PERIOD_STATUS_LABELS: Record<BankrollPeriodStatus, string> = {
  OPEN: 'Aberta',
  CLOSED: 'Fechada',
};
