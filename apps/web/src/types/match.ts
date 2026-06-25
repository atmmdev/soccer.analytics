export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';

export interface Team {
  id: string;
  name: string;
  shortName: string | null;
  country: string | null;
}

export interface Competition {
  id: string;
  name: string;
  country: string | null;
}

export interface Match {
  id: string;
  matchDate: string;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  round: string | null;
  venue: string | null;
  homeTeam: Team;
  awayTeam: Team;
  competition: Competition;
}

export interface MatchesResponse {
  data: Match[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const STATUS_LABELS: Record<MatchStatus, string> = {
  SCHEDULED: 'Agendado',
  LIVE: 'Ao Vivo',
  FINISHED: 'Finalizado',
  POSTPONED: 'Adiado',
  CANCELLED: 'Cancelado',
};

export const STATUS_VARIANT: Record<MatchStatus, 'default' | 'success' | 'warning' | 'secondary' | 'destructive'> = {
  SCHEDULED: 'secondary',
  LIVE: 'success',
  FINISHED: 'default',
  POSTPONED: 'warning',
  CANCELLED: 'destructive',
};
