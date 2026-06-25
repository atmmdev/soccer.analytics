import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Match } from '@/types/match';
import { STATUS_LABELS, STATUS_VARIANT } from '@/types/match';

interface MatchCardProps {
  match: Match;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

export function MatchCard({ match }: MatchCardProps) {
  const isLive = match.status === 'LIVE';
  const isFinished = match.status === 'FINISHED';

  return (
    <Link href={`/matches/${match.id}`}>
      <Card className="border-border/60 bg-card/80 transition-colors hover:border-primary/30 hover:bg-card my-3">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="w-14 shrink-0 text-center">
            <p className="text-xs text-muted-foreground">{formatDate(match.matchDate)}</p>
            <p className="font-mono text-sm font-semibold">{formatTime(match.matchDate)}</p>
          </div>

          <div className="min-w-0 flex-1">
            <p className="mb-1 text-xs text-muted-foreground">
              {match.competition.name}
              {match.round ? ` · ${match.round}` : ''}
            </p>
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-medium">{match.homeTeam.name}</span>
                <span className="font-mono text-lg font-bold">
                  {match.homeScore ?? '-'}
                </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-medium">{match.awayTeam.name}</span>
              {isFinished || isLive ? (
                <span className="font-mono text-lg font-bold">
                  {match.awayScore ?? 0}
                </span>
              ) : null}
            </div>
            {match.venue && (
              <p className="mt-1 text-xs text-muted-foreground">{match.venue}</p>
            )}
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            <Badge variant={STATUS_VARIANT[match.status]} className="text-xs">
              {isLive && <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
              {STATUS_LABELS[match.status]}
            </Badge>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
