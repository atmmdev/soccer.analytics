import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { AiExplanation } from '@/types/ai';

export function useMatchExplanation(matchId: string, enabled = false) {
  return useQuery({
    queryKey: ['ai', 'explain', matchId],
    queryFn: async () => {
      const { data } = await apiClient.get<AiExplanation>(
        `/ai/matches/${matchId}/explain`,
      );
      return data;
    },
    enabled: enabled && !!matchId,
  });
}
