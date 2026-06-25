import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { AlertsResponse, AlertsSummary } from '@/types/alerts';

export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const { data } = await apiClient.get<AlertsResponse>('/alerts');
      return data;
    },
    refetchInterval: 60_000,
  });
}

export function useAlertsSummary() {
  return useQuery({
    queryKey: ['alerts', 'summary'],
    queryFn: async () => {
      const { data } = await apiClient.get<AlertsSummary>('/alerts/summary');
      return data;
    },
    refetchInterval: 60_000,
  });
}
