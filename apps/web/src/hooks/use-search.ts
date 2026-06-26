import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { SearchResponse } from '@/types/search';

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      const { data } = await apiClient.get<SearchResponse>('/search', {
        params: { q: query },
      });
      return data;
    },
    enabled: query.trim().length >= 2,
    staleTime: 30_000,
  });
}
