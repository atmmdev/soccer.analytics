import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-primary',
}: StatCardProps) {
  return (
    <Card className="border-border/60 bg-card/80">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold font-mono tracking-tight">{value}</p>
            {change && (
              <p
                className={cn(
                  'text-xs font-medium',
                  changeType === 'positive' && 'text-emerald-400',
                  changeType === 'negative' && 'text-red-400',
                  changeType === 'neutral' && 'text-muted-foreground',
                )}
              >
                {change}
              </p>
            )}
          </div>
          <div className={cn('rounded-lg bg-primary/10 p-2', iconColor)}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
