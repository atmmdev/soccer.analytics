'use client';

import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMatchAnalysis } from '@/hooks/use-analyzer';
import { cn } from '@/lib/utils';

interface MatchH2HPanelProps {
  matchId: string;
  homeTeamName: string;
  awayTeamName: string;
  /** Quantidade de confrontos */
  period?: 5 | 10 | 15 | 20;
  className?: string;
}

export function MatchH2HPanel({
  matchId,
  homeTeamName,
  awayTeamName,
  period = 20,
  className,
}: MatchH2HPanelProps) {
  const { data, isLoading, isError } = useMatchAnalysis(matchId, period, 'h2h');

  if (isLoading) {
    return (
      <Card
        className={cn(
          'flex flex-col border-border/60 bg-card/80',
          className,
        )}
      >
        <CardContent className="flex flex-1 items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !data?.h2h) {
    return (
      <Card
        className={cn(
          'flex flex-col border-border/60 bg-card/80',
          className,
        )}
      >
        <CardHeader className="shrink-0">
          <CardTitle>Head to Head</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="text-sm text-muted-foreground">
            Sem confrontos diretos disponíveis para {homeTeamName} ×{' '}
            {awayTeamName}.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { h2h } = data;
  const meetings = h2h.meetings?.length
    ? h2h.meetings
    : h2h.lastMeetings.map((score) => ({
        date: '',
        score,
        scoreAsPlayed: score,
        homeName: homeTeamName,
        awayName: awayTeamName,
        competition: null as string | null,
      }));

  return (
    <Card
      className={cn('flex flex-col border-border/60 bg-card/80', className)}
    >
      <CardHeader className="shrink-0 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Head to Head</CardTitle>
          <Badge variant="outline" className="text-xs">
            Últimos {h2h.totalGames} confrontos (até {period})
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Placares no ponto de vista de {homeTeamName} (mandante deste jogo).
        </p>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex shrink-0 justify-center gap-6 text-center sm:gap-8">
          <div>
            <p className="text-2xl font-bold text-emerald-400">{h2h.homeWins}</p>
            <p className="text-xs text-muted-foreground">{homeTeamName}</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{h2h.draws}</p>
            <p className="text-xs text-muted-foreground">Empates</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-sky-400">{h2h.awayWins}</p>
            <p className="text-xs text-muted-foreground">{awayTeamName}</p>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <p className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Placares
          </p>
          <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
            {meetings.map((m, idx) => {
              const dateLabel = m.date
                ? new Date(m.date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })
                : '—';
              return (
                <div
                  key={`${m.date}-${m.scoreAsPlayed}-${idx}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/40 bg-secondary/15 px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {m.homeName} {m.scoreAsPlayed} {m.awayName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {dateLabel}
                      {m.competition ? ` · ${m.competition}` : ''}
                      {m.score !== m.scoreAsPlayed
                        ? ` · vista atual ${m.score}`
                        : ''}
                    </p>
                  </div>
                  <span className="font-mono text-sm font-semibold">
                    {m.score}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
