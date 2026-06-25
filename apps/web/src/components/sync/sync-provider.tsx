'use client';

import { Loader2, RefreshCw } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { SyncStatus } from '@/hooks/use-sync';
import { useSyncEnsure, useSyncStatus } from '@/hooks/use-sync';

const STEP_LABELS: Record<string, string> = {
  starting: 'Iniciando',
  fixtures: 'Importando jogos',
  resolve: 'Atualizando resultados',
  odds: 'Importando odds',
  statistics: 'Importando estatísticas',
  analysis: 'Rodando análises Poisson',
};

function SyncBanner({ status, step }: { status: SyncStatus['status']; step: string | null }) {
  const label = step ? (STEP_LABELS[step] ?? step) : 'Sincronizando';

  if (status === 'skipped') {
    return (
      <div className="border-b border-amber-500/30 bg-amber-500/10 px-6 py-2 text-sm text-amber-200">
        API-Football não configurada — defina <code className="text-amber-100">API_FOOTBALL_KEY</code>{' '}
        em apps/api/.env
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="border-b border-red-500/30 bg-red-500/10 px-6 py-2 text-sm text-red-200">
        Falha na sincronização automática. Tente novamente em Configurações.
      </div>
    );
  }

  if (status !== 'running') return null;

  return (
    <div className="flex items-center gap-2 border-b border-primary/30 bg-primary/10 px-6 py-2 text-sm text-primary">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Sincronização automática: {label}…</span>
    </div>
  );
}

export function SyncProvider({ children }: { children: React.ReactNode }) {
  useSyncEnsure();
  const { data: status } = useSyncStatus();
  const queryClient = useQueryClient();

  const forceSync = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<SyncStatus>('/sync/run');
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['sync'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return (
    <>
      <SyncBanner status={status?.status ?? 'idle'} step={status?.currentStep ?? null} />
      {status?.status === 'completed' && status.message && (
        <div className="flex items-center justify-between border-b border-emerald-500/20 bg-emerald-500/5 px-6 py-1.5 text-xs text-emerald-300">
          <span>{status.message}</span>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-emerald-400 hover:underline"
            onClick={() => forceSync.mutate()}
            disabled={forceSync.isPending}
          >
            <RefreshCw className="h-3 w-3" />
            Atualizar agora
          </button>
        </div>
      )}
      {children}
    </>
  );
}
