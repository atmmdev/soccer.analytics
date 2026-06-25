import { cn } from '@/lib/utils';
import type { StatRow } from '@/types/analyzer';

export function FormBadge({ result }: { result: 'W' | 'D' | 'L' }) {
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

interface StatComparisonProps {
  stats: StatRow[];
  homeTeam: string;
  awayTeam: string;
}

export function StatComparison({ stats, homeTeam, awayTeam }: StatComparisonProps) {
  const maxValues = stats.map((s) => Math.max(s.home, s.away));

  return (
    <div className="space-y-3">
      <div className="mb-4 flex items-center justify-between text-sm font-medium">
        <span className="text-emerald-400">{homeTeam}</span>
        <span className="text-muted-foreground">vs</span>
        <span>{awayTeam}</span>
      </div>

      {stats.map((stat, i) => {
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
                  className="h-2 rounded-l-full bg-emerald-500/70 transition-all"
                  style={{ width: `${homeWidth}%` }}
                />
              </div>
              <div className="w-px shrink-0" />
              <div className="flex flex-1 justify-start">
                <div
                  className="h-2 rounded-r-full bg-zinc-500/70 transition-all"
                  style={{ width: `${awayWidth}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
