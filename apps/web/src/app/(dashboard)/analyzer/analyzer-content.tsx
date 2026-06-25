'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { StatComparison, FormBadge } from '@/components/analyzer/stat-comparison';
import { ComparisonChart } from '@/components/analyzer/comparison-chart';
import { useMatchAnalysis } from '@/hooks/use-analyzer';
import { useMatches } from '@/hooks/use-matches';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AnalysisPanel } from '@/components/analysis/analysis-panel';
import type { AnalysisPeriod, AnalysisView } from '@/types/analyzer';
import { PERIODS, VIEW_LABELS } from '@/types/analyzer';

export default function AnalyzerPage() {
  const searchParams = useSearchParams();
  const initialMatchId = searchParams.get('matchId');

  const [matchId, setMatchId] = useState<string | null>(initialMatchId);
  const [period, setPeriod] = useState<AnalysisPeriod>(10);
  const [view, setView] = useState<AnalysisView>('home');

  const { data: matchesData, isLoading: loadingMatches } = useMatches({
    status: 'SCHEDULED',
    limit: 50,
  });
  const { data: analysis, isLoading: loadingAnalysis } = useMatchAnalysis(
    matchId,
    period,
    view,
  );

  useEffect(() => {
    if (initialMatchId) setMatchId(initialMatchId);
  }, [initialMatchId]);

  useEffect(() => {
    if (!matchId && matchesData?.data.length) {
      setMatchId(matchesData.data[0].id);
    }
  }, [matchId, matchesData]);

  const matches = matchesData?.data ?? [];
  const selectedMatch = matches.find((m) => m.id === matchId);
  const matchLabel = analysis
    ? `${analysis.match.homeTeam.name} vs ${analysis.match.awayTeam.name}`
    : selectedMatch
      ? `${selectedMatch.homeTeam.name} vs ${selectedMatch.awayTeam.name}`
      : undefined;

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader
        title="Match Analyzer"
        subtitle="Compare equipes por período — Casa, Fora ou H2H"
      />

      <div className="flex-1 space-y-6 p-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[280px] flex-1 space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Partida</label>
            {loadingMatches ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <Select value={matchId ?? undefined} onValueChange={setMatchId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um jogo" />
                </SelectTrigger>
                <SelectContent>
                  {matches.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.homeTeam.name} vs {m.awayTeam.name} —{' '}
                      {new Date(m.matchDate).toLocaleDateString('pt-BR')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Período</label>
            <div className="flex gap-1">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    period === p
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Tabs value={view} onValueChange={(v) => setView(v as AnalysisView)}>
          <TabsList>
            {(Object.keys(VIEW_LABELS) as AnalysisView[]).map((v) => (
              <TabsTrigger key={v} value={v}>
                {VIEW_LABELS[v]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {loadingAnalysis && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {analysis && !loadingAnalysis && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Últimos {analysis.period} jogos · {VIEW_LABELS[analysis.view]}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Dados de exemplo
              </Badge>
            </div>

            {analysis.h2h && view === 'h2h' && (
              <Card className="border-border/60 bg-card/80">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Head to Head</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center gap-8 text-center">
                    <div>
                      <p className="text-2xl font-bold text-emerald-400">{analysis.h2h.homeWins}</p>
                      <p className="text-xs text-muted-foreground">Vitórias casa</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{analysis.h2h.draws}</p>
                      <p className="text-xs text-muted-foreground">Empates</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{analysis.h2h.awayWins}</p>
                      <p className="text-xs text-muted-foreground">Vitórias fora</p>
                    </div>
                  </div>
                  <p className="mt-4 text-center text-xs text-muted-foreground">
                    Últimos placares: {analysis.h2h.lastMeetings.join(' · ')}
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="border-border/60 bg-card/80">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {analysis.match.homeTeam.name} x {analysis.match.awayTeam.name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{analysis.match.competition}</p>
                </CardHeader>
                <CardContent>
                  <StatComparison
                    stats={analysis.stats}
                    homeTeam={analysis.match.homeTeam.name}
                    awayTeam={analysis.match.awayTeam.name}
                  />
                  <div className="mt-4 border-t border-border/40 pt-4">
                    <p className="mb-2 text-center text-xs text-muted-foreground">Forma recente</p>
                    <div className="flex items-center justify-between px-4">
                      <div className="flex gap-1">
                        {analysis.homeForm.map((r, i) => (
                          <FormBadge key={`h-${i}`} result={r} />
                        ))}
                      </div>
                      <div className="flex gap-1">
                        {analysis.awayForm.map((r, i) => (
                          <FormBadge key={`a-${i}`} result={r} />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <ComparisonChart
                stats={analysis.stats}
                homeTeam={analysis.match.homeTeam.name}
                awayTeam={analysis.match.awayTeam.name}
              />
            </div>
          </>
        )}

        {matchId && <AnalysisPanel matchId={matchId} matchLabel={matchLabel} />}
      </div>
    </div>
  );
}
