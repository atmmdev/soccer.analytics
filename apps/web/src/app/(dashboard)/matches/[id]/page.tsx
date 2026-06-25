'use client';

import Link from 'next/link';
import { ArrowLeft, Loader2, MapPin, Trophy, BarChart3 } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { useMatch } from '@/hooks/use-matches';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AnalysisPanel } from '@/components/analysis/analysis-panel';
import { STATUS_LABELS, STATUS_VARIANT } from '@/types/match';
import { use } from 'react';

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
        <p className="mt-8 text-center text-muted-foreground">Jogo não encontrado.</p>
      </div>
    );
  }

  const matchDate = new Date(match.matchDate);
  const isFinished = match.status === 'FINISHED';
  const isLive = match.status === 'LIVE';

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

        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Trophy className="h-4 w-4" />
                  {match.competition.name}
                  {match.round && ` · ${match.round}`}
                </div>
                <CardTitle className="text-2xl">
                  {match.homeTeam.name} vs {match.awayTeam.name}
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {matchDate.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}{' '}
                  ·{' '}
                  {matchDate.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <Badge variant={STATUS_VARIANT[match.status]} className="text-sm">
                {STATUS_LABELS[match.status]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-8 py-8">
              <div className="text-center">
                <p className="text-lg font-semibold">{match.homeTeam.name}</p>
                <p className="text-xs text-muted-foreground">{match.homeTeam.country}</p>
              </div>
              <div className="text-center">
                {isFinished || isLive ? (
                  <p className="font-mono text-5xl font-bold">
                    {match.homeScore} - {match.awayScore}
                  </p>
                ) : (
                  <p className="text-3xl font-bold text-muted-foreground">vs</p>
                )}
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">{match.awayTeam.name}</p>
                <p className="text-xs text-muted-foreground">{match.awayTeam.country}</p>
              </div>
            </div>

            {match.venue && (
              <>
                <Separator className="my-4" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {match.venue}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <AnalysisPanel matchId={id} />

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
