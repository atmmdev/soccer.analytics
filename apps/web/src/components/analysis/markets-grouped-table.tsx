'use client';

import { Fragment, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  MARKET_TYPE_LABELS,
  RECOMMENDATION_LABELS,
  RECOMMENDATION_VARIANT,
  type MarketAnalysis,
} from '@/types/analysis';
import { formatSelectionLabel } from '@/lib/market-labels';

function formatPct(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export const MARKET_GROUP_ORDER = [
  'PLAYER_ASSIST_OR_GOAL',
  'PLAYER',
  'PLAYER_CARDS',
  'PLAYER_SHOTS_ON_TARGET',
  'PLAYER_SHOTS',
  'ANY_PLAYER_SCORE',
  'ANY_PLAYER_CARD',
  'MATCH_RESULT',
  'BTTS',
  'DOUBLE_CHANCE',
  'OVER_UNDER',
  'GOAL_BANDS',
  'CORNERS',
  'CARDS',
  'BOTH_TEAMS_CARDS',
  'TEAM_MOST',
  'PLAYER_FOULS',
  'PLAYER_TACKLES',
  'GOALKEEPER_SAVES',
  'SHOTS_ON_TARGET',
  'SHOTS',
  'HT_FT',
  'EXACT_SCORE',
  'HIGHEST_SCORING_HALF',
  'TEAM_SPECIAL',
  'TEAM_TO_SCORE',
  'RED_CARD',
  'WINNING_MARGIN',
  'HANDICAP',
] as const;

export function groupMarketsByType(markets: MarketAnalysis[]) {
  const groups = new Map<string, MarketAnalysis[]>();

  for (const market of markets) {
    const key = market.marketType || 'OTHER';
    const list = groups.get(key) ?? [];
    list.push(market);
    groups.set(key, list);
  }

  const orderedKeys = [
    ...MARKET_GROUP_ORDER.filter((type) => groups.has(type)),
    ...[...groups.keys()].filter(
      (type) =>
        !MARKET_GROUP_ORDER.includes(
          type as (typeof MARKET_GROUP_ORDER)[number],
        ),
    ),
  ];

  return orderedKeys.map((type) => ({
    type,
    label: MARKET_TYPE_LABELS[type] ?? type,
    markets: groups.get(type) ?? [],
  }));
}

interface MarketsGroupedTableProps {
  markets: MarketAnalysis[];
  onAddToTicket?: (market: MarketAnalysis) => void;
  /** Se false, oculta a coluna Bilhete / botão + */
  showTicketActions?: boolean;
}

export function MarketsGroupedTable({
  markets,
  onAddToTicket,
  showTicketActions = true,
}: MarketsGroupedTableProps) {
  const groups = useMemo(() => groupMarketsByType(markets), [markets]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const colSpan = showTicketActions ? 7 : 6;

  const toggleGroup = (type: string) => {
    setCollapsed((prev) => {
      const currentlyClosed = prev[type] ?? true;
      return { ...prev, [type]: !currentlyClosed };
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Seleção</TableHead>
          <TableHead className="text-right">Prob.</TableHead>
          <TableHead className="text-right">Odd justa</TableHead>
          <TableHead className="text-right">Odd casa</TableHead>
          <TableHead className="text-right">EV</TableHead>
          <TableHead className="text-right">Conf.</TableHead>
          {showTicketActions && (
            <TableHead className="text-right">Bilhete</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {groups.map((group) => {
          const isCollapsed = collapsed[group.type] ?? true;
          const bestEv = group.markets.reduce(
            (max, m) => Math.max(max, m.ev),
            Number.NEGATIVE_INFINITY,
          );

          return (
            <Fragment key={`group-${group.type}`}>
              <TableRow className="hover:bg-transparent border-b-0">
                <TableCell colSpan={colSpan} className="bg-secondary/30 p-0">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.type)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                    )}
                    <span>{group.label}</span>
                    <span className="font-mono font-normal normal-case text-[10px] text-muted-foreground/80">
                      {group.markets.length}{' '}
                      {group.markets.length === 1 ? 'linha' : 'linhas'}
                    </span>
                    {Number.isFinite(bestEv) && (
                      <Badge
                        variant={bestEv > 0 ? 'success' : 'secondary'}
                        className="ml-auto font-mono text-[10px] normal-case"
                      >
                        melhor EV {bestEv >= 0 ? '+' : ''}
                        {formatPct(bestEv)}
                      </Badge>
                    )}
                  </button>
                </TableCell>
              </TableRow>
              {!isCollapsed &&
                group.markets.map((m) => (
                  <TableRow key={`${m.marketType}-${m.selection}`}>
                    <TableCell>
                      <div className="font-medium">
                        {formatSelectionLabel(m.marketType, m.selection)}
                      </div>
                      {(m.marketType === 'PLAYER' ||
                        m.marketType?.startsWith('PLAYER_')) && (
                        <div className="text-[10px] text-muted-foreground">
                          {m.playerModel
                            ? 'modelo Poisson (gols/90)'
                            : 'sem histórico do jogador'}
                        </div>
                      )}
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
                    {showTicketActions && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Badge
                            variant={RECOMMENDATION_VARIANT[m.recommendation]}
                          >
                            {RECOMMENDATION_LABELS[m.recommendation]}
                          </Badge>
                          {onAddToTicket && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="Adicionar ao bilhete"
                              onClick={() => onAddToTicket(m)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
            </Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}
