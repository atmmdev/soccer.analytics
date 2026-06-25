'use client';

import Link from 'next/link';
import { Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { MatchAnalysisData } from '@/types/dashboard';

interface MatchAnalysisProps {
  data: MatchAnalysisData;
}

function FormBadge({ result }: { result: 'W' | 'D' | 'L' }) {
  return (
    <span
      className={cn(
        'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold',
        result === 'W' && 'bg-emerald-500/20 text-emerald-400',
        result === 'D' && 'bg-amber-500/20 text-amber-400',
        result === 'L' && 'bg-red-500/20 text-red-400',
      )}
    >
      {result === 'W' ? 'V' : result === 'D' ? 'E' : 'D'}
    </span>
  );
}

export function MatchAnalysis({ data }: MatchAnalysisProps) {
  const maxValues = data.stats.map((s) => Math.max(s.home, s.away));
  const hasMatch = Boolean(data.matchId);

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-start justify-between gap-2 text-base">
          <span>Análise do Jogo — Métricas Rápidas</span>
          {hasMatch ? (
            <Button asChild size="sm" className="h-7 shrink-0 text-xs">
              <Link href={`/matches/${data.matchId}`}>Analisar Jogo</Link>
            </Button>
          ) : (
            <Button size="sm" className="h-7 shrink-0 text-xs" disabled>
              Analisar Jogo
            </Button>
          )}
        </CardTitle>
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <div className="flex items-center gap-3">
            <span className="text-lg">{data.homeFlag}</span>
            <span className="font-semibold">{data.homeTeam}</span>
            <span className="text-muted-foreground">x</span>
            <span className="font-semibold">{data.awayTeam}</span>
            <span className="text-lg">{data.awayFlag}</span>
          </div>
          {data.statsSource && (
            <Badge variant="outline" className="text-[10px]">
              {data.statsSource === 'computed' ? 'Stats reais' : 'Fallback'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.poisson && (
          <div className="rounded-lg border border-violet-500/30 bg-violet-500/5 p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-violet-300">
              <Target className="h-3.5 w-3.5" />
              Modelo Poisson
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">Placar previsto</p>
                <p className="font-mono font-semibold">{data.poisson.predictedScore ?? '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Confiança</p>
                <p className="font-mono font-semibold">{data.poisson.confidence}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">xG casa / fora</p>
                <p className="font-mono">
                  {data.poisson.homeExpectedGoals.toFixed(2)} /{' '}
                  {data.poisson.awayExpectedGoals.toFixed(2)}
                </p>
              </div>
              {data.poisson.topEvMarket && data.poisson.topEv != null && (
                <div>
                  <p className="text-muted-foreground">Top EV+</p>
                  <p className="font-medium text-emerald-400">
                    {data.poisson.topEvMarket}{' '}
                    <span className="font-mono">+{data.poisson.topEv}%</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {data.stats.map((stat, i) => {
          const max = maxValues[i] || 1;
          const homeWidth = (stat.home / max) * 100;
          const awayWidth = (stat.away / max) * 100;
          const suffix = stat.suffix ?? '';

          return (
            <div key={stat.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="w-16 font-mono text-emerald-400">
                  {stat.home}
                  {suffix}
                </span>
                <span className="flex-1 text-center text-muted-foreground">{stat.label}</span>
                <span className="w-16 text-right font-mono text-foreground">
                  {stat.away}
                  {suffix}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex flex-1 justify-end">
                  <div
                    className="h-2 rounded-l-full bg-emerald-500/70"
                    style={{ width: `${homeWidth}%` }}
                  />
                </div>
                <div className="w-px shrink-0" />
                <div className="flex flex-1 justify-start">
                  <div
                    className="h-2 rounded-r-full bg-zinc-500/70"
                    style={{ width: `${awayWidth}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}

        <div className="border-t border-border/40 pt-3">
          <p className="mb-2 text-center text-xs text-muted-foreground">Forma Recente</p>
          <div className="flex items-center justify-between px-4">
            <div className="flex gap-1">
              {data.homeForm.map((r, i) => (
                <FormBadge key={`h-${i}`} result={r} />
              ))}
            </div>
            <div className="flex gap-1">
              {data.awayForm.map((r, i) => (
                <FormBadge key={`a-${i}`} result={r} />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
