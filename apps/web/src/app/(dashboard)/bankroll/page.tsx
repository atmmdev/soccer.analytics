'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Loader2,
  Lock,
  Pencil,
  Plus,
  Trash2,
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
  useBankrollCorrelatedTickets,
  useBankrollEntries,
  useBankrollHistory,
  useBankrollPeriods,
  useBankrollSummary,
  useCloseBankrollPeriod,
  useCreateBankrollEntry,
  useCreateBankrollPeriod,
  useDeleteBankrollEntry,
  useLinkBankrollTickets,
  useUnlinkBankrollTickets,
  useUpdateBankrollEntry,
  useUpdateBankrollPeriod,
} from '@/hooks/use-bankroll';
import { ENTRY_TYPE_LABELS, PERIOD_STATUS_LABELS } from '@/types/bankroll';
import { toast } from 'sonner';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR');
}

function toInputDate(value: string | null | undefined) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
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
    if (selectedPeriodId && periods.some((p) => p.id === selectedPeriodId)) {
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
  const { data: correlated, isLoading: loadingCorrelated } =
    useBankrollCorrelatedTickets(periodId);

  const createEntry = useCreateBankrollEntry();
  const updateEntry = useUpdateBankrollEntry();
  const deleteEntry = useDeleteBankrollEntry();
  const createPeriod = useCreateBankrollPeriod();
  const updatePeriod = useUpdateBankrollPeriod();
  const closePeriod = useCloseBankrollPeriod();
  const linkTickets = useLinkBankrollTickets();
  const unlinkTickets = useUnlinkBankrollTickets();

  const [depositAmount, setDepositAmount] = useState('100');
  const [panel, setPanel] = useState<'none' | 'create' | 'edit'>('none');
  const [selectedStudyIds, setSelectedStudyIds] = useState<string[]>([]);
  const [selectedSystemIds, setSelectedSystemIds] = useState<string[]>([]);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingEntryAmount, setEditingEntryAmount] = useState('');

  const [formName, setFormName] = useState('');
  const [formAmount, setFormAmount] = useState('1000');
  const [formStartsAt, setFormStartsAt] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [formEndsAt, setFormEndsAt] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const openCreate = () => {
    setFormName('');
    setFormAmount('1000');
    setFormStartsAt(new Date().toISOString().slice(0, 10));
    setFormEndsAt('');
    setFormNotes('');
    setPanel('create');
  };

  const openEdit = () => {
    if (!selectedPeriod) return;
    setFormName(selectedPeriod.name);
    setFormAmount(String(selectedPeriod.initialAmount));
    setFormStartsAt(toInputDate(selectedPeriod.startsAt));
    setFormEndsAt(toInputDate(selectedPeriod.endsAt));
    setFormNotes(selectedPeriod.notes ?? '');
    setPanel('edit');
  };

  useEffect(() => {
    setSelectedStudyIds([]);
    setSelectedSystemIds([]);
  }, [periodId]);

  const toggleId = (
    id: string,
    list: string[],
    setList: (next: string[]) => void,
  ) => {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const handleLinkSelected = () => {
    if (!periodId || !isOpen) return;
    if (!selectedStudyIds.length && !selectedSystemIds.length) {
      toast.error('Selecione ao menos um bilhete');
      return;
    }
    linkTickets.mutate(
      {
        periodId,
        studyTicketIds: selectedStudyIds,
        ticketIds: selectedSystemIds,
      },
      {
        onSuccess: () => {
          toast.success('Bilhetes vinculados à banca');
          setSelectedStudyIds([]);
          setSelectedSystemIds([]);
        },
        onError: (error) =>
          toast.error(errorMessage(error, 'Falha ao vincular bilhetes')),
      },
    );
  };

  const handleUnlinkStudy = (id: string) => {
    if (!periodId) return;
    unlinkTickets.mutate(
      { periodId, studyTicketIds: [id] },
      {
        onSuccess: () => toast.success('Bilhete desvinculado'),
        onError: (error) =>
          toast.error(errorMessage(error, 'Falha ao desvincular')),
      },
    );
  };

  const handleUnlinkSystem = (id: string) => {
    if (!periodId) return;
    unlinkTickets.mutate(
      { periodId, ticketIds: [id] },
      {
        onSuccess: () => toast.success('Bilhete desvinculado'),
        onError: (error) =>
          toast.error(errorMessage(error, 'Falha ao desvincular')),
      },
    );
  };

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
    const amount = parseFloat(formAmount);
    if (!formName.trim()) {
      toast.error('Informe o nome da banca');
      return;
    }
    if (!amount || amount <= 0) {
      toast.error('Informe o valor inicial');
      return;
    }
    if (!formStartsAt) {
      toast.error('Informe o início do período');
      return;
    }
    if (formEndsAt && formEndsAt < formStartsAt) {
      toast.error('A data final deve ser posterior à inicial');
      return;
    }

    createPeriod.mutate(
      {
        name: formName.trim(),
        initialAmount: amount,
        startsAt: formStartsAt,
        endsAt: formEndsAt || undefined,
        notes: formNotes.trim() || undefined,
      },
      {
        onSuccess: (period) => {
          toast.success(`Banca "${period.name}" criada`);
          setSelectedPeriodId(period.id);
          setPanel('none');
        },
        onError: (error) =>
          toast.error(errorMessage(error, 'Falha ao criar banca')),
      },
    );
  };

  const handleUpdatePeriod = () => {
    if (!selectedPeriod) return;
    const amount = parseFloat(formAmount);
    if (!formName.trim()) {
      toast.error('Informe o nome da banca');
      return;
    }
    if (Number.isNaN(amount) || amount < 0) {
      toast.error('Informe o valor inicial (0 ou mais)');
      return;
    }
    if (!formStartsAt) {
      toast.error('Informe o início do período');
      return;
    }
    if (formEndsAt && formEndsAt < formStartsAt) {
      toast.error('A data final deve ser posterior à inicial');
      return;
    }

    updatePeriod.mutate(
      {
        periodId: selectedPeriod.id,
        name: formName.trim(),
        initialAmount: amount,
        startsAt: formStartsAt,
        endsAt: formEndsAt || null,
        notes: formNotes.trim() || null,
      },
      {
        onSuccess: (period) => {
          toast.success(`Banca "${period.name}" atualizada`);
          setPanel('none');
        },
        onError: (error) =>
          toast.error(errorMessage(error, 'Falha ao atualizar banca')),
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

  const isManualCashEntry = (type: string) =>
    type === 'DEPOSIT' || type === 'WITHDRAWAL';

  const startEditEntry = (entryId: string, amount: number) => {
    setEditingEntryId(entryId);
    setEditingEntryAmount(String(Math.abs(amount)));
  };

  const cancelEditEntry = () => {
    setEditingEntryId(null);
    setEditingEntryAmount('');
  };

  const handleSaveEntry = (entryId: string) => {
    const amount = parseFloat(editingEntryAmount);
    if (!amount || amount <= 0) {
      toast.error('Informe um valor válido');
      return;
    }
    updateEntry.mutate(
      { entryId, amount },
      {
        onSuccess: () => {
          toast.success('Lançamento atualizado');
          cancelEditEntry();
        },
        onError: (error) =>
          toast.error(errorMessage(error, 'Falha ao atualizar lançamento')),
      },
    );
  };

  const handleDeleteEntry = (entryId: string, label: string) => {
    const ok = window.confirm(`Remover este ${label.toLowerCase()}? O saldo será recalculado.`);
    if (!ok) return;
    deleteEntry.mutate(entryId, {
      onSuccess: () => toast.success('Lançamento removido'),
      onError: (error) =>
        toast.error(errorMessage(error, 'Falha ao remover lançamento')),
    });
  };

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader
        title="Banca"
        subtitle="Períodos reais (Bet365) · correlacione com bilhetes de estudo e do sistema"
      />

      <div className="flex-1 space-y-6 p-6">
        <Card className="border-border/60 bg-card/80">
          <CardContent className="flex flex-wrap items-end gap-3 p-4">
            <div className="min-w-[220px] flex-1 space-y-1">
              <label className="text-xs text-muted-foreground">Banca</label>
              <Select
                value={periodId ?? undefined}
                onValueChange={(id) => {
                  setSelectedPeriodId(id);
                  setPanel('none');
                }}
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
              {selectedPeriod && (
                <Button variant="outline" onClick={openEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              )}
              {isOpen && (
                <Button
                  variant="outline"
                  onClick={handleClosePeriod}
                  disabled={closePeriod.isPending}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Fechar
                </Button>
              )}
              <Button onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Nova
              </Button>
            </div>
          </CardContent>

          {panel !== 'none' && (
            <CardContent className="border-t border-border/40 pt-4">
              {panel === 'create' && openPeriod ? (
                <p className="text-sm text-muted-foreground">
                  Já existe a banca aberta <strong>{openPeriod.name}</strong>.
                  Feche-a antes de abrir um novo período — ou edite a atual.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs text-muted-foreground">Nome</label>
                    <Input
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Ex: Bet365 — Julho/2026"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">
                      Início do período
                    </label>
                    <Input
                      type="date"
                      value={formStartsAt}
                      onChange={(e) => setFormStartsAt(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">
                      Fim do período
                    </label>
                    <Input
                      type="date"
                      value={formEndsAt}
                      onChange={(e) => setFormEndsAt(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">
                      Valor inicial (R$)
                    </label>
                    <Input
                      type="number"
                      min={panel === 'edit' ? 0 : 1}
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                    <label className="text-xs text-muted-foreground">
                      Notas (opcional)
                    </label>
                    <Input
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder="Ex: banca alinhada ao histórico Bet365 de julho"
                    />
                  </div>
                  <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
                    <Button
                      onClick={
                        panel === 'create'
                          ? handleCreatePeriod
                          : handleUpdatePeriod
                      }
                      disabled={
                        createPeriod.isPending || updatePeriod.isPending
                      }
                    >
                      {(createPeriod.isPending || updatePeriod.isPending) && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {panel === 'create' ? 'Criar banca' : 'Salvar alterações'}
                    </Button>
                    <Button variant="outline" onClick={() => setPanel('none')}>
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
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
                <div>
                  <CardTitle className="text-base">
                    Bilhetes da banca
                  </CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Vincule bilhetes Bet365 (estudo) ou do sistema a esta banca.
                    Candidatos vêm do intervalo de datas — ajuste em{' '}
                    <strong>Editar banca</strong>.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {isOpen && (
                    <Button
                      size="sm"
                      disabled={
                        linkTickets.isPending ||
                        (!selectedStudyIds.length &&
                          !selectedSystemIds.length)
                      }
                      onClick={handleLinkSelected}
                    >
                      {linkTickets.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Vincular selecionados (
                      {selectedStudyIds.length + selectedSystemIds.length})
                    </Button>
                  )}
                  <Button asChild variant="outline" size="sm">
                    <Link href="/tickets">Abrir bilhetes</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingCorrelated ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : !correlated ? (
                  <p className="text-sm text-muted-foreground">
                    Sem dados de bilhetes.
                  </p>
                ) : (
                  <>
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-lg border border-border/40 bg-secondary/15 p-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">
                            Vinculados · Bet365
                          </p>
                          <Badge variant="outline">
                            {correlated.study.count}
                          </Badge>
                        </div>
                        {!correlated.study.tickets.length ? (
                          <p className="text-xs text-muted-foreground">
                            Nenhum bilhete de estudo vinculado.
                          </p>
                        ) : (
                          <ul className="max-h-40 space-y-2 overflow-y-auto text-xs">
                            {correlated.study.tickets.map((t) => (
                              <li
                                key={t.id}
                                className="flex items-start justify-between gap-2 border-b border-border/30 pb-2 last:border-0"
                              >
                                <div className="min-w-0">
                                  <p className="truncate font-medium">
                                    {t.betLabel ?? t.betType ?? 'Bilhete'}
                                  </p>
                                  <p className="text-muted-foreground">
                                    {formatDate(t.placedAt)} ·{' '}
                                    {formatCurrency(t.stake)}
                                  </p>
                                </div>
                                {isOpen && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 px-2 text-xs"
                                    disabled={unlinkTickets.isPending}
                                    onClick={() => handleUnlinkStudy(t.id)}
                                  >
                                    Remover
                                  </Button>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="rounded-lg border border-border/40 bg-secondary/15 p-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">
                            Vinculados · Sistema
                          </p>
                          <Badge variant="outline">
                            {correlated.system.count}
                          </Badge>
                        </div>
                        {!correlated.system.tickets.length ? (
                          <p className="text-xs text-muted-foreground">
                            Nenhum bilhete do sistema vinculado.
                          </p>
                        ) : (
                          <ul className="max-h-40 space-y-2 overflow-y-auto text-xs">
                            {correlated.system.tickets.map((t) => (
                              <li
                                key={t.id}
                                className="flex items-start justify-between gap-2 border-b border-border/30 pb-2 last:border-0"
                              >
                                <div className="min-w-0">
                                  <p className="truncate font-medium">
                                    {t.name ?? 'Bilhete'}
                                  </p>
                                  <p className="text-muted-foreground">
                                    {formatDate(t.createdAt)} ·{' '}
                                    {t.stake != null
                                      ? formatCurrency(t.stake)
                                      : '—'}
                                  </p>
                                </div>
                                {isOpen && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 px-2 text-xs"
                                    disabled={unlinkTickets.isPending}
                                    onClick={() => handleUnlinkSystem(t.id)}
                                  >
                                    Remover
                                  </Button>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    {isOpen && (
                      <div className="grid gap-4 lg:grid-cols-2">
                        <div className="rounded-lg border border-dashed border-border/50 p-3">
                          <p className="mb-2 text-sm font-medium">
                            Selecionar · Bet365 (candidatos)
                          </p>
                          {!correlated.candidates?.study.tickets.length ? (
                            <p className="text-xs text-muted-foreground">
                              Nenhum candidato no intervalo da banca.
                            </p>
                          ) : (
                            <ul className="max-h-52 space-y-2 overflow-y-auto text-xs">
                              {correlated.candidates.study.tickets.map((t) => (
                                <li key={t.id}>
                                  <label className="flex cursor-pointer items-start gap-2 rounded-md px-1 py-1 hover:bg-secondary/30">
                                    <input
                                      type="checkbox"
                                      className="mt-1"
                                      checked={selectedStudyIds.includes(t.id)}
                                      onChange={() =>
                                        toggleId(
                                          t.id,
                                          selectedStudyIds,
                                          setSelectedStudyIds,
                                        )
                                      }
                                    />
                                    <span className="min-w-0 flex-1">
                                      <span className="block truncate font-medium">
                                        {t.betLabel ?? t.betType ?? 'Bilhete'}
                                      </span>
                                      <span className="text-muted-foreground">
                                        {formatDate(t.placedAt)} ·{' '}
                                        {formatCurrency(t.stake)} · {t.status}
                                      </span>
                                    </span>
                                  </label>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        <div className="rounded-lg border border-dashed border-border/50 p-3">
                          <p className="mb-2 text-sm font-medium">
                            Selecionar · Sistema (candidatos)
                          </p>
                          {!correlated.candidates?.system.tickets.length ? (
                            <p className="text-xs text-muted-foreground">
                              Nenhum candidato no intervalo da banca.
                            </p>
                          ) : (
                            <ul className="max-h-52 space-y-2 overflow-y-auto text-xs">
                              {correlated.candidates.system.tickets.map(
                                (t) => (
                                  <li key={t.id}>
                                    <label className="flex cursor-pointer items-start gap-2 rounded-md px-1 py-1 hover:bg-secondary/30">
                                      <input
                                        type="checkbox"
                                        className="mt-1"
                                        checked={selectedSystemIds.includes(
                                          t.id,
                                        )}
                                        onChange={() =>
                                          toggleId(
                                            t.id,
                                            selectedSystemIds,
                                            setSelectedSystemIds,
                                          )
                                        }
                                      />
                                      <span className="min-w-0 flex-1">
                                        <span className="block truncate font-medium">
                                          {t.name ?? 'Bilhete'}
                                        </span>
                                        <span className="text-muted-foreground">
                                          {formatDate(t.createdAt)} ·{' '}
                                          {t.stake != null
                                            ? formatCurrency(t.stake)
                                            : '—'}{' '}
                                          · {t.status}
                                        </span>
                                      </span>
                                    </label>
                                  </li>
                                ),
                              )}
                            </ul>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

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
                        {isOpen && <TableHead className="w-[120px]" />}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entries.map((entry) => {
                        const canEdit = isOpen && isManualCashEntry(entry.type);
                        const isEditing = editingEntryId === entry.id;
                        const typeLabel =
                          ENTRY_TYPE_LABELS[entry.type] ?? entry.type;

                        return (
                          <TableRow key={entry.id}>
                            <TableCell className="text-muted-foreground">
                              {new Date(entry.createdAt).toLocaleString('pt-BR')}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{typeLabel}</Badge>
                            </TableCell>
                            <TableCell>{entry.description ?? '—'}</TableCell>
                            <TableCell
                              className={`text-right font-mono font-semibold ${
                                entry.amount >= 0
                                  ? 'text-emerald-400'
                                  : 'text-red-400'
                              }`}
                            >
                              {isEditing ? (
                                <Input
                                  type="number"
                                  min={0.01}
                                  step="0.01"
                                  className="ml-auto h-8 w-28 text-right"
                                  value={editingEntryAmount}
                                  onChange={(e) =>
                                    setEditingEntryAmount(e.target.value)
                                  }
                                  autoFocus
                                />
                              ) : (
                                <>
                                  {entry.amount >= 0 ? '+' : ''}
                                  {formatCurrency(entry.amount)}
                                </>
                              )}
                            </TableCell>
                            {isOpen && (
                              <TableCell className="text-right">
                                {canEdit ? (
                                  isEditing ? (
                                    <div className="flex justify-end gap-1">
                                      <Button
                                        size="sm"
                                        variant="default"
                                        className="h-8 px-2"
                                        disabled={updateEntry.isPending}
                                        onClick={() => handleSaveEntry(entry.id)}
                                      >
                                        Salvar
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 px-2"
                                        onClick={cancelEditEntry}
                                      >
                                        Cancelar
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="flex justify-end gap-1">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8"
                                        title="Editar"
                                        onClick={() =>
                                          startEditEntry(entry.id, entry.amount)
                                        }
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-red-400 hover:text-red-300"
                                        title="Remover"
                                        disabled={deleteEntry.isPending}
                                        onClick={() =>
                                          handleDeleteEntry(entry.id, typeLabel)
                                        }
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  )
                                ) : null}
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
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
