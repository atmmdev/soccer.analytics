'use client';

import Link from 'next/link';
import { Loader2, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { MatchAnalysisData } from '@/types/dashboard';

interface MatchAnalysisProps {
  data: MatchAnalysisData | undefined;
  isLoading?: boolean;
  className?: string;
  /** Oculta o botão "Analisar Jogo" (ex.: já estamos no Analyzer) */
  hideAnalyzeButton?: boolean;
  title?: string;
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

export function MatchAnalysis({
  data,
  isLoading,
  className,
  hideAnalyzeButton = false,
  title = 'Análise do Jogo — Métricas Rápidas',
}: MatchAnalysisProps) {
  if (isLoading || !data) {
    return (
      <Card
        className={cn('flex flex-col border-border/60 bg-card/80', className)}
      >
        <CardHeader className="shrink-0 pb-3">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const maxValues = data.stats.map((s) => Math.max(s.home, s.away));
  const hasMatch = Boolean(data.matchId);

  return (
    <Card className={cn('flex flex-col border-border/60 bg-card/80', className)}>
      <CardHeader className="shrink-0 pb-3">
        <CardTitle className="justify-between">
          <span className="min-w-0 truncate">
            {hasMatch ? `${data.homeTeam} x ${data.awayTeam}` : title}
          </span>
          {!hideAnalyzeButton &&
            (hasMatch ? (
              <Button asChild size="sm" className="h-7 shrink-0 text-xs">
                <Link href={`/matches/${data.matchId}`}>Analisar Jogo</Link>
              </Button>
            ) : (
              <Button size="sm" className="h-7 shrink-0 text-xs" disabled>
                Analisar Jogo
              </Button>
            ))}
          {hideAnalyzeButton && data.statsSource && (
            <Badge variant="outline" className="shrink-0 text-[10px] normal-case tracking-normal">
              {data.statsSource === 'computed' ? 'Stats reais' : 'Fallback'}
            </Badge>
          )}
        </CardTitle>
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <div className="flex items-center gap-3">
            {data.homeFlag ? (
              <span className="text-lg">{data.homeFlag}</span>
            ) : null}
            <span className="font-semibold text-emerald-400">{data.homeTeam}</span>
            <span className="text-muted-foreground">vs</span>
            <span className="font-semibold">{data.awayTeam}</span>
            {data.awayFlag ? (
              <span className="text-lg">{data.awayFlag}</span>
            ) : null}
          </div>
          {!hideAnalyzeButton && data.statsSource && (
            <Badge variant="outline" className="text-[10px]">
              {data.statsSource === 'computed' ? 'Stats reais' : 'Fallback'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col space-y-3 overflow-y-auto">
        {!hasMatch && data.stats.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Selecione um jogo ao lado para ver as métricas rápidas.
          </p>
        ) : (
          <>
            {data.poisson && (
              <div className="shrink-0 space-y-2 rounded-lg border border-violet-500/30 bg-violet-500/5 p-3">
                <div className="flex items-center gap-2 text-xs font-medium text-violet-300">
                  <Target className="h-3.5 w-3.5" />
                  Modelo Poisson
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                  <div>
                    <p className="text-muted-foreground">Placar previsto</p>
                    <p className="font-mono font-semibold">
                      {data.poisson.predictedScore ?? '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Confiança</p>
                    <p className="font-mono font-semibold">
                      {data.poisson.confidence}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">xG casa / fora</p>
                    <p className="font-mono">
                      {data.poisson.homeExpectedGoals.toFixed(2)} /{' '}
                      {data.poisson.awayExpectedGoals.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Top EV+</p>
                    {data.poisson.topEvMarket && data.poisson.topEv != null ? (
                      <p className="font-medium text-emerald-400">
                        {data.poisson.topEvMarket}{' '}
                        <span className="font-mono">
                          +{data.poisson.topEv}%
                        </span>
                      </p>
                    ) : (
                      <p className="font-mono text-muted-foreground">—</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="min-h-0 flex-1 space-y-3">
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
                      <span className="flex-1 text-center text-muted-foreground">
                        {stat.label}
                      </span>
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
            </div>

            <div className="shrink-0 border-t border-border/40 pt-3">
              <p className="mb-2 text-center text-xs text-muted-foreground">
                Forma Recente
              </p>
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
