import type { Recommendation } from './analysis';

export interface AlertsSummary {
  total: number;
  bet: number;
  watch: number;
  evPlus: number;
}

export interface AlertItem {
  id: string;
  matchId: string;
  matchLabel: string;
  competition: string;
  market: string;
  ev: number;
  confidence: number;
  bookmakerOdd: number;
  recommendation: Recommendation;
  matchDate: string;
  status: string;
}

export interface AlertsResponse {
  summary: AlertsSummary;
  alerts: AlertItem[];
}
