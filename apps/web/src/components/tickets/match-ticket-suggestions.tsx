'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Ticket } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLatestAnalysis } from '@/hooks/use-analysis';
import { formatMarketLabel } from '@/lib/market-labels';
import {
  buildSuggestedTickets,
  stakeExampleReturn,
  type SuggestedTicket,
  type TicketProfileId,
} from '@/lib/ticket-suggestions';
import { useTicketDraftStore } from '@/stores/ticket-draft.store';
import type { EvPlusMarket, MarketAnalysis } from '@/types/analysis';
import {
  RECOMMENDATION_LABELS,
  RECOMMENDATION_VARIANT,
} from '@/types/analysis';
import type { MarketType } from '@/types/ticket';
import { cn } from '@/lib/utils';

interface MatchTicketSuggestionsProps {
  matchId: string;
  matchLabel: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  className?: string;
}

function toEvPlusMarkets(
  matchId: string,
  matchLabel: string,
  competition: string,
  homeTeam: string,
  awayTeam: string,
  markets: MarketAnalysis[],
  snapshotId: string,
): EvPlusMarket[] {
  return markets.map((m) => ({
    snapshotId,
    matchId,
    matchLabel,
    competition,
    homeTeam,
    awayTeam,
    market: m.selection,
    marketType: m.marketType,
    probability: m.probability,
    fairOdd: m.fairOdd,
    bookmakerOdd: m.bookmakerOdd,
    ev: m.ev,
    confidence: m.confidence,
    recommendation: m.recommendation,
    playerModel: m.playerModel,
  }));
}

export function MatchTicketSuggestions({
  matchId,
  matchLabel,
  homeTeam,
  awayTeam,
  competition,
  className,
}: MatchTicketSuggestionsProps) {
  const router = useRouter();
  const addSelection = useTicketDraftStore((s) => s.addSelection);
  const { data, isLoading, isError } = useLatestAnalysis(matchId);
  const [ticketProfile, setTicketProfile] =
    useState<TicketProfileId>('moderado');

  const evMarkets = useMemo(() => {
    if (!data?.markets?.length) return [];
    return toEvPlusMarkets(
      matchId,
      matchLabel,
      competition,
      homeTeam,
      awayTeam,
      data.markets,
      data.snapshotId,
    );
  }, [data, matchId, matchLabel, competition, homeTeam, awayTeam]);

  const suggestedTickets = useMemo(
    () => buildSuggestedTickets(evMarkets),
    [evMarkets],
  );

  useEffect(() => {
    const firstBuildable = suggestedTickets.find((t) => t.buildable);
    if (
      firstBuildable &&
      !suggestedTickets.find((t) => t.profile.id === ticketProfile)?.buildable
    ) {
      setTicketProfile(firstBuildable.profile.id);
    }
  }, [suggestedTickets, ticketProfile]);

  const activeTicket: SuggestedTicket | null =
    suggestedTickets.find((t) => t.profile.id === ticketProfile) ??
    suggestedTickets[0] ??
    null;

  function handleAddSuggestedTicket(ticket: SuggestedTicket) {
    if (!ticket.buildable) return;
    let added = 0;
    for (const leg of ticket.legs) {
      const ok = addSelection({
        matchId,
        matchLabel,
        marketType: (leg.marketType ?? 'MATCH_RESULT') as MarketType,
        selection: leg.market,
        odd: leg.bookmakerOdd,
        probability: leg.probability,
        ev: leg.ev,
        confidence: leg.confidence,
      });
      if (ok) added++;
    }
    if (added > 0) {
      toast.success(
        `Bilhete ${ticket.profile.name}: ${added} perna(s) adicionadas`,
        {
          action: {
            label: 'Ver bilhete',
            onClick: () => router.push('/tickets'),
          },
        },
      );
    } else {
      toast.info('Pernas já estavam no bilhete');
    }
  }

  return (
    <Card
      className={cn(
        'flex flex-col border-border/60 border-primary/25 bg-primary/5',
        className,
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start gap-2">
          <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="min-w-0">
            <CardTitle className="text-base">Criação do bilhete</CardTitle>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Sugestões com os mercados analisados de {homeTeam} vs {awayTeam}.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 space-y-3 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : isError || !data ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Execute a análise abaixo para gerar bilhetes sugeridos.
          </p>
        ) : !activeTicket ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhum bilhete sugerido no momento.
          </p>
        ) : (
          <>
            <Tabs
              value={ticketProfile}
              onValueChange={(v) => setTicketProfile(v as TicketProfileId)}
            >
              <TabsList className="mb-1 h-auto w-full flex-wrap justify-start gap-1">
                {suggestedTickets.map((t) => (
                  <TabsTrigger
                    key={t.profile.id}
                    value={t.profile.id}
                    className="text-xs"
                    disabled={!t.buildable}
                  >
                    {t.profile.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="rounded-md border border-border/40 bg-background/50 p-3">
              <p className="text-sm font-medium">{activeTicket.profile.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {activeTicket.profile.objective}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Odd alvo: {activeTicket.profile.oddTarget} · Stake:{' '}
                {activeTicket.profile.stakeHint}
              </p>
            </div>

            {!activeTicket.buildable ? (
              <p className="text-sm text-muted-foreground">
                {activeTicket.unavailableReason}
              </p>
            ) : (
              <>
                <ol className="space-y-2">
                  {activeTicket.legs.map((leg, index) => (
                    <li
                      key={`${leg.matchId}-${leg.market}`}
                      className="rounded-md border border-border/40 bg-background/40 p-2.5"
                    >
                      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium">
                          <span className="mr-1.5 text-muted-foreground">
                            {index + 1}.
                          </span>
                          {formatMarketLabel(leg.marketType, leg.market)}
                        </p>
                        <Badge
                          variant={RECOMMENDATION_VARIANT[leg.recommendation]}
                        >
                          {RECOMMENDATION_LABELS[leg.recommendation]}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-mono text-muted-foreground">
                        <span>Odd {leg.bookmakerOdd.toFixed(2)}</span>
                        <span>
                          Prob. {(leg.probability * 100).toFixed(1)}%
                        </span>
                        <span>
                          EV {leg.ev >= 0 ? '+' : ''}
                          {(leg.ev * 100).toFixed(1)}%
                        </span>
                        <span>Conf. {leg.confidence}%</span>
                      </div>
                    </li>
                  ))}
                </ol>

                <div className="grid grid-cols-4 gap-2 rounded-md bg-secondary/30 p-2.5 text-sm">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Pernas</p>
                    <p className="font-medium">{activeTicket.legs.length}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">
                      Odd combinada
                    </p>
                    <p className="font-mono font-medium">
                      {activeTicket.combinedOdd.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">EV médio</p>
                    <p className="font-mono font-medium">
                      {activeTicket.avgEv >= 0 ? '+' : ''}
                      {(activeTicket.avgEv * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">
                      Retorno R$ 20
                    </p>
                    <p className="font-mono font-medium">
                      R${' '}
                      {stakeExampleReturn(activeTicket.combinedOdd).toFixed(2)}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Correlação: {activeTicket.correlationNote}
                </p>

                <Button
                  className="w-full"
                  onClick={() => handleAddSuggestedTicket(activeTicket)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar bilhete {activeTicket.profile.name} (
                  {activeTicket.legs.length} pernas)
                </Button>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
