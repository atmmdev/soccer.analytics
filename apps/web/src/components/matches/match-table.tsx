'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Match } from '@/types/match';
import { STATUS_LABELS, STATUS_VARIANT } from '@/types/match';

interface MatchTableProps {
  matches: Match[];
}

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr);
  return {
    date: date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    }),
    time: date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

function formatScore(match: Match) {
  const showScore =
    match.status === 'LIVE' ||
    match.status === 'FINISHED' ||
    match.homeScore != null ||
    match.awayScore != null;

  if (!showScore) return '—';

  return `${match.homeScore ?? 0} – ${match.awayScore ?? 0}`;
}

export function MatchTable({ matches }: MatchTableProps) {
  const router = useRouter();

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-[100px]">Data</TableHead>
          <TableHead>Campeonato</TableHead>
          <TableHead className="hidden md:table-cell">Rodada</TableHead>
          <TableHead>Casa</TableHead>
          <TableHead className="w-[88px] text-center">Placar</TableHead>
          <TableHead>Fora</TableHead>
          <TableHead className="hidden lg:table-cell">Local</TableHead>
          <TableHead className="w-[120px]">Status</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {matches.map((match) => {
          const { date, time } = formatDateTime(match.matchDate);
          const isLive = match.status === 'LIVE';

          return (
            <TableRow
              key={match.id}
              role="link"
              tabIndex={0}
              className="cursor-pointer hover:bg-muted/40"
              onClick={() => router.push(`/matches/${match.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  router.push(`/matches/${match.id}`);
                }
              }}
            >
              <TableCell>
                <p className="font-mono text-sm font-medium">{date}</p>
                <p className="text-xs text-muted-foreground">{time}</p>
              </TableCell>
              <TableCell>
                <span className="line-clamp-2 font-medium">
                  {match.competition.name}
                </span>
                {match.competition.country ? (
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {match.competition.country}
                  </span>
                ) : null}
              </TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">
                {match.round ?? '—'}
              </TableCell>
              <TableCell className="font-medium">{match.homeTeam.name}</TableCell>
              <TableCell className="text-center font-mono text-base font-semibold tabular-nums">
                {formatScore(match)}
              </TableCell>
              <TableCell className="font-medium">{match.awayTeam.name}</TableCell>
              <TableCell className="hidden max-w-[180px] truncate text-muted-foreground lg:table-cell">
                {match.venue ?? '—'}
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[match.status]} className="text-xs">
                  {isLive && (
                    <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                  )}
                  {STATUS_LABELS[match.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                <ChevronRight className="ml-auto h-4 w-4" />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
