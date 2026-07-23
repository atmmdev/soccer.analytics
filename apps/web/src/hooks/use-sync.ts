import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

export interface ApiFootballUsage {
  date: string;
  used: number;
  dailyLimit: number;
  minuteLimit: number;
  remaining: number;
  percentUsed: number;
  remainingFromApi: number | null;
  limitFromApi: number | null;
  lastRequestAt: string | null;
  lastPath: string | null;
}

export interface SyncStatus {
  status: 'idle' | 'running' | 'completed' | 'failed' | 'skipped';
  syncDate: string | null;
  currentStep: string | null;
  configured: boolean;
  message: string | null;
  completedAt: string | null;
  result: Record<string, unknown> | null;
  apiUsage: ApiFootballUsage | null;
}

export interface SyncResultSummary {
  fixturesUpdated: number;
  oddsCreated: number;
  matchesWithOdds: number;
  analysesRun: number;
  remainingWithoutOdds: number;
  errors: string[];
}

export const SYNC_STEP_LABELS: Record<string, string> = {
  starting: 'Iniciando',
  fixtures: 'Importando jogos',
  resolve: 'Atualizando resultados',
  odds: 'Importando odds',
  'odds-pending': 'Odds pendentes',
  statistics: 'Importando estatísticas',
  players: 'Importando stats de jogadores',
  analysis: 'Rodando análises Poisson',
};

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function summarizeSyncResult(
  result: Record<string, unknown> | null | undefined,
): SyncResultSummary | null {
  if (!result) return null;

  const fixtures = asArray(result.fixtures);
  const odds = asArray(result.odds);
  const fixtureErrors = asArray(result.fixtureErrors).map(String);
  const oddsErrors = asArray(result.oddsErrors).map(String);

  let fixturesUpdated = 0;
  for (const item of fixtures) {
    const row = asRecord(item);
    if (!row) continue;
    fixturesUpdated += Number(row.fixturesUpdated ?? 0) + Number(row.fixturesCreated ?? 0);
  }

  let oddsCreated = 0;
  let matchesWithOdds = 0;
  let remainingWithoutOdds = 0;
  const oddsItemErrors: string[] = [];

  for (const item of odds) {
    const row = asRecord(item);
    if (!row) continue;
    oddsCreated += Number(row.oddsCreated ?? 0);
    matchesWithOdds += Number(row.matchesProcessed ?? 0);
    remainingWithoutOdds += Number(row.remainingWithoutOdds ?? 0);
    for (const err of asArray(row.errors)) {
      oddsItemErrors.push(String(err));
    }
  }

  return {
    fixturesUpdated,
    oddsCreated,
    matchesWithOdds,
    analysesRun: Number(result.analysesRun ?? 0),
    remainingWithoutOdds,
    errors: [...fixtureErrors, ...oddsErrors, ...oddsItemErrors].slice(0, 5),
  };
}

export function useSyncStatus() {
  return useQuery({
    queryKey: ['sync', 'status'],
    queryFn: async () => {
      const { data } = await apiClient.get<SyncStatus>('/sync/status');
      return data;
    },
    // Atualiza o contador de requests mesmo fora de sync
    refetchInterval: (query) =>
      query.state.data?.status === 'running' ? 4000 : 30_000,
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
