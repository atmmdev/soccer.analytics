'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { AppHeader } from '@/components/layout/app-header';
import { MarketsGroupedTable } from '@/components/analysis/markets-grouped-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamLogo } from '@/components/teams/team-logo';
import { useAnalyzedMarkets, useLatestAnalysis } from '@/hooks/use-analysis';
import { formatSelectionLabel } from '@/lib/market-labels';
import { useTicketDraftStore } from '@/stores/ticket-draft.store';
import type { EvPlusMarket, MarketAnalysis } from '@/types/analysis';
import type { MarketType } from '@/types/ticket';

interface MatchScanGroup {
  matchId: string;
  matchLabel: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  homeLogoUrl: string | null;
  awayLogoUrl: string | null;
  bestEv: number;
  evPlusCount: number;
}

function buildMatchGroups(markets: EvPlusMarket[]): MatchScanGroup[] {
  const byMatch = new Map<string, MatchScanGroup & { _evs: number[] }>();

  for (const m of markets) {
    const existing = byMatch.get(m.matchId);
    if (existing) {
      existing._evs.push(m.ev);
      if (m.ev > 0) existing.evPlusCount += 1;
      continue;
    }
    const [homeFromLabel, awayFromLabel] = m.matchLabel.split(/\s+vs\s+/i);
    byMatch.set(m.matchId, {
      matchId: m.matchId,
      matchLabel: m.matchLabel,
      competition: m.competition,
      homeTeam: m.homeTeam ?? homeFromLabel ?? 'Casa',
      awayTeam: m.awayTeam ?? awayFromLabel ?? 'Fora',
      homeLogoUrl: m.homeLogoUrl ?? null,
      awayLogoUrl: m.awayLogoUrl ?? null,
      bestEv: m.ev,
      evPlusCount: m.ev > 0 ? 1 : 0,
      _evs: [m.ev],
    });
  }

  return [...byMatch.values()]
    .map(({ _evs, ...g }) => ({
      ...g,
      bestEv: Math.max(..._evs),
    }))
    .sort((a, b) => b.bestEv - a.bestEv);
}

function ScannerMatchCard({ group }: { group: MatchScanGroup }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const addSelection = useTicketDraftStore((s) => s.addSelection);
  const { data, isLoading, isError } = useLatestAnalysis(
    open ? group.matchId : '',
  );

  const handleAddToTicket = (market: MarketAnalysis) => {
    const added = addSelection({
      matchId: group.matchId,
      matchLabel: group.matchLabel,
      marketType: market.marketType as MarketType,
      selection: market.selection,
      odd: market.bookmakerOdd,
      probability: market.probability,
      ev: market.ev,
      confidence: market.confidence,
    });
    if (added) {
      toast.success(
        `${formatSelectionLabel(market.marketType, market.selection)} adicionado ao bilhete`,
        {
          action: {
            label: 'Ver bilhete',
            onClick: () => router.push('/tickets'),
          },
        },
      );
    } else {
      toast.info('Seleção já está no bilhete');
    }
  };

  return (
    <Card className="border-border/60 bg-card/80 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.02]"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{group.matchLabel}</p>
            <p className="truncate text-xs text-muted-foreground">
              {group.competition}
              {group.evPlusCount > 0
                ? ` · ${group.evPlusCount} mercado${group.evPlusCount === 1 ? '' : 's'} EV+`
                : ''}
            </p>
          </div>
        </div>

        <Badge
          variant={group.bestEv > 0 ? 'success' : 'secondary'}
          className="shrink-0 font-mono text-[10px]"
        >
          melhor EV {group.bestEv >= 0 ? '+' : ''}
          {(group.bestEv * 100).toFixed(1)}%
        </Badge>
      </button>

      {open && (
        <CardContent className="space-y-3 border-t border-border/40 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Seções de mercado para analisar — expanda cada grupo.
            </p>
            <Button variant="outline" size="sm" className="h-8" asChild>
              <Link href={`/matches/${group.matchId}`}>
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                Detalhe do jogo
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : isError || !data?.markets?.length ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Sem análise completa neste jogo. Abra o detalhe e execute a
              análise.
            </p>
          ) : (
            <MarketsGroupedTable
              markets={data.markets}
              onAddToTicket={handleAddToTicket}
            />
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default function ScannerPage() {
  const { data: markets, isLoading, isError } = useAnalyzedMarkets('all');

  const groups = useMemo(
    () => buildMatchGroups(markets ?? []),
    [markets],
  );

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader
        title="Scanner EV+"
        subtitle="Cada jogo com seções de mercado para analisar (Resultado, BTTS, Gols, Escanteios…)"
      />

      <div className="flex-1 space-y-4 p-6">
        <Card className="border-border/60 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base uppercase tracking-widest">
              <TrendingUp className="h-4 w-4 text-primary" />
              Jogos Analisados
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Expanda um jogo para ver os grupos de mercado (como no Analysis
              Engine). Clique em “+” para adicionar ao bilhete.
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : isError ? (
              <p className="py-8 text-center text-muted-foreground">
                Erro ao carregar scanner. Verifique se a API está rodando.
              </p>
            ) : !groups.length ? (
              <p className="py-8 text-center text-muted-foreground">
                Nenhum jogo analisado. Execute análises nos jogos do dia.
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  {groups.length} jogo{groups.length === 1 ? '' : 's'} ·
                  ordenados pelo melhor EV
                </p>
                {groups.map((group) => (
                  <ScannerMatchCard key={group.matchId} group={group} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
