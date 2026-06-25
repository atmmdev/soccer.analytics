import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type {
  DataStatus,
  ImportFixturesResult,
  ImportOddsResult,
  ImportStatisticsResult,
} from '@/types/data';

export function useDataStatus() {
  return useQuery({
    queryKey: ['data', 'status'],
    queryFn: async () => {
      const { data } = await apiClient.get<DataStatus>('/data/status');
      return data;
    },
  });
}

export function useImportFixtures() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (date: string) => {
      const { data } = await apiClient.post<ImportFixturesResult>(
        '/data/import/fixtures',
        undefined,
        { params: { date } },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useImportOdds() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (date: string) => {
      const { data } = await apiClient.post<ImportOddsResult>(
        '/data/import/odds',
        undefined,
        { params: { date } },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['analysis'] });
    },
  });
}

export function useImportStatistics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (date: string) => {
      const { data } = await apiClient.post<ImportStatisticsResult>(
        '/data/import/statistics',
        undefined,
        { params: { date } },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['analyzer'] });
    },
  });
}
