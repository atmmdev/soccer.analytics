'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { TodayMatch } from '@/lib/mock/dashboard';

const tabs = ['Todos', 'Ao Vivo', 'Hoje', 'Amanhã'] as const;

interface TodayMatchesProps {
  matches: TodayMatch[];
}

function MatchList({ matches }: { matches: TodayMatch[] }) {
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
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="text-base">{match.homeFlag}</span>
            <span className="truncate text-sm font-medium">{match.homeTeam}</span>
            <span className="text-xs text-muted-foreground">vs</span>
            <span className="truncate text-sm font-medium">{match.awayTeam}</span>
            <span className="text-base">{match.awayFlag}</span>
          </div>
          <Badge variant="success" className="shrink-0 font-mono">
            {match.score > 0 ? `${match.score}%` : '—'}
          </Badge>
        </Link>
      ))}
    </div>
  );
}

export function TodayMatches({ matches }: TodayMatchesProps) {
  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Jogos do Dia</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="Todos">
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
                matches={
                  tab === 'Ao Vivo'
                    ? matches.filter((m) => m.status === 'live')
                    : matches
                }
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
