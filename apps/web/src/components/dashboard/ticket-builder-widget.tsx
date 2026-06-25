import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ticket } from 'lucide-react';
import type { TicketBuilderData } from '@/lib/mock/dashboard';

interface TicketBuilderWidgetProps {
  data: TicketBuilderData;
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function TicketBuilderWidget({ data }: TicketBuilderWidgetProps) {
  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Ticket className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">Bilhete Builder</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {data.selections.map((sel) => (
            <div
              key={sel.market}
              className="flex items-center justify-between rounded-lg border border-border/40 bg-secondary/20 px-3 py-2"
            >
              <span className="text-sm">{sel.market}</span>
              <span className="font-mono text-sm font-semibold text-primary">
                {sel.odd.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Odd total</p>
            <p className="font-mono font-bold">{data.combinedOdd.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Probabilidade</p>
            <p className="font-mono font-bold">{data.probability}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">EV</p>
            <p className="font-mono font-bold text-emerald-400">+{data.ev}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Stake sugerida</p>
            <p className="font-mono font-bold">{formatCurrency(data.suggestedStake)}</p>
          </div>
        </div>

        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-center">
          <p className="text-xs text-muted-foreground">Retorno potencial</p>
          <p className="text-xl font-bold font-mono text-primary">
            {formatCurrency(data.potentialReturn)}
          </p>
        </div>

        <Button className="w-full">Salvar Bilhete</Button>
      </CardContent>
    </Card>
  );
}
