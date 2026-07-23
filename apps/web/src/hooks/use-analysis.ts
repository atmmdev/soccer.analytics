import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { AnalysisResult, EvPlusMarket, LatestAnalysis } from '@/types/analysis';
import type { AnalysisHistoryResponse } from '@/types/analysis-history';
import type { LeagueTicketSuggestionsResponse } from '@/types/league-suggestions';

export function useLatestAnalysis(matchId: string) {
  return useQuery({
    queryKey: ['analysis', 'latest', matchId],
    queryFn: async () => {
      const { data } = await apiClient.get<LatestAnalysis | null>(
        `/analysis/matches/${matchId}/latest`,
      );
      return data;
    },
    enabled: !!matchId,
  });
}

export function useRunAnalysis(matchId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (period: number = 10) => {
      const { data } = await apiClient.post<AnalysisResult>(
        `/analysis/matches/${matchId}/run`,
        undefined,
        { params: { period } },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysis', 'latest', matchId] });
      queryClient.invalidateQueries({ queryKey: ['analysis', 'markets'] });
      queryClient.invalidateQueries({
        queryKey: ['analysis', 'league-ticket-suggestions'],
      });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

export function useAnalyzedMarkets(
  filter: 'all' | 'ev-plus' | 'bet' = 'all',
  competitionId?: string | null,
) {
  return useQuery({
    queryKey: ['analysis', 'markets', filter, competitionId ?? null],
    queryFn: async () => {
      const { data } = await apiClient.get<EvPlusMarket[]>('/analysis/markets', {
        params: {
          filter,
          ...(competitionId ? { competitionId } : {}),
        },
      });
      return data;
    },
  });
}

export function useEvPlusMarkets() {
  return useAnalyzedMarkets('ev-plus');
}

export function useAnalysisHistory(
  page: number,
  status: 'all' | 'resolved' | 'pending' = 'all',
) {
  return useQuery({
    queryKey: ['analysis', 'history', page, status],
    queryFn: async () => {
      const { data } = await apiClient.get<AnalysisHistoryResponse>(
        '/analysis/history',
        { params: { page, limit: 20, status } },
      );
      return data;
    },
  });
}

export function useLeagueTicketSuggestions(
  legs = 3,
  competitionId?: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: [
      'analysis',
      'league-ticket-suggestions',
      legs,
      competitionId ?? 'catalog',
    ],
    queryFn: async () => {
      const { data } = await apiClient.get<LeagueTicketSuggestionsResponse>(
        '/analysis/league-ticket-suggestions',
        {
          params: {
            legs,
            ...(competitionId ? { competitionId } : {}),
          },
        },
      );
      return data;
    },
    enabled: options?.enabled ?? true,
  });
}

export interface RandomTicketSuggestion {
  day: 'today';
  minProbability: number;
  legCount: number;
  selections: Array<{
    matchId: string;
    matchLabel: string;
    competition: string | null;
    marketType: string;
    selection: string;
    odd: number;
    probability: number;
    ev: number;
    confidence: number;
  }>;
}

export function useSuggestRandomTicket() {
  return useMutation({
    mutationFn: async (params?: {
      minProbability?: number;
      minLegs?: number;
      maxLegs?: number;
    }) => {
      const { data } = await apiClient.get<RandomTicketSuggestion>(
        '/analysis/random-ticket',
        {
          params: {
            minProbability: params?.minProbability ?? 0.7,
            minLegs: params?.minLegs ?? 3,
            maxLegs: params?.maxLegs ?? 4,
          },
        },
      );
      return data;
    },
  });
}
