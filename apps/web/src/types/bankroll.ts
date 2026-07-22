export type BankrollPeriodStatus = 'OPEN' | 'CLOSED';

export interface BankrollPeriod {
  id: string;
  name: string;
  status: BankrollPeriodStatus;
  startsAt: string;
  endsAt: string | null;
  autoClose: boolean;
  initialAmount: number;
  closingBalance: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { entries: number };
}

export interface BankrollAvailableTickets {
  range: { from: string | null; to: string | null };
  study: BankrollTicketGroup;
  system: BankrollSystemTicketGroup;
}

export interface BankrollCorrelatedTickets {
  period: {
    id: string;
    name: string;
    status?: BankrollPeriodStatus;
    startsAt: string;
    endsAt: string | null;
  };
  range: { from: string; to: string };
  study: BankrollTicketGroup;
  system: BankrollSystemTicketGroup;
  candidates: {
    study: BankrollTicketGroup;
    system: BankrollSystemTicketGroup;
  };
}

export interface BankrollTicketGroup {
  count: number;
  stake: number;
  actualReturn: number;
  profit: number;
  won: number;
  lost: number;
  pending: number;
  tickets: Array<{
    id: string;
    sourceFile: string;
    placedAt: string;
    betType: string | null;
    betLabel: string | null;
    status: string;
    stake: number;
    combinedOdd: number | null;
    actualReturn: number | null;
    legsPreview: string[];
    linked?: boolean;
  }>;
}

export interface BankrollSystemTicketGroup {
  count: number;
  stake: number;
  won: number;
  lost: number;
  tickets: Array<{
    id: string;
    name: string | null;
    status: string;
    createdAt: string;
    stake: number | null;
    combinedOdd: number | null;
    actualReturn: number | null;
    selections: number;
    linked?: boolean;
  }>;
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
