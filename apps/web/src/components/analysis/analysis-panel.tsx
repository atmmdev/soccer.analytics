'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Bot, Loader2, Play, Plus, Target } from 'lucide-react';
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
  MARKET_TYPE_LABELS,
  type LatestAnalysis,
  type AnalysisResult,
} from '@/types/analysis';
import { useTicketDraftStore } from '@/stores/ticket-draft.store';
import { TicketDraftBanner } from '@/components/tickets/ticket-draft-banner';
import { AiExplanationPanel } from '@/components/ai/explanation-panel';
import { useMatchExplanation } from '@/hooks/use-ai';
import type { MarketType } from '@/types/ticket';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';

interface AnalysisPanelProps {
  matchId: string;
  matchLabel?: string;
}

function formatPct(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function AnalysisSummary({
  data,
}: {
  data: LatestAnalysis | AnalysisResult;
}) {
  const predicted =
    'predictedScore' in data ? data.predictedScore : data.predictedResult;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
          <p className="text-xs text-muted-foreground">Placar previsto</p>
          <p className="mt-1 font-mono text-2xl font-bold">{predicted}</p>
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
      {(data.expectedCorners != null || data.expectedCards != null) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.expectedCorners != null && (
            <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
              <p className="text-xs text-muted-foreground">Escanteios esperados (total)</p>
              <p className="mt-1 font-mono text-lg font-semibold">
                {data.expectedCorners.toFixed(1)}
              </p>
            </div>
          )}
          {data.expectedCards != null && (
            <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
              <p className="text-xs text-muted-foreground">Cartões esperados (total)</p>
              <p className="mt-1 font-mono text-lg font-semibold">
                {data.expectedCards.toFixed(1)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AnalysisPanel({ matchId, matchLabel }: AnalysisPanelProps) {
  const router = useRouter();
  const { data: latest, isLoading } = useLatestAnalysis(matchId);
  const runAnalysis = useRunAnalysis(matchId);
  const addSelection = useTicketDraftStore((s) => s.addSelection);
  const draftCount = useTicketDraftStore((s) => s.selections.length);
  const [showExplanation, setShowExplanation] = useState(false);
  const {
    data: explanation,
    isLoading: loadingExplanation,
    isError: explanationError,
  } = useMatchExplanation(matchId, showExplanation);

  const resolvedLabel = matchLabel ?? 'Jogo';

  type AnalysisMarket = AnalysisResult['markets'][number];

  const handleAddToTicket = (market: AnalysisMarket) => {
    const added = addSelection({
      matchId,
      matchLabel: resolvedLabel,
      marketType: market.marketType as MarketType,
      selection: market.selection,
      odd: market.bookmakerOdd,
      probability: market.probability,
      ev: market.ev,
      confidence: market.confidence,
    });
    if (added) {
      toast.success(`${market.selection} adicionado ao bilhete`, {
        action: {
          label: 'Ver bilhete',
          onClick: () => router.push('/tickets'),
        },
      });
    } else {
      toast.info('Seleção já está no bilhete');
    }
  };

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
          <p className="mt-1 text-xs text-muted-foreground">
            Use o botão <Plus className="inline h-3 w-3" /> para montar um bilhete em{' '}
            <Link href="/tickets" className="text-primary hover:underline">
              Bilhetes
            </Link>
            {draftCount > 0 ? ` (${draftCount} no rascunho)` : ''}
          </p>
          {latest?.analyzedAt && (
            <p className="mt-1 text-xs text-muted-foreground">
              Última análise:{' '}
              {new Date(latest.analyzedAt).toLocaleString('pt-BR')}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {display && (
            <Button
              size="sm"
              variant="outline"
              disabled={loadingExplanation}
              onClick={() => setShowExplanation(true)}
            >
              {loadingExplanation ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Bot className="mr-2 h-4 w-4" />
              )}
              Explicar
            </Button>
          )}
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
        </div>
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
                  <TableHead className="text-right">Bilhete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {display.markets.map((m) => (
                  <TableRow key={`${m.marketType}-${m.selection}`}>
                    <TableCell>
                      <div className="font-medium">{m.selection}</div>
                      <div className="text-xs text-muted-foreground">
                        {MARKET_TYPE_LABELS[m.marketType] ?? m.marketType}
                      </div>
                    </TableCell>
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
                      <div className="flex items-center justify-end gap-1">
                        <Badge variant={RECOMMENDATION_VARIANT[m.recommendation]}>
                          {RECOMMENDATION_LABELS[m.recommendation]}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Adicionar ao bilhete"
                          onClick={() => handleAddToTicket(m)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <TicketDraftBanner />

            {showExplanation && (
              <AiExplanationPanel
                explanation={explanation}
                isLoading={loadingExplanation}
                isError={explanationError}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
