export interface PerformanceReport {
  generatedAt: string;
  bankroll: {
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
  };
  tickets: Array<{
    id: string;
    name: string;
    status: string;
    stake: number;
    combinedOdd: number;
    actualReturn: number | null;
    updatedAt: string;
  }>;
  analysis: {
    snapshotsResolved: number;
    accuracyRate: number;
    evPlusMarkets: number;
    recentResults: Array<{
      matchLabel: string;
      predicted: string | null;
      actual: string | null;
      accurate: boolean;
      analyzedAt: string;
    }>;
  };
}
