'use client';

import { Database, Loader2, RefreshCw } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDataStatus } from '@/hooks/use-data';
import { useSyncStatus } from '@/hooks/use-sync';
import { apiClient } from '@/lib/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const STEP_LABELS: Record<string, string> = {
  starting: 'Iniciando',
  fixtures: 'Importando jogos',
  resolve: 'Atualizando resultados',
  odds: 'Importando odds',
  statistics: 'Importando estatísticas',
  analysis: 'Rodando análises Poisson',
};

export default function SettingsPage() {
  const { data: status, isLoading } = useDataStatus();
  const { data: sync, isLoading: loadingSync } = useSyncStatus();
  const queryClient = useQueryClient();

  const forceSync = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/sync/run');
      return data;
    },
    onSuccess: () => {
      toast.success('Sincronização iniciada');
      void queryClient.invalidateQueries({ queryKey: ['sync'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: () => toast.error('Falha ao iniciar sincronização'),
  });

  const provider = status?.providers[0];
  const isConfigured = provider?.configured ?? false;

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader title="Configurações" />

      <div className="flex-1 space-y-6 p-6">
        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <RefreshCw className="h-5 w-5 text-primary" />
              Sincronização automática
            </CardTitle>
            <CardDescription>
              Ao abrir o sistema, jogos, odds, estatísticas e análises Poisson são atualizados
              automaticamente (hoje, amanhã e histórico recente).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingSync ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando status...
              </div>
            ) : sync ? (
              <div className="space-y-3 rounded-lg border border-border bg-secondary/30 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">Status</p>
                  <Badge
                    variant={
                      sync.status === 'completed'
                        ? 'default'
                        : sync.status === 'running'
                          ? 'secondary'
                          : sync.status === 'failed'
                            ? 'destructive'
                            : 'outline'
                    }
                  >
                    {sync.status === 'running'
                      ? 'Sincronizando'
                      : sync.status === 'completed'
                        ? 'Atualizado'
                        : sync.status === 'failed'
                          ? 'Falhou'
                          : sync.status === 'skipped'
                            ? 'Desativado'
                            : 'Aguardando'}
                  </Badge>
                </div>
                {sync.currentStep && sync.status === 'running' && (
                  <p className="text-sm text-muted-foreground">
                    Etapa: {STEP_LABELS[sync.currentStep] ?? sync.currentStep}
                  </p>
                )}
                {sync.completedAt && (
                  <p className="text-xs text-muted-foreground">
                    Última sync:{' '}
                    {new Date(sync.completedAt).toLocaleString('pt-BR')}
                    {sync.syncDate ? ` · dia ${sync.syncDate}` : ''}
                  </p>
                )}
                {sync.message && (
                  <p className="text-sm text-muted-foreground">{sync.message}</p>
                )}
              </div>
            ) : null}

            <Button
              onClick={() => forceSync.mutate()}
              disabled={!isConfigured || forceSync.isPending || sync?.status === 'running'}
            >
              {forceSync.isPending || sync?.status === 'running' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Forçar sincronização agora
            </Button>

            <p className="text-xs text-muted-foreground">
              A sync roda ao iniciar a API e a cada acesso autenticado (máx. a cada 4h).
              Estatísticas respeitam o rate limit da API-Football (plano free: 10 req/min).
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5 text-primary" />
              Provedor de dados
            </CardTitle>
            <CardDescription>API-Football — fonte única de jogos, odds e estatísticas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Verificando provedor...
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4">
                <div>
                  <p className="font-medium">API-Football</p>
                  <p className="mt-1 text-sm text-muted-foreground">{provider?.message}</p>
                </div>
                <Badge variant={isConfigured ? 'default' : 'secondary'}>
                  {isConfigured ? 'Ativa' : 'Não configurada'}
                </Badge>
              </div>
            )}

            {!isConfigured && (
              <p className="text-xs text-muted-foreground">
                Configure <code className="text-primary">API_FOOTBALL_KEY</code> em{' '}
                <code>apps/api/.env</code> e reinicie a API.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
