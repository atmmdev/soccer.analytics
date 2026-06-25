import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { EvMarket } from '@/lib/mock/dashboard';

interface EvMarketsTableProps {
  markets: EvMarket[];
}

export function EvMarketsTable({ markets }: EvMarketsTableProps) {
  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Mercados EV+</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Mercado</TableHead>
              <TableHead className="text-right">Prob.</TableHead>
              <TableHead className="text-right">Odd Justa</TableHead>
              <TableHead className="text-right">Odd Casa</TableHead>
              <TableHead className="text-right">EV</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {markets.map((market) => (
              <TableRow key={market.id}>
                <TableCell className="font-medium">{market.market}</TableCell>
                <TableCell className="text-right font-mono">{market.probability}%</TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  {market.fairOdd.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {market.bookmakerOdd.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="success" className="font-mono">
                    +{market.ev.toFixed(1)}%
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
