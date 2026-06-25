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

export const dashboardData: DashboardData = {
  summary: {
    bankroll: { value: 1250, change: 120, changePercent: 9.68 },
    profitToday: { value: 86.35, changePercent: 6.91 },
    roi: { value: 12.84, change: 2.45 },
    greens: { count: 128, percent: 71.51 },
    reds: { count: 51, percent: 28.49 },
    evPlusToday: 24,
  },
  todayMatches: [
    { id: '1', time: '16:00', homeTeam: 'Brasil', awayTeam: 'Escócia', homeFlag: '🇧🇷', awayFlag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', competition: 'Amistoso', score: 91, status: 'scheduled', day: 'today' },
    { id: '2', time: '16:00', homeTeam: 'Marrocos', awayTeam: 'Tunísia', homeFlag: '🇲🇦', awayFlag: '🇹🇳', competition: 'Amistoso', score: 88, status: 'scheduled', day: 'today' },
    { id: '3', time: '16:00', homeTeam: 'Honduras', awayTeam: 'Nicarágua', homeFlag: '🇭🇳', awayFlag: '🇳🇮', competition: 'Amistoso', score: 85, status: 'scheduled', day: 'today' },
    { id: '4', time: '19:00', homeTeam: 'França', awayTeam: 'Noruega', homeFlag: '🇫🇷', awayFlag: '🇳🇴', competition: 'Eliminatórias', score: 82, status: 'scheduled', day: 'today' },
    { id: '5', time: '19:00', homeTeam: 'Alemanha', awayTeam: 'Itália', homeFlag: '🇩🇪', awayFlag: '🇮🇹', competition: 'Nations League', score: 79, status: 'scheduled', day: 'today' },
  ],
  matchAnalysis: {
    matchId: null,
    homeTeam: 'Brasil',
    awayTeam: 'Escócia',
    homeFlag: '🇧🇷',
    awayFlag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    stats: [
      { label: 'Gols marcados (média)', home: 2.1, away: 1.3 },
      { label: 'Gols sofridos (média)', home: 0.8, away: 1.5 },
      { label: 'Escanteios (média)', home: 6.2, away: 4.8 },
      { label: 'Finalizações (média)', home: 14.5, away: 10.2 },
      { label: 'Posse (média)', home: 58, away: 46, suffix: '%' },
      { label: 'BTTS', home: 62, away: 48, suffix: '%' },
      { label: 'Over 2.5', home: 71, away: 55, suffix: '%' },
      { label: 'Cartões (média)', home: 2.4, away: 3.1 },
    ],
    homeForm: ['W', 'W', 'D', 'W', 'W'],
    awayForm: ['L', 'D', 'W', 'L', 'D'],
  },
  ticketBuilder: {
    selections: [
      { market: 'Brasil - Vencedor', odd: 1.65 },
      { market: 'Over 2.5 Gols', odd: 1.85 },
      { market: 'Brasil +1.5 Escanteios', odd: 1.65 },
    ],
    combinedOdd: 5.04,
    probability: 55,
    ev: 12.45,
    suggestedStake: 20,
    potentialReturn: 100.8,
  },
  evMarkets: [
    { id: '1', market: 'Brasil - Vencedor', probability: 68, fairOdd: 1.47, bookmakerOdd: 1.65, ev: 12.2 },
    { id: '2', market: 'Over 2.5 Gols', probability: 62, fairOdd: 1.61, bookmakerOdd: 1.85, ev: 14.9 },
    { id: '3', market: 'BTTS - Sim', probability: 58, fairOdd: 1.72, bookmakerOdd: 1.90, ev: 10.5 },
    { id: '4', market: 'Brasil +1.5 Escanteios', probability: 71, fairOdd: 1.41, bookmakerOdd: 1.65, ev: 17.0 },
    { id: '5', market: 'Under 4.5 Cartões', probability: 65, fairOdd: 1.54, bookmakerOdd: 1.72, ev: 11.7 },
  ],
  bankrollHistory: [
    { date: '01/06', value: 980 },
    { date: '05/06', value: 1020 },
    { date: '10/06', value: 1050 },
    { date: '15/06', value: 1080 },
    { date: '20/06', value: 1120 },
    { date: '25/06', value: 1180 },
    { date: '30/06', value: 1250 },
  ],
  recentEntries: [
    { id: '1', date: '24/06', market: 'Brasil - Vencedor', odd: 1.65, stake: 20, result: 'win', profit: 13 },
    { id: '2', date: '23/06', market: 'Over 2.5 Gols', odd: 1.85, stake: 15, result: 'win', profit: 12.75 },
    { id: '3', date: '22/06', market: 'BTTS - Sim', odd: 1.90, stake: 20, result: 'loss', profit: -20 },
    { id: '4', date: '21/06', market: 'França - Vencedor', odd: 1.55, stake: 25, result: 'win', profit: 13.75 },
    { id: '5', date: '20/06', market: 'Under 3.5 Gols', odd: 1.72, stake: 20, result: 'win', profit: 14.4 },
  ],
  tip: 'Dica do dia: Times com média acima de 6 escanteios por jogo têm 73% de chance de bater Over 8.5 escanteios em casa.',
};
