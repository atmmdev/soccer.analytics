export interface SearchMatchResult {
  id: string;
  label: string;
  competition: string;
  matchDate: string;
  status: string;
}

export interface SearchTeamResult {
  id: string;
  name: string;
  country: string | null;
}

export interface SearchMarketResult {
  matchId: string;
  matchLabel: string;
  market: string;
  ev: number;
  recommendation: string;
}

export interface SearchResponse {
  query: string;
  matches: SearchMatchResult[];
  teams: SearchTeamResult[];
  markets: SearchMarketResult[];
}
