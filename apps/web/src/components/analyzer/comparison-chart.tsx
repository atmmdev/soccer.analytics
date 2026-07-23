'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { StatRow } from '@/types/analyzer';
import { cn } from '@/lib/utils';

interface ComparisonChartProps {
  stats: StatRow[];
  homeTeam: string;
  awayTeam: string;
  className?: string;
}

export function ComparisonChart({
  stats,
  homeTeam,
  awayTeam,
  className,
}: ComparisonChartProps) {
  const chartData = stats
    .filter((s) => !s.suffix || s.suffix !== '%')
    .slice(0, 6)
    .map((s) => ({
      name: s.label.replace(' (média)', '').replace(' (média)', ''),
      [homeTeam]: s.home,
      [awayTeam]: s.away,
    }));

  return (
    <Card className={cn('flex flex-col border-border/60 bg-card/80', className)}>
      <CardHeader className="shrink-0 pb-2">
        <CardTitle>Comparativo visual</CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-[280px] w-full flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#71717a', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#71717a', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend />
              <Bar dataKey={homeTeam} fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey={awayTeam} fill="#71717a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
