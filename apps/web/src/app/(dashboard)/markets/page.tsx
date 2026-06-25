'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Loader2, Play, TrendingUp } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAnalyzedMarkets } from '@/hooks/use-analysis';
import {
  RECOMMENDATION_LABELS,
  RECOMMENDATION_VARIANT,
} from '@/types/analysis';

type MarketFilter = 'all' | 'ev-plus' | 'bet';

export default function MarketsPage() {
  const [filter, setFilter] = useState<MarketFilter>('all');
  const { data: markets, isLoading, isError } = useAnalyzedMarkets(filter);

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader
        title="Mercados"
        subtitle="Probabilidades, odds justas, EV e recomendações por jogo"
      />

      <div className="flex-1 space-y-4 p-6">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as MarketFilter)}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="ev-plus">EV+</TabsTrigger>
            <TabsTrigger value="bet">Apostar</TabsTrigger>
          </TabsList>
        </Tabs>

        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Mercados analisados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : isError ? (
              <div className="space-y-4 py-8 text-center">
                <p className="text-muted-foreground">
                  Não foi possível carregar os mercados. Verifique se a API está rodando
                  (use <code className="text-xs">pnpm start</code> na raiz do projeto).
                </p>
                <Button asChild variant="outline">
                  <Link href="/matches">Ir para Jogos</Link>
                </Button>
              </div>
            ) : !markets?.length ? (
              <div className="space-y-4 py-8 text-center">
                <p className="text-muted-foreground">
                  Nenhum mercado analisado ainda. Execute o Analysis Engine em um jogo
                  para gerar probabilidades e EV.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button asChild>
                    <Link href="/matches">
                      <Play className="mr-2 h-4 w-4" />
                      Abrir Jogos
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/analyzer">Ir para Estatísticas</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Jogo</TableHead>
                    <TableHead>Competição</TableHead>
                    <TableHead>Mercado</TableHead>
                    <TableHead className="text-right">Prob.</TableHead>
                    <TableHead className="text-right">Odd justa</TableHead>
                    <TableHead className="text-right">Odd casa</TableHead>
                    <TableHead className="text-right">EV</TableHead>
                    <TableHead className="text-right">Conf.</TableHead>
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
                      <TableCell className="text-muted-foreground">
                        {m.competition}
                      </TableCell>
                      <TableCell>{m.market}</TableCell>
                      <TableCell className="text-right font-mono">
                        {(m.probability * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {m.fairOdd.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {m.bookmakerOdd.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={m.ev > 0 ? 'success' : 'secondary'}
                          className="font-mono"
                        >
                          {m.ev >= 0 ? '+' : ''}
                          {(m.ev * 100).toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {m.confidence}%
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
