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

interface ComparisonChartProps {
  stats: StatRow[];
  homeTeam: string;
  awayTeam: string;
}

export function ComparisonChart({ stats, homeTeam, awayTeam }: ComparisonChartProps) {
  const chartData = stats
    .filter((s) => !s.suffix || s.suffix !== '%')
    .slice(0, 6)
    .map((s) => ({
      name: s.label.replace(' (média)', '').replace(' (média)', ''),
      [homeTeam]: s.home,
      [awayTeam]: s.away,
    }));

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Comparativo visual</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
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
