'use client';

import Link from 'next/link';
import { Bell, Loader2, Target, Zap } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAlerts } from '@/hooks/use-alerts';
import {
  RECOMMENDATION_LABELS,
  RECOMMENDATION_VARIANT,
} from '@/types/analysis';

function formatMatchTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AlertsPage() {
  const { data, isLoading, isError } = useAlerts();
  const { summary, alerts } = data ?? { summary: null, alerts: [] };

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader
        title="Alertas"
        subtitle="Oportunidades EV+ em jogos de hoje e amanhã"
      />

      <div className="flex-1 space-y-6 p-6">
        {summary && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-border/60 bg-card/80">
              <CardContent className="flex items-center gap-3 p-4">
                <Zap className="h-8 w-8 text-violet-400" />
                <div>
                  <p className="text-xs text-muted-foreground">EV+ ativos</p>
                  <p className="text-2xl font-bold">{summary.evPlus}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60 bg-card/80">
              <CardContent className="flex items-center gap-3 p-4">
                <Target className="h-8 w-8 text-emerald-400" />
                <div>
                  <p className="text-xs text-muted-foreground">Apostar</p>
                  <p className="text-2xl font-bold text-emerald-400">{summary.bet}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60 bg-card/80">
              <CardContent className="flex items-center gap-3 p-4">
                <Bell className="h-8 w-8 text-amber-400" />
                <div>
                  <p className="text-xs text-muted-foreground">Observar</p>
                  <p className="text-2xl font-bold text-amber-400">{summary.watch}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="text-base">Alertas EV+</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : isError ? (
              <p className="py-8 text-center text-muted-foreground">
                Erro ao carregar alertas. Verifique se a API está rodando.
              </p>
            ) : !alerts.length ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  Nenhum alerta EV+ para jogos de hoje ou amanhã.
                </p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/matches">Ver jogos e rodar análises</Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Horário</TableHead>
                    <TableHead>Jogo</TableHead>
                    <TableHead>Mercado</TableHead>
                    <TableHead className="text-right">EV</TableHead>
                    <TableHead className="text-right">Conf.</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatMatchTime(alert.matchDate)}
                        {alert.status === 'LIVE' && (
                          <Badge variant="destructive" className="ml-1 text-[10px]">
                            LIVE
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/matches/${alert.matchId}`}
                          className="font-medium hover:text-primary"
                        >
                          {alert.matchLabel}
                        </Link>
                        <p className="text-xs text-muted-foreground">{alert.competition}</p>
                      </TableCell>
                      <TableCell>{alert.market}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="success" className="font-mono">
                          +{(alert.ev * 100).toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {Math.round(alert.confidence)}%
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={RECOMMENDATION_VARIANT[alert.recommendation]}>
                          {RECOMMENDATION_LABELS[alert.recommendation]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
