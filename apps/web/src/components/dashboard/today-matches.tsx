'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TodayMatch } from '@/types/dashboard';

const tabs = ['Todos', 'Ao Vivo', 'Hoje', 'Amanhã'] as const;
type Tab = (typeof tabs)[number];
const ALL_COMPETITIONS_VALUE = '__all_competitions__';

interface TodayMatchesProps {
  matches: TodayMatch[];
}

interface CompetitionOption {
  name: string;
  count: number;
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

function filterByCompetition(matches: TodayMatch[], competition: string): TodayMatch[] {
  if (competition === ALL_COMPETITIONS_VALUE) return matches;
  return matches.filter((m) => m.competition === competition);
}

function buildCompetitionOptions(matches: TodayMatch[]): CompetitionOption[] {
  const counts = new Map<string, number>();

  for (const match of matches) {
    counts.set(match.competition, (counts.get(match.competition) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

const emptyLabels: Record<Tab, string> = {
  Todos: 'Aguardando sincronização ou nenhum jogo importado para hoje/amanhã.',
  'Ao Vivo': 'Nenhum jogo ao vivo no momento.',
  Hoje: 'Nenhum jogo importado para hoje — aguarde a sincronização automática.',
  Amanhã: 'Nenhum jogo importado para amanhã.',
};

export function TodayMatches({ matches }: TodayMatchesProps) {
  const [selectedCompetition, setSelectedCompetition] = useState(ALL_COMPETITIONS_VALUE);

  const competitionOptions = useMemo(
    () => buildCompetitionOptions(filterByTab(matches, 'Todos')),
    [matches],
  );

  useEffect(() => {
    if (
      selectedCompetition !== ALL_COMPETITIONS_VALUE &&
      !competitionOptions.some((option) => option.name === selectedCompetition)
    ) {
      setSelectedCompetition(ALL_COMPETITIONS_VALUE);
    }
  }, [competitionOptions, selectedCompetition]);

  function getEmptyLabel(tab: Tab): string {
    if (selectedCompetition === ALL_COMPETITIONS_VALUE) {
      return emptyLabels[tab];
    }

    return `Nenhum jogo de ${selectedCompetition} no filtro ${tab}.`;
  }

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">Jogos do Dia</CardTitle>
          <div className="w-[200px]">
            <Select value={selectedCompetition} onValueChange={setSelectedCompetition}>
              <SelectTrigger className="h-8 bg-secondary/20 text-xs">
                <SelectValue placeholder="Campeonato" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value={ALL_COMPETITIONS_VALUE}>Todos campeonatos</SelectItem>
                {competitionOptions.map((competition) => (
                  <SelectItem key={competition.name} value={competition.name}>
                    {competition.name} ({competition.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
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
                matches={filterByCompetition(filterByTab(matches, tab), selectedCompetition)}
                emptyLabel={getEmptyLabel(tab)}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
