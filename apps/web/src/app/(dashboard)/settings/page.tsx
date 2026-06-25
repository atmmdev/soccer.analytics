'use client';

import { useState } from 'react';
import { Database, Loader2, RefreshCw } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  useDataStatus,
  useImportFixtures,
  useImportOdds,
} from '@/hooks/use-data';
import { toast } from 'sonner';

export default function SettingsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const { data: status, isLoading } = useDataStatus();
  const importFixtures = useImportFixtures();
  const importOdds = useImportOdds();

  const provider = status?.providers[0];
  const isConfigured = provider?.configured ?? false;

  const handleImportFixtures = () => {
    importFixtures.mutate(date, {
      onSuccess: (result) => {
        toast.success(
          `${result.fixturesCreated} criados, ${result.fixturesUpdated} atualizados (${result.fixturesFound} encontrados)`,
        );
        if (result.errors.length > 0) {
          toast.warning(`${result.errors.length} erro(s) parcial(is)`);
        }
      },
      onError: (err: Error & { response?: { data?: { message?: string } } }) => {
        toast.error(err.response?.data?.message ?? err.message ?? 'Falha na importação');
      },
    });
  };

  const handleImportOdds = () => {
    importOdds.mutate(date, {
      onSuccess: (result) => {
        if (result.oddsCreated === 0) {
          toast.warning(
            result.errors[0] ??
              `Nenhuma odd salva. API retornou ${result.fixturesWithOdds} jogos com odds, ${result.skippedNoOdds} sem correspondência no banco.`,
          );
          return;
        }
        toast.success(
          `${result.oddsCreated} odds em ${result.matchesProcessed} jogos (${result.fixturesWithOdds} com odds na API)`,
        );
        if (result.errors.length > 0) {
          toast.warning(`${result.errors.length} aviso(s): ${result.errors[0]}`);
        }
      },
      onError: (err: Error & { response?: { data?: { message?: string } } }) => {
        toast.error(err.response?.data?.message ?? err.message ?? 'Falha na importação');
      },
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader title="Configurações" />

      <div className="flex-1 space-y-6 p-6">
        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5 text-primary" />
              Data Engine
            </CardTitle>
            <CardDescription>
              Importação de jogos e odds via API-Football. Sem chave configurada, os dados
              mock do seed continuam disponíveis.
            </CardDescription>
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

            <div className="space-y-2">
              <label htmlFor="import-date" className="text-sm font-medium">
                Data de importação
              </label>
              <Input
                id="import-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="max-w-xs"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleImportFixtures}
                disabled={!isConfigured || importFixtures.isPending}
              >
                {importFixtures.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Importar jogos
              </Button>
              <Button
                variant="outline"
                onClick={handleImportOdds}
                disabled={!isConfigured || importOdds.isPending}
              >
                {importOdds.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Importar odds
              </Button>
            </div>

            {!isConfigured && (
              <p className="text-xs text-muted-foreground">
                Configure <code className="text-primary">API_FOOTBALL_KEY</code> em{' '}
                <code>apps/api/.env</code> e reinicie a API. Plano gratuito: 100 req/dia.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
