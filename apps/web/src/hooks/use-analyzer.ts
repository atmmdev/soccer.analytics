import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { AnalysisPeriod, AnalysisView, MatchAnalysisResult } from '@/types/analyzer';

export function useMatchAnalysis(
  matchId: string | null,
  period: AnalysisPeriod,
  view: AnalysisView,
) {
  return useQuery({
    queryKey: ['analyzer', matchId, period, view],
    queryFn: async () => {
      const { data } = await apiClient.get<MatchAnalysisResult>(
        `/analyzer/matches/${matchId}`,
        { params: { period, view } },
      );
      return data;
    },
    enabled: !!matchId,
  });
}
