"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Play,
  Plus,
  Ticket,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/layout/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnalyzedMarkets } from "@/hooks/use-analysis";
import { useMatch } from "@/hooks/use-matches";
import { formatMarketLabel, getMarketCategoryLabel } from "@/lib/market-labels";
import {
  buildSuggestedTickets,
  stakeExampleReturn,
  type SuggestedTicket,
  type TicketProfileId,
} from "@/lib/ticket-suggestions";
import { useTicketDraftStore } from "@/stores/ticket-draft.store";
import type { EvPlusMarket } from "@/types/analysis";
import {
  MARKET_TYPE_LABELS,
  RECOMMENDATION_LABELS,
  RECOMMENDATION_VARIANT,
} from "@/types/analysis";
import type { MarketType } from "@/types/ticket";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TeamLogo } from "@/components/teams/team-logo";

type MarketFilter = "all" | "ev-plus" | "bet";

const ALL_COMPETITIONS = "__all__";
const PAGE_SIZE_OPTIONS = [15, 30, 50, 100] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

interface MatchGroup {
  matchId: string;
  matchLabel: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  homeLogoUrl: string | null;
  awayLogoUrl: string | null;
  markets: EvPlusMarket[];
}

function Stat({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="space-y-1 text-center sm:text-left">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p
        className={`font-mono text-sm font-medium ${muted ? "text-muted-foreground" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function groupMarketsByCategory(markets: EvPlusMarket[]) {
  const groups = new Map<string, EvPlusMarket[]>();
  for (const m of markets) {
    const label = getMarketCategoryLabel(m.marketType, m.market);
    const list = groups.get(label) ?? [];
    list.push(m);
    groups.set(label, list);
  }
  return [...groups.entries()].sort((a, b) =>
    a[0].localeCompare(b[0], "pt-BR"),
  );
}

export default function MarketsPage() {
  const router = useRouter();
  const addSelection = useTicketDraftStore((s) => s.addSelection);

  const [filter, setFilter] = useState<MarketFilter>("all");
  const [competition, setCompetition] = useState(ALL_COMPETITIONS);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const [ticketProfile, setTicketProfile] =
    useState<TicketProfileId>("moderado");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(15);

  const { data: markets, isLoading, isError } = useAnalyzedMarkets(filter);
  const { data: matchDetail } = useMatch(selectedMatchId ?? "");

  const competitionOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of markets ?? []) {
      const name = m.competition?.trim();
      if (!name) continue;
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [markets]);

  useEffect(() => {
    if (
      competition !== ALL_COMPETITIONS &&
      !competitionOptions.some((c) => c.name === competition)
    ) {
      setCompetition(ALL_COMPETITIONS);
    }
  }, [competition, competitionOptions]);

  const filteredMarkets = useMemo(() => {
    if (competition === ALL_COMPETITIONS) return [];
    return (markets ?? []).filter((m) => m.competition === competition);
  }, [markets, competition]);

  const hasTableSelection =
    competition !== ALL_COMPETITIONS && !!selectedMatchId;

  const tableMarkets = useMemo(() => {
    if (!hasTableSelection || !selectedMatchId) return [];
    return (markets ?? []).filter(
      (m) =>
        m.matchId === selectedMatchId && m.competition === competition,
    );
  }, [markets, competition, selectedMatchId, hasTableSelection]);

  const tableTotal = tableMarkets.length;
  const totalPages = Math.max(1, Math.ceil(tableTotal / pageSize));

  useEffect(() => {
    setPage(1);
  }, [filter, pageSize, competition, selectedMatchId, markets]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pagedMarkets = useMemo(() => {
    const start = (page - 1) * pageSize;
    return tableMarkets.slice(start, start + pageSize);
  }, [tableMarkets, page, pageSize]);

  const matchGroups = useMemo(() => {
    const byMatch = new Map<string, MatchGroup>();

    for (const m of filteredMarkets) {
      const existing = byMatch.get(m.matchId);
      if (existing) {
        existing.markets.push(m);
        continue;
      }
      const [homeFromLabel, awayFromLabel] = m.matchLabel.split(/\s+vs\s+/i);
      byMatch.set(m.matchId, {
        matchId: m.matchId,
        matchLabel: m.matchLabel,
        competition: m.competition,
        homeTeam: m.homeTeam ?? homeFromLabel ?? "Casa",
        awayTeam: m.awayTeam ?? awayFromLabel ?? "Fora",
        homeLogoUrl: m.homeLogoUrl ?? null,
        awayLogoUrl: m.awayLogoUrl ?? null,
        markets: [m],
      });
    }

    return [...byMatch.values()]
      .map((group) => ({
        ...group,
        markets: [...group.markets].sort((a, b) => b.ev - a.ev),
      }))
      .sort((a, b) => a.matchLabel.localeCompare(b.matchLabel, "pt-BR"));
  }, [filteredMarkets]);

  useEffect(() => {
    if (competition === ALL_COMPETITIONS || matchGroups.length === 0) {
      setSelectedMatchId(null);
      setSelectedMarket(null);
      return;
    }
    if (
      selectedMatchId &&
      !matchGroups.some((g) => g.matchId === selectedMatchId)
    ) {
      setSelectedMatchId(null);
      setSelectedMarket(null);
    }
  }, [competition, matchGroups, selectedMatchId]);

  const selectedGroup = useMemo(
    () => matchGroups.find((g) => g.matchId === selectedMatchId) ?? null,
    [matchGroups, selectedMatchId],
  );

  useEffect(() => {
    if (!selectedGroup) {
      setSelectedMarket(null);
      return;
    }
    if (
      !selectedMarket ||
      !selectedGroup.markets.some((m) => m.market === selectedMarket)
    ) {
      setSelectedMarket(selectedGroup.markets[0]?.market ?? null);
    }
  }, [selectedGroup, selectedMarket]);

  const selected =
    selectedGroup?.markets.find((m) => m.market === selectedMarket) ??
    selectedGroup?.markets[0] ??
    null;

  const marketGroups = useMemo(
    () => (selectedGroup ? groupMarketsByCategory(selectedGroup.markets) : []),
    [selectedGroup],
  );

  const suggestedTickets = useMemo(
    () => (selectedGroup ? buildSuggestedTickets(selectedGroup.markets) : []),
    [selectedGroup],
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

  const homeTeam = matchDetail?.homeTeam.name ?? selectedGroup?.homeTeam ?? "";
  const awayTeam = matchDetail?.awayTeam.name ?? selectedGroup?.awayTeam ?? "";
  const homeLogo =
    matchDetail?.homeTeam.logoUrl ?? selectedGroup?.homeLogoUrl ?? null;
  const awayLogo =
    matchDetail?.awayTeam.logoUrl ?? selectedGroup?.awayLogoUrl ?? null;
  const competitionName =
    matchDetail?.competition.name ?? selectedGroup?.competition ?? "";

  const emptyMessage =
    competition !== ALL_COMPETITIONS
      ? `Nenhuma análise para ${competition} com o filtro atual.`
      : "Nenhum mercado analisado ainda. Execute a análise em um jogo.";

  function handleAddMarket(market: EvPlusMarket) {
    if (!selectedGroup) return;
    const added = addSelection({
      matchId: selectedGroup.matchId,
      matchLabel: selectedGroup.matchLabel,
      marketType: (market.marketType ?? "MATCH_RESULT") as MarketType,
      selection: market.market,
      odd: market.bookmakerOdd,
      probability: market.probability,
      ev: market.ev,
      confidence: market.confidence,
    });
    if (added) {
      toast.success("Adicionado ao bilhete", {
        action: {
          label: "Ver bilhete",
          onClick: () => router.push("/tickets"),
        },
      });
    } else {
      toast.info("Já está no bilhete");
    }
  }

  function handleAddSuggestedTicket(ticket: SuggestedTicket) {
    if (!selectedGroup || !ticket.buildable) return;
    let added = 0;
    for (const leg of ticket.legs) {
      const ok = addSelection({
        matchId: selectedGroup.matchId,
        matchLabel: selectedGroup.matchLabel,
        marketType: (leg.marketType ?? "MATCH_RESULT") as MarketType,
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
            label: "Ver bilhete",
            onClick: () => router.push("/tickets"),
          },
        },
      );
    } else {
      toast.info("Pernas já estavam no bilhete");
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader
        title="Mercados"
        subtitle="Escolha o jogo e veja a análise de cada mercado"
      />

      <div className="flex-1 space-y-4 p-6">
        {/* <Card className="border-border/60 bg-card/80">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0 pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Análise por jogo
            </CardTitle>

            {matchGroups.length > 0 && selectedGroup && (
              <Select value={selectedGroup.matchId} onValueChange={setSelectedMatchId}>
                <SelectTrigger className="h-9 w-[200px] bg-secondary/30 text-xs sm:w-[240px]">
                  <SelectValue placeholder="Jogo" />
                </SelectTrigger>
                <SelectContent align="end">
                  {matchGroups.map((g) => (
                    <SelectItem key={g.matchId} value={g.matchId} className="text-xs">
                      {g.matchLabel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : isError ? (
              <div className="space-y-4 py-8 text-center">
                <p className="text-muted-foreground">
                  Não foi possível carregar os mercados.
                </p>
                <Button asChild variant="outline">
                  <Link href="/matches">Ir para Jogos</Link>
                </Button>
              </div>
            ) : !matchGroups.length || !selectedGroup || !selected ? (
              <div className="space-y-4 py-8 text-center">
                <p className="text-muted-foreground">{emptyMessage}</p>
                <Button asChild>
                  <Link href="/matches">
                    <Play className="mr-2 h-4 w-4" />
                    Abrir Jogos
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="mx-auto max-w-2xl space-y-6">
                <div className="flex flex-col items-center border-b border-border/40 pb-5 text-center">
                  <div className="flex items-center justify-center gap-4 sm:gap-6">
                    <div className="flex w-24 flex-col items-center gap-2 sm:w-28">
                      <TeamLogo src={homeLogo} name={homeTeam} size={56} />
                      <p className="text-sm font-semibold leading-tight">{homeTeam}</p>
                    </div>

                    <span className="text-sm font-medium text-muted-foreground">vs</span>

                    <div className="flex w-24 flex-col items-center gap-2 sm:w-28">
                      <TeamLogo src={awayLogo} name={awayTeam} size={56} />
                      <p className="text-sm font-semibold leading-tight">{awayTeam}</p>
                    </div>
                  </div>

                  {competitionName && (
                    <p className="mt-3 text-xs text-muted-foreground">{competitionName}</p>
                  )}
                  <Link
                    href={`/matches/${selectedGroup.matchId}`}
                    className="mt-1 text-xs text-primary hover:underline"
                  >
                    Ver página do jogo
                  </Link>
                </div>

                <div className="space-y-2">
                  <label htmlFor="market-select" className="block text-sm font-medium">
                    Mercado
                  </label>
                  <Select value={selected.market} onValueChange={setSelectedMarket}>
                    <SelectTrigger id="market-select" className="h-10 bg-secondary/20">
                      <SelectValue placeholder="Selecionar mercado" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      {marketGroups.map(([category, items]) => (
                        <SelectGroup key={category}>
                          <SelectLabel>{category}</SelectLabel>
                          {items.map((m) => (
                            <SelectItem key={`${m.matchId}-${m.market}`} value={m.market}>
                              {formatMarketLabel(m.marketType, m.market)}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-lg border border-border/50 bg-secondary/15 p-4">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">
                        {formatMarketLabel(selected.marketType, selected.market)}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Odd {selected.bookmakerOdd.toFixed(2)}
                      </p>
                    </div>
                    <Badge variant={RECOMMENDATION_VARIANT[selected.recommendation]}>
                      {RECOMMENDATION_LABELS[selected.recommendation]}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Stat label="Probabilidade" value={`${(selected.probability * 100).toFixed(1)}%`} />
                    <Stat label="Odd justa" value={selected.fairOdd.toFixed(2)} muted />
                    <Stat
                      label="EV"
                      value={`${selected.ev >= 0 ? '+' : ''}${(selected.ev * 100).toFixed(1)}%`}
                    />
                    <Stat label="Confiança" value={`${selected.confidence}%`} muted />
                  </div>

                  <Button
                    className="mt-4 w-full"
                    variant="outline"
                    onClick={() => handleAddMarket(selected)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar só este mercado
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card> */}
        <div className="flex gap-4">
          <Card className="min-w-0 flex-1 border-border/60 bg-card/80">
            <div className="flex flex-wrap justify-between gap-3 px-7 pt-5">
              <div>
                <Tabs
                  value={filter}
                  onValueChange={(v) => setFilter(v as MarketFilter)}
                >
                  <TabsList>
                    <TabsTrigger value="all">Todos</TabsTrigger>
                    <TabsTrigger value="ev-plus">EV+</TabsTrigger>
                    <TabsTrigger value="bet">Apostar</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex gap-3">
                <Select
                  value={competition}
                  onValueChange={(value) => {
                    setCompetition(value);
                    setSelectedMatchId(null);
                  }}
                  disabled={isLoading || !markets?.length}
                >
                  <SelectTrigger
                    id="competition-select"
                    className="h-10 bg-secondary/30"
                  >
                    <SelectValue placeholder="Selecione o Campeonato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_COMPETITIONS}>
                      Selecione o Campeonato
                    </SelectItem>
                    {competitionOptions.map((c) => (
                      <SelectItem key={c.name} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedMatchId ?? undefined}
                  onValueChange={setSelectedMatchId}
                  disabled={
                    isLoading ||
                    competition === ALL_COMPETITIONS ||
                    matchGroups.length === 0
                  }
                >
                  <SelectTrigger
                    id="match-select"
                    className="h-10 bg-secondary/30"
                  >
                    <SelectValue placeholder="Selecionar o jogo" />
                  </SelectTrigger>
                  <SelectContent>
                    {matchGroups.map((g) => (
                      <SelectItem key={g.matchId} value={g.matchId}>
                        {g.matchLabel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {selectedGroup && (
              <div className="flex flex-col items-center border-b border-border/40 px-7 pb-5 text-center">
                <div className="flex items-center justify-center gap-4 sm:gap-6">
                  <div className="flex w-24 flex-col items-center gap-2 sm:w-28">
                    <TeamLogo src={homeLogo} name={homeTeam} size={56} />
                    <p className="text-sm font-semibold leading-tight">
                      {homeTeam}
                    </p>
                  </div>

                  <span className="text-sm font-medium text-muted-foreground">
                    vs
                  </span>

                  <div className="flex w-24 flex-col items-center gap-2 sm:w-28">
                    <TeamLogo src={awayLogo} name={awayTeam} size={56} />
                    <p className="text-sm font-semibold leading-tight">
                      {awayTeam}
                    </p>
                  </div>
                </div>

                {competitionName && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    {competitionName}
                  </p>
                )}
                <Link
                  href={`/matches/${selectedGroup.matchId}`}
                  className="mt-1 text-xs text-primary hover:underline"
                >
                  Ver página do jogo
                </Link>
              </div>
            )}
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-primary" />
                Mercados Analisados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : isError ? (
                <div className="space-y-4 py-8 text-center">
                  <p className="text-muted-foreground">
                    Não foi possível carregar os mercados. Verifique se a API
                    está rodando (use{" "}
                    <code className="text-xs">pnpm start</code> na raiz do
                    projeto).
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/matches">Ir para Jogos</Link>
                  </Button>
                </div>
              ) : !markets?.length ? (
                <div className="space-y-4 py-8 text-center">
                  <p className="text-muted-foreground">
                    Nenhum mercado analisado ainda. Execute o Analysis Engine em
                    um jogo para gerar probabilidades e EV.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button asChild>
                      <Link href="/matches">
                        <Play className="mr-2 h-4 w-4" />
                        Abrir Jogos
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/analyzer">Ir para Estatísticas</Link>
                    </Button>
                  </div>
                </div>
              ) : !hasTableSelection ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">
                    Selecione o campeonato e o jogo para ver os mercados
                    analisados.
                  </p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Mercado</TableHead>
                        <TableHead className="text-right">Prob.</TableHead>
                        <TableHead className="text-right">Odd justa</TableHead>
                        <TableHead className="text-right">Odd casa</TableHead>
                        <TableHead className="text-right">EV</TableHead>
                        <TableHead className="text-right">Conf.</TableHead>
                        <TableHead className="text-right">Ação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagedMarkets.map((m) => (
                        <TableRow key={`${m.matchId}-${m.market}`}>
                          <TableCell>
                            <div className="font-medium">{m.market}</div>
                            <div className="text-xs text-muted-foreground">
                              {MARKET_TYPE_LABELS[m.marketType ?? ""] ??
                                m.marketType ??
                                "Mercado"}
                              {m.marketType === "PLAYER" &&
                                (m.playerModel
                                  ? " · modelo Poisson (gols/90)"
                                  : " · sem histórico do jogador")}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {(m.probability * 100).toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-right font-mono text-muted-foreground">
                            {m.fairOdd.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {m.bookmakerOdd.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant={m.ev > 0 ? "success" : "secondary"}
                              className="font-mono"
                            >
                              {m.ev >= 0 ? "+" : ""}
                              {(m.ev * 100).toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono text-muted-foreground">
                            {m.confidence}%
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant={RECOMMENDATION_VARIANT[m.recommendation]}
                            >
                              {RECOMMENDATION_LABELS[m.recommendation]}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-xs text-muted-foreground">
                        Página {page} de {totalPages} · {tableTotal} mercados
                      </p>
                      <Select
                        value={String(pageSize)}
                        onValueChange={(v) =>
                          setPageSize(Number(v) as PageSize)
                        }
                      >
                        <SelectTrigger className="h-8 w-[60px] bg-secondary/30 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAGE_SIZE_OPTIONS.map((size) => (
                            <SelectItem
                              key={size}
                              value={String(size)}
                              className="text-xs"
                            >
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                        <span className="text-xs text-muted-foreground">
                          Itens por página
                        </span>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          <div className="w-1/3 shrink-0 rounded-lg border border-primary/25 bg-primary/5 p-4">
            <div className="mb-3 flex items-start gap-2">
              <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold">Bilhetes sugeridos</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {hasTableSelection && homeTeam && awayTeam ? (
                    <>
                      Exemplos montados com os mercados analisados de {homeTeam}{" "}
                      vs {awayTeam}, seguindo os perfis de{" "}
                      <code className="text-[10px]">
                        docs/betting/examples/
                      </code>
                      .
                    </>
                  ) : (
                    <>
                      Selecione o campeonato e o jogo para montar bilhetes
                      sugeridos com base nos mercados analisados.
                    </>
                  )}
                </p>
              </div>
            </div>
            {!activeTicket ? (
              <div className="rounded-md border border-border/40 bg-background/50 px-3 py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhum bilhete sugerido no momento.
                </p>
              </div>
            ) : (
              <>
                <Tabs
                  value={ticketProfile}
                  onValueChange={(v) => setTicketProfile(v as TicketProfileId)}
                >
                  <TabsList className="mb-3 h-auto w-full flex-wrap justify-start gap-1">
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
                <div className="mb-3 rounded-md border border-border/40 bg-background/50 p-3">
                  <p className="text-sm font-medium">
                    {activeTicket.profile.name}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {activeTicket.profile.objective}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Odd alvo: {activeTicket.profile.oddTarget} · Stake:{" "}
                    {activeTicket.profile.stakeHint}
                  </p>
                </div>
                {!activeTicket.buildable ? (
                  <p className="text-sm text-muted-foreground">
                    {activeTicket.unavailableReason}
                  </p>
                ) : (
                  <>
                    <ol className="mb-4 space-y-3">
                      {activeTicket.legs.map((leg, index) => (
                        <li
                          key={`${leg.matchId}-${leg.market}`}
                          className="rounded-md border border-border/40 bg-background/40 p-3"
                        >
                          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-medium">
                              <span className="mr-1.5 text-muted-foreground">
                                {index + 1}.
                              </span>
                              {formatMarketLabel(leg.marketType, leg.market)}
                            </p>
                            <Badge
                              variant={
                                RECOMMENDATION_VARIANT[leg.recommendation]
                              }
                            >
                              {RECOMMENDATION_LABELS[leg.recommendation]}
                            </Badge>
                          </div>
                          <p className="mb-2 text-xs leading-relaxed text-muted-foreground">
                            {leg.why}
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono text-muted-foreground">
                            <span>Odd {leg.bookmakerOdd.toFixed(2)}</span>
                            <span>
                              Prob. {(leg.probability * 100).toFixed(1)}%
                            </span>
                            <span>
                              EV {leg.ev >= 0 ? "+" : ""}
                              {(leg.ev * 100).toFixed(1)}%
                            </span>
                            <span>Conf. {leg.confidence}%</span>
                          </div>
                        </li>
                      ))}
                    </ol>

                    <div className="mb-3 grid grid-cols-2 gap-3 rounded-md bg-secondary/30 p-3 text-sm sm:grid-cols-4">
                      <div>
                        <p className="text-[11px] text-muted-foreground">
                          Pernas
                        </p>
                        <p className="font-medium">
                          {activeTicket.legs.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">
                          Odd combinada
                        </p>
                        <p className="font-mono font-medium">
                          {activeTicket.combinedOdd.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">
                          EV médio
                        </p>
                        <p className="font-mono font-medium">
                          {activeTicket.avgEv >= 0 ? "+" : ""}
                          {(activeTicket.avgEv * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">
                          Retorno em R$ 20
                        </p>
                        <p className="font-mono font-medium">
                          R${" "}
                          {stakeExampleReturn(activeTicket.combinedOdd).toFixed(
                            2,
                          )}
                        </p>
                      </div>
                    </div>

                    <p className="mb-3 text-[11px] leading-relaxed text-muted-foreground">
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
          </div>
        </div>
      </div>
    </div>
  );
}
