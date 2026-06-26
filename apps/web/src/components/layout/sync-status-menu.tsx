'use client';

import Link from 'next/link';
import { Loader2, RefreshCw } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { apiClient } from '@/lib/api/client';
import { SYNC_STEP_LABELS, useSyncStatus, type SyncStatus } from '@/hooks/use-sync';
import { cn } from '@/lib/utils';

function statusLabel(status: SyncStatus['status']) {
  switch (status) {
    case 'running':
      return 'Sincronizando';
    case 'completed':
      return 'Atualizado';
    case 'failed':
      return 'Falhou';
    case 'skipped':
      return 'Não configurada';
    default:
      return 'API';
  }
}

function statusDescription(sync: SyncStatus) {
  if (sync.status === 'running' && sync.currentStep) {
    return `${SYNC_STEP_LABELS[sync.currentStep] ?? sync.currentStep}…`;
  }
  if (sync.message) return sync.message;
  if (sync.status === 'failed') {
    return 'Falha na sincronização automática. Tente novamente abaixo.';
  }
  if (sync.status === 'skipped') {
    return 'Defina API_FOOTBALL_KEY em apps/api/.env';
  }
  if (sync.completedAt) {
    return `Última sync: ${new Date(sync.completedAt).toLocaleString('pt-BR')}`;
  }
  return 'Aguardando primeira sincronização';
}

export function SyncStatusMenu() {
  const queryClient = useQueryClient();
  const { data: sync, isLoading } = useSyncStatus();

  const forceSync = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<SyncStatus>('/sync/run');
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['sync'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['matches'] });
      void queryClient.invalidateQueries({ queryKey: ['analysis'] });
    },
  });

  const status = sync?.status ?? 'idle';
  const isRunning = status === 'running' || forceSync.isPending;
  const showAlert =
    status === 'failed' || status === 'skipped' || (status === 'running' && !isLoading);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative h-9 w-9 shrink-0"
          aria-label="Status da sincronização API"
        >
          {isRunning ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <RefreshCw
              className={cn(
                'h-4 w-4',
                status === 'failed' && 'text-destructive',
                status === 'skipped' && 'text-amber-400',
                status === 'completed' && 'text-emerald-400',
              )}
            />
          )}
          {showAlert && !isRunning && (
            <span
              className={cn(
                'absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full',
                status === 'failed' ? 'bg-destructive' : 'bg-amber-400',
              )}
            />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Sincronização API-Football</p>
            <p className="text-xs text-muted-foreground">{statusLabel(status)}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {sync ? (
          <div className="space-y-2 px-2 py-1.5 text-xs text-muted-foreground">
            <p>{statusDescription(sync)}</p>
            {sync.syncDate && (
              <p>
                Dia da sync: <span className="text-foreground">{sync.syncDate}</span>
              </p>
            )}
            {sync.status === 'running' && sync.currentStep && (
              <p className="flex items-center gap-1.5 text-primary">
                <Loader2 className="h-3 w-3 animate-spin" />
                {SYNC_STEP_LABELS[sync.currentStep] ?? sync.currentStep}
              </p>
            )}
          </div>
        ) : (
          <p className="px-2 py-1.5 text-xs text-muted-foreground">Carregando status…</p>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          disabled={!sync?.configured || isRunning}
          onClick={() => forceSync.mutate()}
        >
          <RefreshCw className={cn('mr-2 h-4 w-4', isRunning && 'animate-spin')} />
          {isRunning ? 'Sincronizando…' : 'Atualizar agora'}
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/settings">
            Abrir configurações
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
