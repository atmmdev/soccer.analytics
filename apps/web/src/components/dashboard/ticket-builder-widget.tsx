'use client';

import { useMemo } from 'react';
import { isAxiosError } from 'axios';
import { Dices, Loader2, Ticket } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSuggestRandomTicket } from '@/hooks/use-analysis';
import { useSaveTicket, useTicketCalculation } from '@/hooks/use-tickets';
import { formatStudyTicketCode } from '@/lib/study-ticket-code';
import {
  getMarketCategoryLabel,
  translateSelectionText,
} from '@/lib/market-labels';
import { useTicketDraftStore } from '@/stores/ticket-draft.store';
import type { TicketBuilderData, TodayMatch } from '@/types/dashboard';
import type { DraftSelection, MarketType } from '@/types/ticket';

interface TicketBuilderWidgetProps {
  data: TicketBuilderData;
  /** Jogos do dia — usados para exibir o campeonato nas seleções */
  matches?: TodayMatch[];
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatPct(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return '0%';
  return `${Math.round(value * 100)}%`;
}

export function TicketBuilderWidget({
  data,
  matches = [],
}: TicketBuilderWidgetProps) {
  const { selections, stake, clear, setSelections, setStake } =
    useTicketDraftStore();
  const { data: calc, isLoading: calculating } = useTicketCalculation(
    selections,
    stake,
  );
  const suggestRandom = useSuggestRandomTicket();
  const saveTicket = useSaveTicket();

  const resolveCompetition = useMemo(() => {
    const byId = new Map<string, string>();
    const byLabel = new Map<string, string>();
    for (const m of matches) {
      if (!m.competition) continue;
      byId.set(m.id, m.competition);
      byLabel.set(`${m.homeTeam} vs ${m.awayTeam}`, m.competition);
    }
    return (s: {
      matchId?: string;
      matchLabel?: string;
      competition?: string | null;
    }) =>
      s.competition ||
      (s.matchId ? byId.get(s.matchId) : undefined) ||
      (s.matchLabel ? byLabel.get(s.matchLabel) : undefined) ||
      null;
  }, [matches]);

  const hasDraft = selections.length > 0;

  const displaySelections = hasDraft
    ? selections.map((s) => ({
        matchLabel: s.matchLabel,
        selection: s.selection,
        marketType: s.marketType,
        competition: resolveCompetition(s),
        odd: s.odd,
      }))
    : data.selections.map((s) => ({
        matchLabel: s.market,
        selection: '',
        marketType: undefined as string | undefined,
        competition: null as string | null,
        odd: s.odd,
      }));

  const combinedOdd = hasDraft ? (calc?.combinedOdd ?? 0) : data.combinedOdd;
  const probability = hasDraft
    ? calc?.combinedProbability != null
      ? Math.round(calc.combinedProbability * 100)
      : 0
    : data.probability;
  const ev = hasDraft
    ? calc?.overallEV != null
      ? Math.round(calc.overallEV * 1000) / 10
      : 0
    : data.ev;
  const suggestedStake = hasDraft
    ? (calc?.suggestedStake ?? stake)
    : data.suggestedStake;
  const potentialReturn = hasDraft
    ? (calc?.potentialReturn ?? 0)
    : data.potentialReturn;

  const handleGenerateRandom = () => {
    suggestRandom.mutate(
      { minProbability: 0.7, minLegs: 3, maxLegs: 4 },
      {
        onSuccess: (result) => {
          if (stake <= 0) setStake(20);

          const next: DraftSelection[] = result.selections.map((sel) => ({
            matchId: sel.matchId,
            matchLabel: sel.matchLabel,
            competition: resolveCompetition(sel),
            marketType: (sel.marketType as MarketType) || 'MATCH_RESULT',
            selection: sel.selection,
            odd: sel.odd,
            probability: sel.probability,
            ev: sel.ev,
            confidence: sel.confidence,
          }));

          setSelections(next);

          toast.success(
            `Bilhete gerado: ${next.length} jogos do dia (≥70% probabilidade)`,
          );
        },
        onError: (error) => {
          const message = isAxiosError(error)
            ? ((error.response?.data as { message?: string })?.message ??
              error.message)
            : 'Não foi possível gerar o bilhete';
          toast.error(Array.isArray(message) ? message.join(', ') : message);
        },
      },
    );
  };

  const handleSave = () => {
    if (!selections.length) {
      toast.error('Gere ou adicione seleções ao bilhete');
      return;
    }
    if (calc && !calc.valid) {
      toast.error('Corrija os conflitos de correlação antes de salvar');
      return;
    }

    const code = formatStudyTicketCode();

    saveTicket.mutate(
      { name: code, stake: calc?.suggestedStake ?? stake, selections },
      {
        onSuccess: () => {
          toast.success(`Bilhete salvo: ${code}`);
          clear();
        },
        onError: (error) => {
          const message = isAxiosError(error)
            ? ((error.response?.data as { message?: string })?.message ??
              error.message)
            : 'Erro ao salvar';
          toast.error(Array.isArray(message) ? message.join(', ') : message);
        },
      },
    );
  };

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Ticket className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">Bilhete Builder</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {displaySelections.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border/50 px-3 py-4 text-center text-xs text-muted-foreground">
              Gere um bilhete aleatório do dia ou monte um em Bilhetes
            </p>
          ) : (
            displaySelections.map((sel, idx) => {
              const marketLabel = sel.selection
                ? getMarketCategoryLabel(sel.marketType, sel.selection)
                : null;
              const choiceLabel = sel.selection
                ? translateSelectionText(sel.selection)
                : null;
              return (
                <div
                  key={`${sel.matchLabel}-${sel.selection}-${sel.odd}-${idx}`}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border/40 bg-secondary/20 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {sel.matchLabel}
                    </p>
                    {(sel.competition || marketLabel || choiceLabel) && (
                      <p className="truncate text-xs text-muted-foreground">
                        {sel.competition ? (
                          <span>{sel.competition}</span>
                        ) : null}
                        {sel.competition && marketLabel ? (
                          <span> · </span>
                        ) : null}
                        {marketLabel ? (
                          <span className="font-medium text-amber-400">
                            {marketLabel} <span> · </span>
                          </span>
                        ) : null}
                        {choiceLabel ? (
                          <span className="font-medium text-emerald-400">
                            {' '}
                            ({choiceLabel})
                          </span>
                        ) : null}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 font-mono text-sm font-semibold text-primary">
                    {sel.odd.toFixed(2)}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div className="grid grid-cols-5 gap-2 text-sm">
          <div className="min-w-0">
            <p className="text-[10px] leading-tight text-muted-foreground sm:text-xs">
              Odd total
            </p>
            <p className="truncate font-mono font-bold">
              {calculating && hasDraft ? '…' : combinedOdd.toFixed(2)}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] leading-tight text-muted-foreground sm:text-xs">
              Prob.
            </p>
            <p className="truncate font-mono font-bold">
              {hasDraft && calc?.combinedProbability != null
                ? formatPct(calc.combinedProbability)
                : `${probability}%`}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] leading-tight text-muted-foreground sm:text-xs">
              EV
            </p>
            <p className="truncate font-mono font-bold text-emerald-400">
              {ev >= 0 ? '+' : ''}
              {ev}%
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] leading-tight text-muted-foreground sm:text-xs">
              Stake
            </p>
            <p className="truncate font-mono font-bold">
              {formatCurrency(suggestedStake)}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] leading-tight text-muted-foreground">
              Retorno potencial
            </p>
            <p className="truncate font-mono font-bold text-primary">
              {formatCurrency(potentialReturn)}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            className="w-full uppercase tracking-widest hover:bg-primary/10 hover:text-primary"
            onClick={handleGenerateRandom}
            disabled={suggestRandom.isPending}
          >
            {suggestRandom.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Dices className="h-4 w-4" />
            )}
            Gerar bilhete aleatório
          </Button>
          <Button
            type="button"
            className="w-full"
            onClick={handleSave}
            disabled={saveTicket.isPending || !hasDraft}
          >
            {saveTicket.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Salvar Bilhete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
