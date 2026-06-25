import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { Match, MatchesResponse, MatchStatus, Competition } from '@/types/match';

interface MatchFilters {
  status?: MatchStatus;
  competitionId?: string;
  date?: string;
  page?: number;
  limit?: number;
}

export function useMatches(filters: MatchFilters = {}) {
  return useQuery({
    queryKey: ['matches', filters],
    queryFn: async () => {
      const { data } = await apiClient.get<MatchesResponse>('/matches', {
        params: filters,
      });
      return data;
    },
  });
}

export function useMatch(id: string) {
  return useQuery({
    queryKey: ['match', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Match & { odds?: unknown[] }>(`/matches/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCompetitions() {
  return useQuery({
    queryKey: ['competitions'],
    queryFn: async () => {
      const { data } = await apiClient.get<(Competition & { _count: { matches: number } })[]>(
        '/matches/competitions',
      );
      return data;
    },
  });
}
