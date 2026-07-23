"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { MatchTable } from "@/components/matches/match-table";
import { CompetitionFilter } from "@/components/matches/competition-filter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ListPagination,
  DEFAULT_PAGE_SIZE,
  type PageSize,
} from "@/components/ui/list-pagination";
import { useMatches, useCompetitions, todayIsoDate } from "@/hooks/use-matches";
import type { MatchStatus } from "@/types/match";
import { Loader2 } from "lucide-react";

const statusTabs: { value: string; label: string; status?: MatchStatus }[] = [
  { value: "all", label: "Todos" },
  { value: "SCHEDULED", label: "Agendados", status: "SCHEDULED" },
  { value: "LIVE", label: "Ao Vivo", status: "LIVE" },
  { value: "FINISHED", label: "Finalizados", status: "FINISHED" },
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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(DEFAULT_PAGE_SIZE);
  const dateFrom = todayIsoDate();

  useEffect(() => {
    setPage(1);
  }, [status, q, competitionId, pageSize]);

  const { data, isLoading, isError } = useMatches({
    ...(status ? { status } : {}),
    ...(q ? { q } : {}),
    ...(competitionId ? { competitionId } : {}),
    dateFrom,
    page,
    limit: pageSize,
  });

  const matches = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = Math.max(1, data?.meta.totalPages ?? 1);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

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
          Não foi possível carregar os jogos. Verifique se a API e o banco estão
          rodando.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Os jogos são importados automaticamente via API-Football ao acessar o
          sistema.
        </p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="rounded-lg border border-border/60 bg-card/50 p-8 text-center">
        <p className="text-muted-foreground">
          {q
            ? `Nenhum jogo encontrado para "${q}".`
            : competitionId
              ? "Nenhum jogo neste campeonato com os filtros atuais."
              : "Nenhum jogo encontrado."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <MatchTable matches={matches} />

      <ListPagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        itemLabel="jogos"
      />
    </div>
  );
}

export default function MatchesPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? undefined;
  const [competitionId, setCompetitionId] = useState<string | null>(null);

  const { data: competitions, isLoading: loadingCompetitions } =
    useCompetitions();

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

  const selectedCompetition = competitionOptions.find(
    (c) => c.id === competitionId,
  );

  const subtitle = q
    ? `Resultados para "${q}"`
    : selectedCompetition
      ? `${selectedCompetition.name} — ${selectedCompetition.matchCount} jogos`
      : "Match Center — visualize e filtre partidas";

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader title="Jogos" subtitle={subtitle} />

      <div className="flex-1 p-6">
        <Tabs defaultValue="all">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <CompetitionFilter
              competitions={competitionOptions}
              value={competitionId}
              onChange={setCompetitionId}
              isLoading={loadingCompetitions}
            />
            <TabsList className="w-full shrink-0 sm:w-auto">
              {statusTabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {statusTabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <MatchList
                status={tab.status}
                q={q}
                competitionId={competitionId ?? undefined}
                key={`${tab.value}-${q ?? ""}-${competitionId ?? ""}`}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
