'use client';

import { Download, Loader2, Target, TrendingUp, Wallet } from 'lucide-react';
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
import { usePerformanceReport } from '@/hooks/use-reports';
import type { PerformanceReport } from '@/types/reports';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const STATUS_LABELS: Record<string, string> = {
  WON: 'Green',
  LOST: 'Red',
  PLACED: 'Aberto',
  DRAFT: 'Rascunho',
};

export default function ReportsPage() {
  const { data, isLoading, isError } = usePerformanceReport();

  function handleExport() {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-full flex-col">
        <AppHeader title="Relatórios" subtitle="Performance e precisão das análises" />
        <div className="p-6 text-muted-foreground">Não foi possível carregar o relatório.</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader title="Relatórios" subtitle="Performance da banca e precisão das análises Poisson" />

      <div className="flex justify-end px-6 pt-4">
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Exportar JSON
        </Button>
      </div>

      <div className="flex-1 space-y-6 p-6 pt-4">
        <BankrollSection report={data} />
        <AnalysisSection report={data} />
        <TicketsSection report={data} />
      </div>
    </div>
  );
}

function BankrollSection({ report }: { report: PerformanceReport }) {
  const { bankroll } = report;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="border-border/60 bg-card/80">
        <CardContent className="flex items-center gap-3 p-4">
          <Wallet className="h-8 w-8 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Banca atual</p>
            <p className="text-2xl font-bold">{formatCurrency(bankroll.balance)}</p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-border/60 bg-card/80">
        <CardContent className="flex items-center gap-3 p-4">
          <TrendingUp className="h-8 w-8 text-emerald-400" />
          <div>
            <p className="text-xs text-muted-foreground">Lucro / ROI</p>
            <p className="text-2xl font-bold">
              {formatCurrency(bankroll.profit)}{' '}
              <span className="text-sm text-muted-foreground">({bankroll.roi}%)</span>
            </p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-border/60 bg-card/80">
        <CardContent className="flex items-center gap-3 p-4">
          <Target className="h-8 w-8 text-violet-400" />
          <div>
            <p className="text-xs text-muted-foreground">Win rate</p>
            <p className="text-2xl font-bold">{bankroll.winRate}%</p>
            <p className="text-xs text-muted-foreground">
              {bankroll.ticketsWon}G / {bankroll.ticketsLost}R
            </p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-border/60 bg-card/80">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Max drawdown</p>
          <p className="text-2xl font-bold text-red-400">{bankroll.maxDrawdown}%</p>
          <p className="text-xs text-muted-foreground">
            Apostado: {formatCurrency(bankroll.totalStaked)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function AnalysisSection({ report }: { report: PerformanceReport }) {
  const { analysis } = report;

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader>
        <CardTitle className="text-base">Precisão das Análises</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Snapshots resolvidos: </span>
            <span className="font-semibold">{analysis.snapshotsResolved}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Taxa de acerto: </span>
            <span className="font-semibold text-emerald-400">{analysis.accuracyRate}%</span>
          </div>
          <div>
            <span className="text-muted-foreground">Mercados EV+ ativos: </span>
            <span className="font-semibold text-violet-400">{analysis.evPlusMarkets}</span>
          </div>
        </div>

        {analysis.recentResults.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma análise resolvida ainda. Rode análises e aguarde jogos finalizarem.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jogo</TableHead>
                <TableHead>Previsto</TableHead>
                <TableHead>Real</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analysis.recentResults.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{r.matchLabel}</TableCell>
                  <TableCell className="font-mono">{r.predicted ?? '—'}</TableCell>
                  <TableCell className="font-mono">{r.actual ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={r.accurate ? 'default' : 'destructive'}>
                      {r.accurate ? 'Acertou' : 'Errou'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(r.analyzedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function TicketsSection({ report }: { report: PerformanceReport }) {
  const { tickets } = report;

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader>
        <CardTitle className="text-base">Bilhetes Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        {tickets.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum bilhete registrado.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stake</TableHead>
                <TableHead>Odd</TableHead>
                <TableHead>Retorno</TableHead>
                <TableHead>Atualizado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        t.status === 'WON'
                          ? 'default'
                          : t.status === 'LOST'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {STATUS_LABELS[t.status] ?? t.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(t.stake)}</TableCell>
                  <TableCell className="font-mono">{t.combinedOdd.toFixed(2)}</TableCell>
                  <TableCell>
                    {t.actualReturn != null ? formatCurrency(t.actualReturn) : '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(t.updatedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
