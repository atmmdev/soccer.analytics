import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { ResearchStrategy, SimulationResult, StrategyFilters } from '@/types/research';

export function useResearchStrategies() {
  return useQuery({
    queryKey: ['research', 'strategies'],
    queryFn: async () => {
      const { data } = await apiClient.get<ResearchStrategy[]>('/research/strategies');
      return data;
    },
  });
}

export function useResearchStrategy(id: string) {
  return useQuery({
    queryKey: ['research', 'strategies', id],
    queryFn: async () => {
      const { data } = await apiClient.get<ResearchStrategy>(`/research/strategies/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function usePreviewSimulation() {
  return useMutation({
    mutationFn: async (filters: StrategyFilters) => {
      const { data } = await apiClient.post<SimulationResult>('/research/simulate', filters);
      return data;
    },
  });
}

export function useCreateStrategy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      description?: string;
      filters: StrategyFilters;
    }) => {
      const { data } = await apiClient.post<ResearchStrategy>('/research/strategies', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['research'] });
    },
  });
}

export function useRunSimulation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (strategyId: string) => {
      const { data } = await apiClient.post<{ result: SimulationResult }>(
        `/research/strategies/${strategyId}/run`,
      );
      return data.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['research'] });
    },
  });
}

export function useDeleteStrategy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/research/strategies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['research'] });
    },
  });
}
