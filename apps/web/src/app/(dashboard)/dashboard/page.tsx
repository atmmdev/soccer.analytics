'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Wallet,
  TrendingUp,
  Percent,
  CheckCircle,
  XCircle,
  Zap,
  Loader2,
} from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { TodayMatches } from '@/components/dashboard/today-matches';
import { MatchAnalysis } from '@/components/dashboard/match-analysis';
import { TicketBuilderWidget } from '@/components/dashboard/ticket-builder-widget';
import { EvMarketsTable } from '@/components/dashboard/ev-markets-table';
import { BankrollChart } from '@/components/dashboard/bankroll-chart';
import { RecentEntries } from '@/components/dashboard/recent-entries';
import { DashboardTip } from '@/components/dashboard/dashboard-tip';
import { apiClient } from '@/lib/api/client';
import type { DashboardData } from '@/types/dashboard';
import { useSyncStatus } from '@/hooks/use-sync';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

async function fetchDashboard(): Promise<DashboardData> {
  const { data } = await apiClient.get<DashboardData>('/dashboard');
  return data;
}

export default function DashboardPage() {
  const { data: sync } = useSyncStatus();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
    refetchInterval: sync?.status === 'running' ? 5000 : false,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-full flex-col">
        <AppHeader title="Dashboard" subtitle="Visão geral do desempenho e oportunidades" />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="text-muted-foreground">Não foi possível carregar o dashboard.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-sm text-primary hover:underline"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const { summary } = data;

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader
        title="Dashboard"
        subtitle="Visão geral do seu desempenho e oportunidades do dia"
      />

      <div className="flex-1 space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            title="Banca Atual"
            value={formatCurrency(summary.bankroll.value)}
            change={`${summary.bankroll.change >= 0 ? '+' : ''}${formatCurrency(summary.bankroll.change)} / ${summary.bankroll.changePercent >= 0 ? '+' : ''}${summary.bankroll.changePercent}%`}
            changeType={summary.bankroll.change >= 0 ? 'positive' : 'negative'}
            icon={Wallet}
          />
          <StatCard
            title="Lucro Hoje"
            value={formatCurrency(summary.profitToday.value)}
            change={`${summary.profitToday.value >= 0 ? '+' : ''}${formatCurrency(summary.profitToday.value)}`}
            changeType={summary.profitToday.value >= 0 ? 'positive' : 'negative'}
            icon={TrendingUp}
          />
          <StatCard
            title="ROI"
            value={`${summary.roi.value}%`}
            change={`${summary.roi.change >= 0 ? '+' : ''}${summary.roi.change}% yield`}
            changeType={summary.roi.value >= 0 ? 'positive' : 'negative'}
            icon={Percent}
          />
          <StatCard
            title="Greens"
            value={String(summary.greens.count)}
            change={`${summary.greens.percent}%`}
            changeType="positive"
            icon={CheckCircle}
            iconColor="text-emerald-400"
          />
          <StatCard
            title="Reds"
            value={String(summary.reds.count)}
            change={`${summary.reds.percent}%`}
            changeType="negative"
            icon={XCircle}
            iconColor="text-red-400"
          />
          <StatCard
            title="EV+ Hoje"
            value={String(summary.evPlusToday)}
            change="oportunidades"
            changeType="neutral"
            icon={Zap}
            iconColor="text-violet-400"
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <div className="xl:col-span-1">
            <TodayMatches matches={data.todayMatches} />
          </div>
          <div className="xl:col-span-1">
            <MatchAnalysis data={data.matchAnalysis} />
          </div>
          <div className="xl:col-span-1">
            <TicketBuilderWidget data={data.ticketBuilder} />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <EvMarketsTable markets={data.evMarkets} />
          <BankrollChart data={data.bankrollHistory} />
        </div>

        <RecentEntries entries={data.recentEntries} />

        <DashboardTip tip={data.tip} />
      </div>
    </div>
  );
}
