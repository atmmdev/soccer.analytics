export interface BankrollSummary {
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
