'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, History, Loader2 } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAnalysisHistory } from '@/hooks/use-analysis';

type HistoryFilter = 'all' | 'resolved' | 'pending';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AnalysisHistoryPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const { data, isLoading, isError } = useAnalysisHistory(page, filter);

  const resolved = data?.data.filter((r) => r.accuracy != null) ?? [];
  const accurate = resolved.filter((r) => r.accuracy === 100).length;
  const accuracyRate =
    resolved.length > 0 ? Math.round((accurate / resolved.length) * 1000) / 10 : null;

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader
        title="Histórico de Análises"
        subtitle="Snapshots Poisson — previsões, resultados e EV+"
      />

      <div className="flex-1 space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-border/60 bg-card/80">
            <CardContent className="flex items-center gap-3 p-4">
              <History className="h-8 w-8 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Total de análises</p>
                <p className="text-2xl font-bold">{data?.meta.total ?? '—'}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card/80">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Resolvidas (página)</p>
              <p className="text-2xl font-bold">{resolved.length}</p>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card/80">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Taxa de acerto (página)</p>
              <p className="text-2xl font-bold text-emerald-400">
                {accuracyRate != null ? `${accuracyRate}%` : '—'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/60 bg-card/80">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
            <CardTitle className="text-base">Snapshots</CardTitle>
            <Tabs
              value={filter}
              onValueChange={(v) => {
                setFilter(v as HistoryFilter);
                setPage(1);
              }}
            >
              <TabsList>
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="pending">Pendentes</TabsTrigger>
                <TabsTrigger value="resolved">Resolvidas</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : isError ? (
              <p className="py-8 text-center text-muted-foreground">
                Erro ao carregar histórico.
              </p>
            ) : !data?.data.length ? (
              <p className="py-8 text-center text-muted-foreground">
                Nenhuma análise registrada. A sync automática roda análises nos jogos do dia.
              </p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jogo</TableHead>
                      <TableHead>Previsto</TableHead>
                      <TableHead>Real</TableHead>
                      <TableHead>Conf.</TableHead>
                      <TableHead>EV+</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.data.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <Link
                            href={`/matches/${row.matchId}`}
                            className="font-medium hover:text-primary hover:underline"
                          >
                            {row.matchLabel}
                          </Link>
                          <p className="text-xs text-muted-foreground">{row.competition}</p>
                        </TableCell>
                        <TableCell className="font-mono">{row.predictedResult ?? '—'}</TableCell>
                        <TableCell className="font-mono">{row.actualResult ?? '—'}</TableCell>
                        <TableCell className="font-mono">{row.overallConfidence}%</TableCell>
                        <TableCell>
                          {row.evPlusCount > 0 ? (
                            <span className="text-emerald-400">{row.evPlusCount}</span>
                          ) : (
                            '—'
                          )}
                          {row.betCount > 0 && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              ({row.betCount} BET)
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {row.accuracy == null ? (
                            <Badge variant="secondary">Aguardando</Badge>
                          ) : row.accuracy === 100 ? (
                            <Badge variant="default">Acertou</Badge>
                          ) : (
                            <Badge variant="destructive">Errou</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(row.analyzedAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {data.meta.totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Página {data.meta.page} de {data.meta.totalPages} · {data.meta.total}{' '}
                      análises
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= data.meta.totalPages}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        Próxima
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
