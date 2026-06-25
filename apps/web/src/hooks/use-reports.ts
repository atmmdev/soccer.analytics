import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { PerformanceReport } from '@/types/reports';

export function usePerformanceReport() {
  return useQuery({
    queryKey: ['reports', 'performance'],
    queryFn: async () => {
      const { data } = await apiClient.get<PerformanceReport>('/reports/performance');
      return data;
    },
  });
}
