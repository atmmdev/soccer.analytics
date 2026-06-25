import { Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { RecentEntry } from '@/lib/mock/dashboard';

interface RecentEntriesProps {
  entries: RecentEntry[];
}

function formatCurrency(value: number) {
  const prefix = value >= 0 ? '+' : '';
  return prefix + value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function RecentEntries({ entries }: RecentEntriesProps) {
  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Últimas Entradas</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Data</TableHead>
              <TableHead>Mercado</TableHead>
              <TableHead className="text-right">Odd</TableHead>
              <TableHead className="text-right">Stake</TableHead>
              <TableHead className="text-center">Resultado</TableHead>
              <TableHead className="text-right">P/L</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-mono text-muted-foreground">{entry.date}</TableCell>
                <TableCell>{entry.market}</TableCell>
                <TableCell className="text-right font-mono">{entry.odd.toFixed(2)}</TableCell>
                <TableCell className="text-right font-mono">
                  R$ {entry.stake.toFixed(2)}
                </TableCell>
                <TableCell className="text-center">
                  {entry.result === 'win' ? (
                    <Check className="mx-auto h-4 w-4 text-emerald-400" />
                  ) : (
                    <X className="mx-auto h-4 w-4 text-red-400" />
                  )}
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right font-mono font-semibold',
                    entry.profit >= 0 ? 'text-emerald-400' : 'text-red-400',
                  )}
                >
                  {formatCurrency(entry.profit)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
