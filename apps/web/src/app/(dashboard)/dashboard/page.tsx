'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Wallet,
  TrendingUp,
  Percent,
  CheckCircle,
  XCircle,
  Zap,
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
import { dashboardData } from '@/lib/mock/dashboard';
import type { DashboardData } from '@/lib/mock/dashboard';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

async function fetchDashboard(): Promise<DashboardData> {
  try {
    const { data } = await apiClient.get<DashboardData>('/dashboard');
    return data;
  } catch {
    return dashboardData;
  }
}

export default function DashboardPage() {
  const { data = dashboardData } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
  });

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
            change={`+${formatCurrency(summary.bankroll.change)} / +${summary.bankroll.changePercent}%`}
            changeType="positive"
            icon={Wallet}
          />
          <StatCard
            title="Lucro Hoje"
            value={formatCurrency(summary.profitToday.value)}
            change={`+${summary.profitToday.changePercent}%`}
            changeType="positive"
            icon={TrendingUp}
          />
          <StatCard
            title="ROI"
            value={`${summary.roi.value}%`}
            change={`+${summary.roi.change}%`}
            changeType="positive"
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
