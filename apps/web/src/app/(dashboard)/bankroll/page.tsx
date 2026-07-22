'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Loader2,
  Lock,
  Plus,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { isAxiosError } from 'axios';
import { AppHeader } from '@/components/layout/app-header';
import { BankrollChart } from '@/components/dashboard/bankroll-chart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  useBankrollPeriods,
  useBankrollSummary,
  useCloseBankrollPeriod,
  useCreateBankrollEntry,
  useCreateBankrollPeriod,
} from '@/hooks/use-bankroll';
import { ENTRY_TYPE_LABELS, PERIOD_STATUS_LABELS } from '@/types/bankroll';
import { toast } from 'sonner';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR');
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
          className={`mt-1 font-mono text-2xl font-bold ${
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

function errorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] };
    if (Array.isArray(data?.message)) return data.message.join(', ');
    if (typeof data?.message === 'string') return data.message;
    return error.message;
  }
  return fallback;
}

export default function BankrollPage() {
  const { data: periods, isLoading: loadingPeriods } = useBankrollPeriods();
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);

  const openPeriod = useMemo(
    () => periods?.find((p) => p.status === 'OPEN') ?? null,
    [periods],
  );

  useEffect(() => {
    if (!periods?.length) return;
    if (
      selectedPeriodId &&
      periods.some((p) => p.id === selectedPeriodId)
    ) {
      return;
    }
    setSelectedPeriodId(openPeriod?.id ?? periods[0].id);
  }, [periods, openPeriod, selectedPeriodId]);

  const periodId = selectedPeriodId;
  const selectedPeriod =
    periods?.find((p) => p.id === periodId) ?? openPeriod ?? null;
  const isOpen = selectedPeriod?.status === 'OPEN';

  const { data: summary, isLoading } = useBankrollSummary(periodId);
  const { data: history } = useBankrollHistory(periodId);
  const { data: entries } = useBankrollEntries(periodId);
  const createEntry = useCreateBankrollEntry();
  const createPeriod = useCreateBankrollPeriod();
  const closePeriod = useCloseBankrollPeriod();

  const [depositAmount, setDepositAmount] = useState('100');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('1000');
  const [newStartsAt, setNewStartsAt] = useState(
    () => new Date().toISOString().slice(0, 10),
  );

  const handleDeposit = () => {
    if (!periodId || !isOpen) {
      toast.error('Selecione uma banca aberta');
      return;
    }
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      toast.error('Informe um valor válido');
      return;
    }
    createEntry.mutate(
      {
        type: 'DEPOSIT',
        amount,
        description: 'Depósito manual',
        periodId,
      },
      {
        onSuccess: () => toast.success('Depósito registrado'),
        onError: (error) =>
          toast.error(errorMessage(error, 'Falha ao registrar depósito')),
      },
    );
  };

  const handleCreatePeriod = () => {
    const amount = parseFloat(newAmount);
    if (!newName.trim()) {
      toast.error('Informe o nome da banca');
      return;
    }
    if (!amount || amount <= 0) {
      toast.error('Informe o valor inicial');
      return;
    }

    createPeriod.mutate(
      {
        name: newName.trim(),
        initialAmount: amount,
        startsAt: new Date(`${newStartsAt}T12:00:00`).toISOString(),
      },
      {
        onSuccess: (period) => {
          toast.success(`Banca "${period.name}" criada`);
          setSelectedPeriodId(period.id);
          setShowCreate(false);
          setNewName('');
          setNewAmount('1000');
        },
        onError: (error) =>
          toast.error(errorMessage(error, 'Falha ao criar banca')),
      },
    );
  };

  const handleClosePeriod = () => {
    if (!selectedPeriod || selectedPeriod.status !== 'OPEN') return;
    const ok = window.confirm(
      `Fechar a banca "${selectedPeriod.name}"? Não será mais possível movimentá-la.`,
    );
    if (!ok) return;

    closePeriod.mutate(
      { periodId: selectedPeriod.id },
      {
        onSuccess: (period) => {
          toast.success(
            `Banca fechada · saldo final ${formatCurrency(period.closingBalance ?? 0)}`,
          );
        },
        onError: (error) =>
          toast.error(errorMessage(error, 'Falha ao fechar banca')),
      },
    );
  };

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader
        title="Banca"
        subtitle="Administre bancas por período — abra, opere e feche"
      />

      <div className="flex-1 space-y-6 p-6">
        <Card className="border-border/60 bg-card/80">
          <CardContent className="flex flex-wrap items-end gap-3 p-4">
            <div className="min-w-[220px] flex-1 space-y-1">
              <label className="text-xs text-muted-foreground">Banca</label>
              <Select
                value={periodId ?? undefined}
                onValueChange={setSelectedPeriodId}
                disabled={loadingPeriods || !periods?.length}
              >
                <SelectTrigger className="bg-secondary/30">
                  <SelectValue placeholder="Selecione a banca" />
                </SelectTrigger>
                <SelectContent>
                  {[...(periods ?? [])]
                    .sort((a, b) => {
                      if (a.status !== b.status) {
                        return a.status === 'OPEN' ? -1 : 1;
                      }
                      return (
                        new Date(b.startsAt).getTime() -
                        new Date(a.startsAt).getTime()
                      );
                    })
                    .map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} · {PERIOD_STATUS_LABELS[p.status]}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPeriod && (
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>
                  {formatDate(selectedPeriod.startsAt)}
                  {selectedPeriod.endsAt
                    ? ` → ${formatDate(selectedPeriod.endsAt)}`
                    : ' → em andamento'}
                </p>
                <Badge variant={isOpen ? 'success' : 'secondary'}>
                  {PERIOD_STATUS_LABELS[selectedPeriod.status]}
                </Badge>
              </div>
            )}

            <div className="ml-auto flex flex-wrap gap-2">
              {isOpen && (
                <Button
                  variant="outline"
                  onClick={handleClosePeriod}
                  disabled={closePeriod.isPending}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Fechar banca
                </Button>
              )}
              <Button onClick={() => setShowCreate((v) => !v)}>
                <Plus className="mr-2 h-4 w-4" />
                Nova banca
              </Button>
            </div>
          </CardContent>

          {showCreate && (
            <CardContent className="border-t border-border/40 pt-4">
              {openPeriod ? (
                <p className="text-sm text-muted-foreground">
                  Já existe a banca aberta <strong>{openPeriod.name}</strong>.
                  Feche-a antes de abrir um novo período.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs text-muted-foreground">Nome</label>
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Ex: Julho/2026"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">
                      Início
                    </label>
                    <Input
                      type="date"
                      value={newStartsAt}
                      onChange={(e) => setNewStartsAt(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">
                      Valor inicial (R$)
                    </label>
                    <Input
                      type="number"
                      min={1}
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end gap-2 sm:col-span-4">
                    <Button
                      onClick={handleCreatePeriod}
                      disabled={createPeriod.isPending}
                    >
                      {createPeriod.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Criar banca
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowCreate(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {isLoading || loadingPeriods ? (
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
                    disabled={!isOpen}
                  />
                  <Button
                    onClick={handleDeposit}
                    disabled={createEntry.isPending || !isOpen}
                  >
                    Adicionar
                  </Button>
                </CardContent>
                {!isOpen && (
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground">
                      Banca fechada — somente consulta.
                    </p>
                  </CardContent>
                )}
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
                    <p className="font-mono font-bold">
                      {summary.ticketsPlaced}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400">
                      {summary.ticketsWon} greens
                    </span>
                    <TrendingDown className="ml-2 h-4 w-4 text-red-400" />
                    <span className="text-red-400">
                      {summary.ticketsLost} reds
                    </span>
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
                    Nenhuma movimentação nesta banca.
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
                              entry.amount >= 0
                                ? 'text-emerald-400'
                                : 'text-red-400'
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
