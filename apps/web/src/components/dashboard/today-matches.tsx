'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { TodayMatch } from '@/lib/mock/dashboard';

const tabs = ['Todos', 'Ao Vivo', 'Hoje', 'Amanhã'] as const;
type Tab = (typeof tabs)[number];

interface TodayMatchesProps {
  matches: TodayMatch[];
}

function filterByTab(matches: TodayMatch[], tab: Tab): TodayMatch[] {
  switch (tab) {
    case 'Ao Vivo':
      return matches.filter((m) => m.status === 'live');
    case 'Hoje':
      return matches.filter(
        (m) => m.day === 'today' && (m.status === 'scheduled' || m.status === 'live'),
      );
    case 'Amanhã':
      return matches.filter((m) => m.day === 'tomorrow' && m.status === 'scheduled');
    case 'Todos':
    default:
      return matches.filter(
        (m) =>
          m.status === 'live' ||
          (m.day === 'today' && m.status === 'scheduled') ||
          (m.day === 'tomorrow' && m.status === 'scheduled'),
      );
  }
}

function MatchList({ matches, emptyLabel }: { matches: TodayMatch[]; emptyLabel: string }) {
  if (matches.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">{emptyLabel}</p>
    );
  }

  return (
    <div className="space-y-2">
      {matches.map((match) => (
        <Link
          key={match.id}
          href={`/matches/${match.id}`}
          className="flex items-center gap-3 rounded-lg border border-border/40 bg-secondary/20 px-3 py-2.5 transition-colors hover:bg-secondary/40"
        >
          <span className="w-10 shrink-0 text-xs font-mono text-muted-foreground">
            {match.time}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="truncate text-sm font-medium">{match.homeTeam}</span>
              <span className="text-xs text-muted-foreground">vs</span>
              <span className="truncate text-sm font-medium">{match.awayTeam}</span>
            </div>
            <span className="truncate text-[10px] text-muted-foreground sm:ml-auto">
              {match.competition}
            </span>
          </div>
          {match.status === 'live' ? (
            <Badge variant="destructive" className="shrink-0 text-[10px]">
              LIVE
            </Badge>
          ) : (
            <Badge variant="success" className="shrink-0 font-mono">
              {match.score > 0 ? `${match.score}%` : '—'}
            </Badge>
          )}
        </Link>
      ))}
    </div>
  );
}

const emptyLabels: Record<Tab, string> = {
  Todos: 'Nenhum jogo agendado para hoje ou amanhã.',
  'Ao Vivo': 'Nenhum jogo ao vivo no momento.',
  Hoje: 'Nenhum jogo agendado para hoje.',
  Amanhã: 'Nenhum jogo agendado para amanhã.',
};

export function TodayMatches({ matches }: TodayMatchesProps) {
  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Jogos do Dia</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="Hoje">
          <TabsList className="mb-3 h-8 w-full justify-start">
            {tabs.map((tab) => (
              <TabsTrigger key={tab} value={tab} className="text-xs">
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-0">
              <MatchList
                matches={filterByTab(matches, tab)}
                emptyLabel={emptyLabels[tab]}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
