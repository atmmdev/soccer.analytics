export interface AnalysisHistoryItem {
  id: string;
  matchId: string;
  matchLabel: string;
  competition: string;
  matchStatus: string | null;
  analyzedAt: string;
  predictedResult: string | null;
  actualResult: string | null;
  accuracy: number | null;
  overallConfidence: number;
  evPlusCount: number;
  betCount: number;
}

export interface AnalysisHistoryResponse {
  data: AnalysisHistoryItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
