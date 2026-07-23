"use client";

import Link from "next/link";
import { ArrowLeft, Loader2, MapPin, Trophy, BarChart3 } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { useMatch } from "@/hooks/use-matches";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AnalysisPanel } from "@/components/analysis/analysis-panel";
import { MatchH2HPanel } from "@/components/matches/match-h2h-panel";
import { MatchTicketSuggestions } from "@/components/tickets/match-ticket-suggestions";
import { TeamLogo } from "@/components/teams/team-logo";
import { STATUS_LABELS, STATUS_VARIANT } from "@/types/match";
import { use } from "react";

export default function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: match, isLoading, isError } = useMatch(id);

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !match) {
    return (
      <div className="p-6">
        <Button variant="ghost" asChild>
          <Link href="/matches">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <p className="mt-8 text-center text-muted-foreground">
          Jogo não encontrado.
        </p>
      </div>
    );
  }

  const matchDate = new Date(match.matchDate);
  const isFinished = match.status === "FINISHED";
  const isLive = match.status === "LIVE";
  const matchLabel = `${match.homeTeam.name} vs ${match.awayTeam.name}`;

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader title="Detalhes do Jogo" />

      <div className="flex-1 space-y-6 p-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/matches">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar aos jogos
          </Link>
        </Button>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
          {/* 20% — resumo do jogo */}
          <Card className="w-full border-border/60 bg-card/80 lg:w-[40%] lg:shrink-0">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Trophy className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {match.competition.name}
                      {match.round ? ` · ${match.round}` : ""}
                    </span>
                  </div>
                  <CardTitle className="text-base leading-snug">
                    {match.homeTeam.name}
                    <span className="mx-1 text-muted-foreground">vs</span>
                    {match.awayTeam.name}
                  </CardTitle>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {matchDate.toLocaleDateString("pt-BR", {
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                    })}{" "}
                    ·{" "}
                    {matchDate.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <Badge
                  variant={STATUS_VARIANT[match.status]}
                  className="shrink-0 text-[10px]"
                >
                  {STATUS_LABELS[match.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 py-2">
                <div className="flex w-full flex-col items-center gap-1.5 text-center">
                  <TeamLogo
                    src={match.homeTeam.logoUrl}
                    name={match.homeTeam.name}
                    size={48}
                    rounded="md"
                  />
                  <p className="text-sm font-semibold leading-tight">
                    {match.homeTeam.name}
                  </p>
                </div>

                {isFinished || isLive ? (
                  <p className="font-mono text-2xl font-bold">
                    {match.homeScore} - {match.awayScore}
                  </p>
                ) : (
                  <p className="text-lg font-bold text-muted-foreground">vs</p>
                )}

                <div className="flex w-full flex-col items-center gap-1.5 text-center">
                  <TeamLogo
                    src={match.awayTeam.logoUrl}
                    name={match.awayTeam.name}
                    size={48}
                    rounded="md"
                  />
                  <p className="text-sm font-semibold leading-tight">
                    {match.awayTeam.name}
                  </p>
                </div>
              </div>

              {match.venue && (
                <>
                  <Separator />
                  <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span className="leading-snug">{match.venue}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* 40% — H2H */}
          <MatchH2HPanel
            matchId={id}
            homeTeamName={match.homeTeam.name}
            awayTeamName={match.awayTeam.name}
            period={20}
            className="w-full lg:w-[30%] lg:min-w-0"
          />

          {/* 40% — criação do bilhete */}
          <MatchTicketSuggestions
            matchId={id}
            matchLabel={matchLabel}
            homeTeam={match.homeTeam.name}
            awayTeam={match.awayTeam.name}
            competition={match.competition.name}
            className="w-full lg:w-[30%] lg:min-w-0"
          />
        </div>

        <AnalysisPanel
          matchId={id}
          matchLabel={matchLabel}
          canAnalyze={match.status === "SCHEDULED" || match.status === "LIVE"}
        />

        <Card className="border-border/60 bg-card/50">
          <CardHeader>
            <CardTitle className="text-base">Match Analyzer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Compare estatísticas, forma recente e H2H no Match Analyzer.
            </p>
            <Button className="mt-4" asChild>
              <Link href={`/analyzer?matchId=${id}`}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Analisar partida
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
