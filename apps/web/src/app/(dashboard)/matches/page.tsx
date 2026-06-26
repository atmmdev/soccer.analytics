'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { MatchCard } from '@/components/matches/match-card';
import { CompetitionFilter } from '@/components/matches/competition-filter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useInfiniteMatches, useCompetitions } from '@/hooks/use-matches';
import type { MatchStatus } from '@/types/match';
import { Loader2 } from 'lucide-react';
import { useMemo } from 'react';

const PAGE_SIZE = 30;

const statusTabs: { value: string; label: string; status?: MatchStatus }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'SCHEDULED', label: 'Agendados', status: 'SCHEDULED' },
  { value: 'LIVE', label: 'Ao Vivo', status: 'LIVE' },
  { value: 'FINISHED', label: 'Finalizados', status: 'FINISHED' },
];

function MatchList({
  status,
  q,
  competitionId,
}: {
  status?: MatchStatus;
  q?: string;
  competitionId?: string;
}) {
  const filters = {
    ...(status ? { status } : {}),
    ...(q ? { q } : {}),
    ...(competitionId ? { competitionId } : {}),
  };

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteMatches(filters, PAGE_SIZE);

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

  if (!data?.pages.length || !data.pages[0].data.length) {
    return (
      <div className="rounded-lg border border-border/60 bg-card/50 p-8 text-center">
        <p className="text-muted-foreground">
          {q
            ? `Nenhum jogo encontrado para "${q}".`
            : competitionId
              ? 'Nenhum jogo neste campeonato com os filtros atuais.'
              : 'Nenhum jogo encontrado.'}
        </p>
      </div>
    );
  }

  const total = data.pages[0].meta.total;
  const matches = data.pages.flatMap((p) => p.data);
  const showing = matches.length;

  return (
    <div className="space-y-3">
      <p className="mb-4 text-xs text-muted-foreground">
        Exibindo {showing} de {total} jogos
        {q ? ` · busca: "${q}"` : ''}
      </p>
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}

      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Carregar mais ({total - showing} restantes)
          </Button>
        </div>
      )}
    </div>
  );
}

export default function MatchesPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') ?? undefined;
  const [competitionId, setCompetitionId] = useState<string | null>(null);

  const { data: competitions, isLoading: loadingCompetitions } = useCompetitions();

  const competitionOptions = useMemo(
    () =>
      (competitions ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        country: c.country,
        matchCount: c._count.matches,
      })),
    [competitions],
  );

  const selectedCompetition = competitionOptions.find((c) => c.id === competitionId);

  const subtitle = q
    ? `Resultados para "${q}"`
    : selectedCompetition
      ? `${selectedCompetition.name} — ${selectedCompetition.matchCount} jogos`
      : 'Match Center — visualize e filtre partidas';

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader title="Jogos" subtitle={subtitle} />

      <div className="flex-1 p-6">
        <CompetitionFilter
          competitions={competitionOptions}
          value={competitionId}
          onChange={setCompetitionId}
          isLoading={loadingCompetitions}
        />

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
              <MatchList
                status={tab.status}
                q={q}
                competitionId={competitionId ?? undefined}
                key={`${tab.value}-${q ?? ''}-${competitionId ?? ''}`}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
