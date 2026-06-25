import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { MatchAnalysisData } from '@/lib/mock/dashboard';

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

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Análise do Jogo</CardTitle>
        <div className="flex items-center justify-center gap-3 pt-1">
          <span className="text-lg">{data.homeFlag}</span>
          <span className="font-semibold">{data.homeTeam}</span>
          <span className="text-muted-foreground">x</span>
          <span className="font-semibold">{data.awayTeam}</span>
          <span className="text-lg">{data.awayFlag}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.stats.map((stat, i) => {
          const max = maxValues[i] || 1;
          const homeWidth = (stat.home / max) * 100;
          const awayWidth = (stat.away / max) * 100;
          const suffix = stat.suffix ?? '';

          return (
            <div key={stat.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="w-16 font-mono text-emerald-400">
                  {stat.home}{suffix}
                </span>
                <span className="flex-1 text-center text-muted-foreground">
                  {stat.label}
                </span>
                <span className="w-16 text-right font-mono text-foreground">
                  {stat.away}{suffix}
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
