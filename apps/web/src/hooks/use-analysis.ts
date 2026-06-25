import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { AnalysisResult, EvPlusMarket, LatestAnalysis } from '@/types/analysis';

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
    },
  });
}

export function useAnalyzedMarkets(filter: 'all' | 'ev-plus' | 'bet' = 'all') {
  return useQuery({
    queryKey: ['analysis', 'markets', filter],
    queryFn: async () => {
      const { data } = await apiClient.get<EvPlusMarket[]>('/analysis/markets', {
        params: { filter },
      });
      return data;
    },
  });
}

export function useEvPlusMarkets() {
  return useAnalyzedMarkets('ev-plus');
}
