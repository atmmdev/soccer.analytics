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
  type AnalysisTeamInput,
  type AnalysisTeamInputs,
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
import { cn } from '@/lib/utils';

interface AnalysisPanelProps {
  matchId: string;
  matchLabel?: string;
  /** Só jogos agendados ou ao vivo */
  canAnalyze?: boolean;
}

function formatPct(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function formLabel(result: 'W' | 'D' | 'L') {
  return result === 'W' ? 'V' : result === 'D' ? 'E' : 'D';
}

function isFallbackAnalysis(
  data: LatestAnalysis | AnalysisResult,
): boolean {
  const source = data.statsSource;
  if (!source) return false;
  return source.home === 'fallback' || source.away === 'fallback';
}

function TeamInputsCard({
  team,
  side,
}: {
  team: AnalysisTeamInput;
  side: 'Casa' | 'Fora';
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {side}
          </p>
          <p className="text-sm font-medium">{team.name}</p>
        </div>
        <Badge variant={team.source === 'computed' ? 'success' : 'outline'}>
          {team.source === 'computed' ? 'Stats reais' : 'Fallback'}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <p className="text-muted-foreground">
          Amostra:{' '}
          <span className="font-mono text-foreground">
            {team.matchesPlayed}j ({team.side})
          </span>
        </p>
        <p className="text-muted-foreground">
          GF/GS:{' '}
          <span className="font-mono text-foreground">
            {team.avgGoalsFor.toFixed(2)}/{team.avgGoalsAgainst.toFixed(2)}
          </span>
        </p>
        <p className="text-muted-foreground">
          Esc/Cart:{' '}
          <span className="font-mono text-foreground">
            {team.avgCorners.toFixed(1)}/{team.avgCards.toFixed(1)}
          </span>
        </p>
        <p className="text-muted-foreground">
          BTTS/O2.5:{' '}
          <span className="font-mono text-foreground">
            {team.bttsPct}%/{team.over25Pct}%
          </span>
        </p>
      </div>
      <div className="flex gap-1">
        {team.form.map((r, i) => (
          <span
            key={`${side}-${i}`}
            className={cn(
              'flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold',
              r === 'W' && 'bg-emerald-500/20 text-emerald-400',
              r === 'D' && 'bg-amber-500/20 text-amber-400',
              r === 'L' && 'bg-red-500/20 text-red-400',
            )}
          >
            {formLabel(r)}
          </span>
        ))}
      </div>
    </div>
  );
}

function AnalysisSummary({
  data,
}: {
  data: LatestAnalysis | AnalysisResult;
}) {
  const predicted =
    'predictedScore' in data ? data.predictedScore : data.predictedResult;
  const teamInputs = data.teamInputs as AnalysisTeamInputs | null | undefined;
  const fallback = isFallbackAnalysis(data);

  return (
    <div className="space-y-4">
      {fallback && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-200">
          Esta análise usou médias genéricas (fallback) porque faltava histórico
          dos times. Clique em <strong>Executar Análise</strong> para recalcular
          com forma real da API-Football.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
          <p className="text-xs text-muted-foreground">Placar previsto</p>
          <p className="mt-1 font-mono text-2xl font-bold">{predicted}</p>
        </div>
        <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
          <p className="text-xs text-muted-foreground">Gols esperados (xG)</p>
          <p className="mt-1 font-mono text-lg font-semibold">
            {data.homeExpectedGoals?.toFixed(2)} — {data.awayExpectedGoals?.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
          <p className="text-xs text-muted-foreground">Confiança geral</p>
          <p className="mt-1 font-mono text-2xl font-bold text-primary">
            {data.overallConfidence}%
          </p>
          {data.period != null && (
            <p className="mt-1 text-[10px] text-muted-foreground">
              Janela: últimos {data.period} jogos
            </p>
          )}
        </div>
        {data.expectedCorners != null && (
          <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground">Escanteios esperados</p>
            <p className="mt-1 font-mono text-lg font-semibold">
              {data.expectedCorners.toFixed(1)}
            </p>
          </div>
        )}
        {data.expectedCards != null && (
          <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground">Cartões esperados</p>
            <p className="mt-1 font-mono text-lg font-semibold">
              {data.expectedCards.toFixed(1)}
            </p>
          </div>
        )}
      </div>

      {teamInputs && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Inputs da análise (médias usadas no Poisson)
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <TeamInputsCard team={teamInputs.home} side="Casa" />
            <TeamInputsCard team={teamInputs.away} side="Fora" />
          </div>
        </div>
      )}
    </div>
  );
}

export function AnalysisPanel({
  matchId,
  matchLabel,
  canAnalyze = true,
}: AnalysisPanelProps) {
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
  } = useMatchExplanation(matchId, showExplanation && canAnalyze);

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
    if (!canAnalyze) {
      toast.error('Análise só para jogos agendados ou ao vivo');
      return;
    }
    runAnalysis.mutate(10, {
      onSuccess: (data) => {
        const weak =
          data.statsSource?.home === 'fallback' ||
          data.statsSource?.away === 'fallback';
        toast.success(
          weak
            ? 'Análise salva — ainda com fallback em um dos times'
            : 'Análise concluída com stats reais',
        );
      },
      onError: (error) => {
        const message = isAxiosError(error)
          ? (error.response?.data as { message?: string })?.message ??
            error.message
          : 'Erro desconhecido';
        toast.error(`Falha ao executar análise: ${message}`);
      },
    });
  };

  const display = canAnalyze ? (runAnalysis.data ?? latest) : null;

  if (!canAnalyze) {
    return (
      <Card className="border-border/60 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-primary" />
            Analysis Engine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Análises de mercado só são feitas para jogos <strong>agendados</strong> ou{' '}
            <strong>ao vivo</strong>. Jogos encerrados não entram na fila de análise.
          </p>
        </CardContent>
      </Card>
    );
  }

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
            EV e recomendações com a forma real dos times.
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
                        {m.marketType === 'PLAYER' &&
                          (m.playerModel
                            ? ' · modelo Poisson (gols/90)'
                            : ' · sem histórico do jogador')}
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
