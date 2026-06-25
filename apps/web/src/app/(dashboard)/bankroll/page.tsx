'use client';

import { useState } from 'react';
import { Loader2, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { BankrollChart } from '@/components/dashboard/bankroll-chart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useBankrollEntries,
  useBankrollHistory,
  useBankrollSummary,
  useCreateBankrollEntry,
} from '@/hooks/use-bankroll';
import { ENTRY_TYPE_LABELS } from '@/types/bankroll';
import { toast } from 'sonner';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function KpiCard({
  label,
  value,
  sub,
  positive,
}: {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
}) {
  return (
    <Card className="border-border/60 bg-card/80">
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={`mt-1 text-2xl font-bold font-mono ${
            positive === true
              ? 'text-emerald-400'
              : positive === false
                ? 'text-red-400'
                : ''
          }`}
        >
          {value}
        </p>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function BankrollPage() {
  const { data: summary, isLoading } = useBankrollSummary();
  const { data: history } = useBankrollHistory();
  const { data: entries } = useBankrollEntries();
  const createEntry = useCreateBankrollEntry();
  const [depositAmount, setDepositAmount] = useState('100');

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      toast.error('Informe um valor válido');
      return;
    }
    createEntry.mutate(
      { type: 'DEPOSIT', amount, description: 'Depósito manual' },
      {
        onSuccess: () => toast.success('Depósito registrado'),
        onError: () => toast.error('Falha ao registrar depósito'),
      },
    );
  };

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader
        title="Banca"
        subtitle="ROI, yield, drawdown e histórico financeiro"
      />

      <div className="flex-1 space-y-6 p-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : summary ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                label="Saldo atual"
                value={formatCurrency(summary.balance)}
                sub={`Depósito inicial: ${formatCurrency(summary.initialDeposit)}`}
              />
              <KpiCard
                label="Lucro / Prejuízo"
                value={formatCurrency(summary.profit)}
                positive={summary.profit >= 0}
              />
              <KpiCard
                label="ROI"
                value={`${summary.roi >= 0 ? '+' : ''}${summary.roi.toFixed(1)}%`}
                sub={`Yield: ${summary.yield.toFixed(1)}%`}
                positive={summary.roi >= 0}
              />
              <KpiCard
                label="Win rate"
                value={`${summary.winRate.toFixed(0)}%`}
                sub={`${summary.ticketsWon}G · ${summary.ticketsLost}R · DD ${summary.maxDrawdown}%`}
              />
            </div>

            {history && history.length > 0 && <BankrollChart data={history} />}

            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="border-border/60 bg-card/80 lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Wallet className="h-4 w-4 text-primary" />
                    Depósito rápido
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Input
                    type="number"
                    min={1}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                  />
                  <Button onClick={handleDeposit} disabled={createEntry.isPending}>
                    Adicionar
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/80 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Resumo de apostas</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total apostado</p>
                    <p className="font-mono font-bold">
                      {formatCurrency(summary.totalStaked)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Bilhetes apostados</p>
                    <p className="font-mono font-bold">{summary.ticketsPlaced}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400">{summary.ticketsWon} greens</span>
                    <TrendingDown className="ml-2 h-4 w-4 text-red-400" />
                    <span className="text-red-400">{summary.ticketsLost} reds</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/60 bg-card/80">
              <CardHeader>
                <CardTitle className="text-base">Movimentações</CardTitle>
              </CardHeader>
              <CardContent>
                {!entries?.length ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Nenhuma movimentação ainda.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Data</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="text-muted-foreground">
                            {new Date(entry.createdAt).toLocaleString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {ENTRY_TYPE_LABELS[entry.type] ?? entry.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{entry.description ?? '—'}</TableCell>
                          <TableCell
                            className={`text-right font-mono font-semibold ${
                              entry.amount >= 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {entry.amount >= 0 ? '+' : ''}
                            {formatCurrency(entry.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  );
}
