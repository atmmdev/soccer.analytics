'use client';

import { Loader2, Play, Target } from 'lucide-react';
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
import { useLatestAnalysis, useRunAnalysis } from '@/hooks/use-analysis';
import {
  RECOMMENDATION_LABELS,
  RECOMMENDATION_VARIANT,
  type LatestAnalysis,
  type AnalysisResult,
} from '@/types/analysis';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';

interface AnalysisPanelProps {
  matchId: string;
}

function formatPct(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function AnalysisSummary({
  data,
}: {
  data: LatestAnalysis | AnalysisResult;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
        <p className="text-xs text-muted-foreground">Placar previsto</p>
        <p className="mt-1 font-mono text-2xl font-bold">
          {'predictedScore' in data ? data.predictedScore : data.predictedResult}
        </p>
      </div>
      <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
        <p className="text-xs text-muted-foreground">Gols esperados</p>
        <p className="mt-1 font-mono text-lg font-semibold">
          {data.homeExpectedGoals?.toFixed(2)} — {data.awayExpectedGoals?.toFixed(2)}
        </p>
      </div>
      <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
        <p className="text-xs text-muted-foreground">Confiança geral</p>
        <p className="mt-1 font-mono text-2xl font-bold text-primary">
          {data.overallConfidence}%
        </p>
      </div>
    </div>
  );
}

export function AnalysisPanel({ matchId }: AnalysisPanelProps) {
  const { data: latest, isLoading } = useLatestAnalysis(matchId);
  const runAnalysis = useRunAnalysis(matchId);

  const handleRun = () => {
    runAnalysis.mutate(10, {
      onSuccess: () => toast.success('Análise concluída e snapshot salvo'),
      onError: (error) => {
        const message = isAxiosError(error)
          ? (error.response?.data as { message?: string })?.message ??
            error.message
          : 'Erro desconhecido';
        toast.error(`Falha ao executar análise: ${message}`);
      },
    });
  };

  const display = runAnalysis.data ?? latest;

  return (
    <Card className="border-border/60 bg-card/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-primary" />
            Analysis Engine
          </CardTitle>
          {latest?.analyzedAt && (
            <p className="mt-1 text-xs text-muted-foreground">
              Última análise:{' '}
              {new Date(latest.analyzedAt).toLocaleString('pt-BR')}
            </p>
          )}
        </div>
        <Button
          size="sm"
          onClick={handleRun}
          disabled={runAnalysis.isPending}
        >
          {runAnalysis.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          Executar Análise
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading && !display ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : !display ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma análise ainda. Execute o engine para calcular probabilidades,
            EV e recomendações.
          </p>
        ) : (
          <>
            <AnalysisSummary data={display} />

            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Mercado</TableHead>
                  <TableHead className="text-right">Prob.</TableHead>
                  <TableHead className="text-right">Odd justa</TableHead>
                  <TableHead className="text-right">Odd casa</TableHead>
                  <TableHead className="text-right">EV</TableHead>
                  <TableHead className="text-right">Conf.</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {display.markets.map((m) => (
                  <TableRow key={m.selection}>
                    <TableCell className="font-medium">{m.selection}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatPct(m.probability)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {m.fairOdd.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {m.bookmakerOdd.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={m.ev > 0 ? 'success' : 'secondary'}
                        className="font-mono"
                      >
                        {m.ev >= 0 ? '+' : ''}
                        {formatPct(m.ev)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {m.confidence}%
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={RECOMMENDATION_VARIANT[m.recommendation]}>
                        {RECOMMENDATION_LABELS[m.recommendation]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  );
}
