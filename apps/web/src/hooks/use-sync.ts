import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

export interface SyncStatus {
  status: 'idle' | 'running' | 'completed' | 'failed' | 'skipped';
  syncDate: string | null;
  currentStep: string | null;
  configured: boolean;
  message: string | null;
  completedAt: string | null;
  result: Record<string, unknown> | null;
}

export function useSyncStatus() {
  return useQuery({
    queryKey: ['sync', 'status'],
    queryFn: async () => {
      const { data } = await apiClient.get<SyncStatus>('/sync/status');
      return data;
    },
    refetchInterval: (query) =>
      query.state.data?.status === 'running' ? 4000 : false,
  });
}

export function useSyncEnsure() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['sync', 'ensure'],
    queryFn: async () => {
      const { data } = await apiClient.post<SyncStatus>('/sync/ensure');
      return data;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.data?.status === 'completed') {
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['matches'] });
      void queryClient.invalidateQueries({ queryKey: ['analysis'] });
      void queryClient.invalidateQueries({ queryKey: ['alerts'] });
    }
  }, [query.data?.status, queryClient]);

  return query;
}

export function useForceSync() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['sync', 'force'],
    queryFn: async () => {
      const { data } = await apiClient.post<SyncStatus>('/sync/run');
      return data;
    },
    enabled: false,
    refetchInterval: (query) =>
      query.state.data?.status === 'running' ? 4000 : false,
  });
}
