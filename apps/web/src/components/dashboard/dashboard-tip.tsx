import { Lightbulb } from 'lucide-react';

interface DashboardTipProps {
  tip: string;
}

export function DashboardTip({ tip }: DashboardTipProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
      <Lightbulb className="h-4 w-4 shrink-0 text-primary" />
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-primary">Dica do dia:</span> {tip}
      </p>
    </div>
  );
}
