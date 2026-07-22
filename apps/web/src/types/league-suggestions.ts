export interface LeagueSuggestionLeg {
  matchId: string;
  matchLabel: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  homeLogoUrl: string | null;
  awayLogoUrl: string | null;
  marketType: string;
  market: string;
  selection: string;
  selectionLabel?: string;
  score: string | null;
  probability: number;
  fairOdd: number;
  bookmakerOdd: number;
  ev: number;
  confidence: number;
  recommendation: string;
  why: string;
  oddSource: 'bookmaker' | 'model_fair';
}

export interface LeagueSuggestedTicket {
  id: string;
  title: string;
  objective: string;
  docPath: string;
  legs: LeagueSuggestionLeg[];
  combinedOdd: number;
  avgEv: number;
  avgConfidence: number;
  buildable: boolean;
  unavailableReason?: string;
}

export interface LeagueSuggestionGroup {
  competitionId: string | null;
  competition: string;
  matchCount: number;
  tickets: LeagueSuggestedTicket[];
}

export interface LeagueTicketSuggestionsResponse {
  legsPerTicket: number;
  competitionCount: number;
  competitions: LeagueSuggestionGroup[];
}
