'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { ComparisonChart } from '@/components/analyzer/comparison-chart';
import { useMatchAnalysis } from '@/hooks/use-analyzer';
import { useMatches } from '@/hooks/use-matches';
import { useDashboardMatchAnalysis } from '@/hooks/use-dashboard';
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
import { MatchH2HPanel } from '@/components/matches/match-h2h-panel';
import { MatchAnalysis } from '@/components/dashboard/match-analysis';
import type { AnalysisPeriod, AnalysisView } from '@/types/analyzer';
import { PERIODS, VIEW_LABELS } from '@/types/analyzer';

export default function AnalyzerPage() {
  const searchParams = useSearchParams();
  const initialMatchId = searchParams.get('matchId');

  const [matchId, setMatchId] = useState<string | null>(initialMatchId);
  const [period, setPeriod] = useState<AnalysisPeriod>(10);
  const [view, setView] = useState<AnalysisView>('home');

  const { data: scheduledData, isLoading: loadingScheduled } = useMatches({
    status: 'SCHEDULED',
    limit: 50,
  });
  const { data: liveData, isLoading: loadingLive } = useMatches({
    status: 'LIVE',
    limit: 50,
  });
  const loadingMatches = loadingScheduled || loadingLive;
  const matchesData = {
    data: [...(liveData?.data ?? []), ...(scheduledData?.data ?? [])],
  };
  const { data: analysis, isLoading: loadingAnalysis } = useMatchAnalysis(
    matchId,
    period,
    view,
  );
  /** Mesmo endpoint/componente do Dashboard — inclui Modelo Poisson (ensurePoisson). */
  const {
    data: metricsData,
    isLoading: loadingMetrics,
    isFetching: fetchingMetrics,
  } = useDashboardMatchAnalysis(matchId);

  useEffect(() => {
    if (initialMatchId) setMatchId(initialMatchId);
  }, [initialMatchId]);

  useEffect(() => {
    if (!matchId && matchesData.data.length) {
      setMatchId(matchesData.data[0].id);
    }
  }, [matchId, matchesData.data]);

  const matches = matchesData.data;
  const selectedMatch = matches.find((m) => m.id === matchId);
  const matchLabel = analysis
    ? `${analysis.match.homeTeam.name} vs ${analysis.match.awayTeam.name}`
    : selectedMatch
      ? `${selectedMatch.homeTeam.name} vs ${selectedMatch.awayTeam.name}`
      : undefined;
  const canAnalyze =
    selectedMatch?.status === 'SCHEDULED' || selectedMatch?.status === 'LIVE';

  const showMetricsLoading =
    !!matchId && (loadingMetrics || (fetchingMetrics && !metricsData));

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader
        title="Match Analyzer"
        subtitle="Compare equipes por período — Casa, Fora ou H2H"
      />

      <div className="flex-1 space-y-6 p-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[280px] flex-1 space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Partida
            </label>
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
            <label className="text-xs font-medium text-muted-foreground">
              Período
            </label>
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
              <Badge
                variant={
                  analysis.meta.source === 'computed' ? 'default' : 'secondary'
                }
                className="text-xs"
              >
                {analysis.meta.note}
              </Badge>
            </div>

            <div className="grid gap-4 lg:grid-cols-3 lg:items-stretch lg:min-h-[32rem]">
              {matchId && (
                <MatchH2HPanel
                  matchId={matchId}
                  homeTeamName={analysis.match.homeTeam.name}
                  awayTeamName={analysis.match.awayTeam.name}
                  period={period}
                  className="min-h-[28rem] lg:min-h-0 lg:h-full"
                />
              )}

              <MatchAnalysis
                data={metricsData}
                isLoading={showMetricsLoading}
                hideAnalyzeButton
                className="min-h-[28rem] lg:min-h-0 lg:h-full"
              />

              <ComparisonChart
                stats={analysis.stats}
                homeTeam={analysis.match.homeTeam.name}
                awayTeam={analysis.match.awayTeam.name}
                className="min-h-[28rem] lg:min-h-0 lg:h-full"
              />
            </div>
          </>
        )}

        {matchId && (
          <AnalysisPanel
            matchId={matchId}
            matchLabel={matchLabel}
            canAnalyze={canAnalyze || !selectedMatch}
          />
        )}
      </div>
    </div>
  );
}
