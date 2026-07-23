import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { DashboardData, MatchAnalysisData } from '@/types/dashboard';

export function useDashboard(options?: { refetchInterval?: number | false }) {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardData>('/dashboard');
      return data;
    },
    refetchInterval: options?.refetchInterval,
  });
}

export function useDashboardMatchAnalysis(matchId: string | null) {
  return useQuery({
    queryKey: ['dashboard', 'match-analysis', matchId],
    queryFn: async () => {
      const { data } = await apiClient.get<MatchAnalysisData>(
        `/dashboard/match-analysis/${matchId}`,
      );
      return data;
    },
    enabled: !!matchId,
  });
}
