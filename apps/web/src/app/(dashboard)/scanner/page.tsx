'use client';

import Link from 'next/link';
import { Loader2, TrendingUp } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useEvPlusMarkets } from '@/hooks/use-analysis';
import {
  RECOMMENDATION_LABELS,
  RECOMMENDATION_VARIANT,
} from '@/types/analysis';

export default function ScannerPage() {
  const { data: markets, isLoading, isError } = useEvPlusMarkets();

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader
        title="Scanner EV+"
        subtitle="Varredura automática de mercados com valor esperado positivo"
      />

      <div className="flex-1 p-6">
        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Oportunidades EV+
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : isError ? (
              <p className="py-8 text-center text-muted-foreground">
                Erro ao carregar scanner. Verifique se a API está rodando.
              </p>
            ) : !markets?.length ? (
              <p className="py-8 text-center text-muted-foreground">
                Nenhum mercado EV+ no momento. Execute análises nos jogos do dia.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Jogo</TableHead>
                    <TableHead>Mercado</TableHead>
                    <TableHead className="text-right">EV</TableHead>
                    <TableHead className="text-right">Odd</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {markets.map((m) => (
                    <TableRow key={`${m.matchId}-${m.market}`}>
                      <TableCell>
                        <Link
                          href={`/matches/${m.matchId}`}
                          className="font-medium hover:text-primary"
                        >
                          {m.matchLabel}
                        </Link>
                      </TableCell>
                      <TableCell>{m.market}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="success" className="font-mono">
                          +{(m.ev * 100).toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {m.bookmakerOdd.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={RECOMMENDATION_VARIANT[m.recommendation]}>
                          {RECOMMENDATION_LABELS[m.recommendation]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
