import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { Match, MatchesResponse, MatchStatus, Competition } from '@/types/match';

interface MatchFilters {
  status?: MatchStatus;
  competitionId?: string;
  date?: string;
  q?: string;
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

export function useInfiniteMatches(
  filters: Omit<MatchFilters, 'page'> = {},
  pageSize = 30,
) {
  return useInfiniteQuery({
    queryKey: ['matches', 'infinite', filters, pageSize],
    queryFn: async ({ pageParam }) => {
      const { data } = await apiClient.get<MatchesResponse>('/matches', {
        params: { ...filters, page: pageParam, limit: pageSize },
      });
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined,
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
