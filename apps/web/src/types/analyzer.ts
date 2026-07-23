export type AnalysisView = 'home' | 'away' | 'h2h';
export type AnalysisPeriod = 5 | 10 | 15 | 20;

export interface StatRow {
  label: string;
  home: number;
  away: number;
  suffix?: string;
}

export interface MatchAnalysisResult {
  match: {
    id: string;
    matchDate: string;
    status: string;
    competition: string;
    homeTeam: { id: string; name: string; country: string | null };
    awayTeam: { id: string; name: string; country: string | null };
  };
  period: number;
  view: AnalysisView;
  stats: StatRow[];
  homeForm: ('W' | 'D' | 'L')[];
  awayForm: ('W' | 'D' | 'L')[];
  h2h?: {
    homeWins: number;
    awayWins: number;
    draws: number;
    totalGames: number;
    lastMeetings: string[];
    meetings?: Array<{
      date: string;
      score: string;
      scoreAsPlayed: string;
      homeName: string;
      awayName: string;
      competition?: string | null;
    }>;
  };
  meta: { source: string; note: string };
}

export const PERIODS: AnalysisPeriod[] = [5, 10, 15, 20];

export const VIEW_LABELS: Record<AnalysisView, string> = {
  home: 'Casa',
  away: 'Fora',
  h2h: 'H2H',
};
