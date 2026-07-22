'use client';

import { useState } from 'react';
import { Loader2, Sparkles, Ticket } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLeagueTicketSuggestions } from '@/hooks/use-analysis';
import { useTicketDraftStore } from '@/stores/ticket-draft.store';
import type {
  LeagueSuggestedTicket,
  LeagueSuggestionLeg,
} from '@/types/league-suggestions';
import type { MarketType } from '@/types/ticket';

function isAnalysisTicket(id: string) {
  return id.startsWith('analise-');
}

function isPlacaresTicket(id: string) {
  return id.startsWith('placar-');
}

function formatOdd(n: number) {
  return n.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function legDisplay(leg: LeagueSuggestionLeg) {
  if (leg.selectionLabel) return leg.selectionLabel;
  return leg.selection;
}

export function LeagueSuggestions() {
  const [competitionKey, setCompetitionKey] = useState<string>('');
  const { data: catalog, isLoading: loadingCatalog } =
    useLeagueTicketSuggestions(10);
  const {
    data,
    isLoading: loadingTickets,
    isError,
    isFetching,
  } = useLeagueTicketSuggestions(10, competitionKey || undefined, {
    enabled: !!competitionKey,
  });

  const addSelection = useTicketDraftStore((s) => s.addSelection);
  const clear = useTicketDraftStore((s) => s.clear);

  const competitions = catalog?.competitions ?? [];
  const group = data?.competitions?.[0];
  const tickets = group?.tickets ?? [];
  const variationTickets = tickets.filter(
    (t) => !isAnalysisTicket(t.id) && !isPlacaresTicket(t.id),
  );
  const placaresTickets = tickets.filter((t) => isPlacaresTicket(t.id));
  const analysisTickets = tickets.filter((t) => isAnalysisTicket(t.id));

  function handleAddTicket(
    competition: string,
    ticket: LeagueSuggestedTicket,
    replace: boolean,
  ) {
    if (!ticket.buildable) return;
    if (replace) clear();
    let added = 0;
    for (const leg of ticket.legs) {
      const ok = addSelection({
        matchId: leg.matchId,
        matchLabel: leg.matchLabel,
        marketType: (leg.marketType ?? 'MATCH_RESULT') as MarketType,
        selection: leg.selection,
        odd: leg.bookmakerOdd,
        probability: leg.probability,
        ev: leg.ev,
        confidence: leg.confidence,
      });
      if (ok) added++;
    }
    if (added > 0) {
      toast.success(
        `${competition}: ${added} perna(s) · ${ticket.title}`,
      );
    } else {
      toast.info('Pernas já estavam no bilhete');
    }
  }

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" />
              Sugestões por campeonato
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              6 variações 1X2 + 4 placares (H2H) + 4 pós-análise (mercados).
              Selecione o campeonato.
            </p>
          </div>
          <Select
            value={competitionKey || undefined}
            onValueChange={setCompetitionKey}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Selecione o campeonato" />
            </SelectTrigger>
            <SelectContent>
              {competitions.map((c) => (
                <SelectItem
                  key={c.competitionId ?? c.competition}
                  value={c.competitionId ?? c.competition}
                >
                  {c.competition} ({c.matchCount})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loadingCatalog ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : !competitionKey ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Selecione um campeonato para carregar as sugestões de bilhete.
          </p>
        ) : loadingTickets || isFetching ? (
          <div className="flex flex-col items-center gap-2 py-10">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">
              Analisando confrontos (forma + H2H)…
            </p>
          </div>
        ) : isError ? (
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar as sugestões.
          </p>
        ) : !tickets.length ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma sugestão para este campeonato. Analise jogos futuros em
            Mercados / Sync.
          </p>
        ) : (
          <div className="rounded-lg border border-border/50 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{group?.competition}</p>
                <p className="text-xs text-muted-foreground">
                  {group?.matchCount ?? 0} jogo(s) · {variationTickets.length}{' '}
                  variações
                  {placaresTickets.length
                    ? ` + ${placaresTickets.length} placares`
                    : ''}
                  {analysisTickets.length
                    ? ` + ${analysisTickets.length} pós-análise`
                    : ''}
                </p>
              </div>
              <Badge variant="outline">{tickets.length} bilhetes</Badge>
            </div>

            {variationTickets.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Vitórias e empates · 6 variações
                </p>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {variationTickets.map((ticket) => (
                    <TicketCard
                      key={`${group?.competition}-${ticket.id}`}
                      competition={group?.competition ?? ''}
                      ticket={ticket}
                      onAdd={handleAddTicket}
                    />
                  ))}
                </div>
              </div>
            )}

            {placaresTickets.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Resultado Correto · placares por confronto (H2H)
                </p>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {placaresTickets.map((ticket) => (
                    <TicketCard
                      key={`${group?.competition}-${ticket.id}`}
                      competition={group?.competition ?? ''}
                      ticket={ticket}
                      onAdd={handleAddTicket}
                    />
                  ))}
                </div>
              </div>
            )}

            {analysisTickets.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Pós-análise · mercados (docs/betting/markets)
                </p>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {analysisTickets.map((ticket) => (
                    <TicketCard
                      key={`${group?.competition}-${ticket.id}`}
                      competition={group?.competition ?? ''}
                      ticket={ticket}
                      onAdd={handleAddTicket}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TicketCard({
  competition,
  ticket,
  onAdd,
}: {
  competition: string;
  ticket: LeagueSuggestedTicket;
  onAdd: (
    competition: string,
    ticket: LeagueSuggestedTicket,
    replace: boolean,
  ) => void;
}) {
  return (
    <div className="rounded-md border border-border/40 bg-secondary/10 p-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium">{ticket.title}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {ticket.objective}
          </p>
        </div>
        <Badge variant="warning">Odd: {formatOdd(ticket.combinedOdd)}</Badge>
      </div>
      <ol className="mb-3 space-y-2">
        {ticket.legs.map((leg) => (
          <li
            key={`${ticket.id}-${leg.matchId}-${leg.selection}`}
            className="rounded border border-border/30 bg-background/40 px-2 py-1.5 text-xs"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-medium">{leg.matchLabel}</span>
              <span className="shrink-0 font-mono text-muted-foreground">
                {formatOdd(leg.bookmakerOdd)}
              </span>
            </div>
            <div className="mt-0.5 text-muted-foreground">
              {leg.market} ·{' '}
              <span className="text-foreground">{legDisplay(leg)}</span>
              {leg.oddSource === 'model_fair' && (
                <span className="ml-1 text-[10px]">(odd justa modelo)</span>
              )}
            </div>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          className="h-8 text-xs"
          onClick={() => onAdd(competition, ticket, true)}
        >
          <Ticket className="mr-1.5 h-3.5 w-3.5" />
          Montar bilhete
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs"
          onClick={() => onAdd(competition, ticket, false)}
        >
          Acrescentar
        </Button>
      </div>
    </div>
  );
}
