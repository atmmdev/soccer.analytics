'use client';

import { useSearchParams } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { MatchCard } from '@/components/matches/match-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMatches, useCompetitions } from '@/hooks/use-matches';
import type { MatchStatus } from '@/types/match';
import { Loader2 } from 'lucide-react';

const statusTabs: { value: string; label: string; status?: MatchStatus }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'SCHEDULED', label: 'Agendados', status: 'SCHEDULED' },
  { value: 'LIVE', label: 'Ao Vivo', status: 'LIVE' },
  { value: 'FINISHED', label: 'Finalizados', status: 'FINISHED' },
];

function MatchList({ status, q }: { status?: MatchStatus; q?: string }) {
  const filters = {
    ...(status ? { status } : {}),
    ...(q ? { q } : {}),
    limit: 50,
  };

  const { data, isLoading, isError } = useMatches(filters);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-sm text-destructive">
          Não foi possível carregar os jogos. Verifique se a API e o banco estão rodando.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Os jogos são importados automaticamente via API-Football ao acessar o sistema.
        </p>
      </div>
    );
  }

  if (!data?.data.length) {
    return (
      <div className="rounded-lg border border-border/60 bg-card/50 p-8 text-center">
        <p className="text-muted-foreground">
          {q ? `Nenhum jogo encontrado para "${q}".` : 'Nenhum jogo encontrado.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="mb-4 text-xs text-muted-foreground">
        {data.meta.total} jogos{q ? ` · busca: "${q}"` : ''}
      </p>
      {data.data.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  );
}

export default function MatchesPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') ?? undefined;
  const { data: competitions } = useCompetitions();

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader
        title="Jogos"
        subtitle={
          q
            ? `Resultados para "${q}"`
            : 'Match Center — visualize e filtre partidas'
        }
      />

      <div className="flex-1 p-6">
        {competitions && competitions.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {competitions.map((c) => (
              <span
                key={c.id}
                className="rounded-full border border-border/60 bg-secondary/30 px-3 py-1 text-xs text-muted-foreground"
              >
                {c.name} ({c._count.matches})
              </span>
            ))}
          </div>
        )}

        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            {statusTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {statusTabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <MatchList status={tab.status} q={q} key={`${tab.value}-${q ?? ''}`} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
