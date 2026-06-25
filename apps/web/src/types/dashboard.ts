export interface DashboardSummary {
  bankroll: { value: number; change: number; changePercent: number };
  profitToday: { value: number; changePercent: number };
  roi: { value: number; change: number };
  greens: { count: number; percent: number };
  reds: { count: number; percent: number };
  evPlusToday: number;
}

export interface TodayMatch {
  id: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  competition: string;
  score: number;
  status: 'scheduled' | 'live' | 'finished';
  day: 'today' | 'tomorrow';
}

export interface MatchAnalysisData {
  matchId?: string | null;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  stats: {
    label: string;
    home: number;
    away: number;
    suffix?: string;
  }[];
  homeForm: ('W' | 'D' | 'L')[];
  awayForm: ('W' | 'D' | 'L')[];
  statsSource?: 'computed' | 'fallback' | null;
  poisson?: {
    predictedScore: string | null;
    confidence: number;
    homeExpectedGoals: number;
    awayExpectedGoals: number;
    topEvMarket: string | null;
    topEv: number | null;
  } | null;
}

export interface TicketSelection {
  market: string;
  odd: number;
}

export interface TicketBuilderData {
  selections: TicketSelection[];
  combinedOdd: number;
  probability: number;
  ev: number;
  suggestedStake: number;
  potentialReturn: number;
}

export interface EvMarket {
  id: string;
  market: string;
  probability: number;
  fairOdd: number;
  bookmakerOdd: number;
  ev: number;
}

export interface BankrollPoint {
  date: string;
  value: number;
}

export interface RecentEntry {
  id: string;
  date: string;
  market: string;
  odd: number;
  stake: number;
  result: 'win' | 'loss';
  profit: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  todayMatches: TodayMatch[];
  matchAnalysis: MatchAnalysisData;
  ticketBuilder: TicketBuilderData;
  evMarkets: EvMarket[];
  bankrollHistory: BankrollPoint[];
  recentEntries: RecentEntry[];
  tip: string;
}
