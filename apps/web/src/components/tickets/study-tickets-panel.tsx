'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Loader2,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ListPagination,
  type PageSize,
} from '@/components/ui/list-pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useDeleteStudyTicket,
  useStudyTickets,
  useUpdateStudyTicket,
} from '@/hooks/use-study-tickets';
import {
  STUDY_STATUS_LABELS,
  type StudyTicket,
  type StudyTicketLeg,
  type StudyTicketStatus,
} from '@/types/study-ticket';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

function formatCurrency(value: number | null | undefined) {
  if (value == null) return '—';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatOdd(value: number | null | undefined) {
  if (value == null) return '—';
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

function statusBadge(status: StudyTicketStatus) {
  switch (status) {
    case 'PENDING':
      return <Badge variant="secondary">Pendente</Badge>;
    case 'VOID':
      return <Badge variant="outline">Anulado</Badge>;
    default:
      return <Badge variant="outline">—</Badge>;
  }
}

function LegStatusIcon({ status }: { status: StudyTicketStatus | null }) {
  if (status === 'WON') {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
        <Check className="h-3 w-3" />
      </span>
    );
  }
  if (status === 'LOST') {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 text-red-400">
        <X className="h-3 w-3" />
      </span>
    );
  }
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border/60 text-[10px] text-muted-foreground">
      ·
    </span>
  );
}

function ProgressBar({
  value,
  line,
  won,
}: {
  value: number | null;
  line: number | null;
  won: boolean;
}) {
  if (value == null) return null;
  const max = Math.max(line ?? value, value, 1) * 1.2;
  const pct = Math.min(100, (value / max) * 100);
  const linePct = line != null ? Math.min(100, (line / max) * 100) : null;

  return (
    <div className="relative mt-1.5 h-1.5 w-full max-w-[180px] rounded-full bg-secondary/80">
      <div
        className={cn(
          'absolute inset-y-0 left-0 rounded-full',
          won ? 'bg-emerald-400' : 'bg-red-400/70',
        )}
        style={{ width: `${pct}%` }}
      />
      {linePct != null && (
        <div
          className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 bg-foreground/50"
          style={{ left: `${linePct}%` }}
        />
      )}
      <span
        className={cn(
          'absolute -top-5 rounded px-1 text-[10px] font-mono',
          won ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300',
        )}
        style={{ left: `calc(${pct}% - 8px)` }}
      >
        {value}
      </span>
    </div>
  );
}

function StudyTicketCard({
  ticket,
  onEdit,
  defaultOpen = false,
}: {
  ticket: StudyTicket;
  onEdit: (t: StudyTicket) => void;
  defaultOpen?: boolean;
}) {
  const deleteTicket = useDeleteStudyTicket();
  const [open, setOpen] = useState(defaultOpen);
  const matchLabels = ticket.legs
    .map((l) => l.matchLabel)
    .filter((v, i, a) => v && a.indexOf(v) === i);
  return (
    <div className="overflow-hidden rounded-xl border border-border/50 bg-[#1c1c1e] shadow-sm">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-white/[0.02]"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="flex min-w-0 items-start gap-2">
          {open ? (
            <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-emerald-400">
              {formatCurrency(ticket.stake)}{' '}
              <span className="text-emerald-400/90">
                {ticket.betType ?? ticket.betLabel ?? 'Aposta'}
              </span>
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {formatDateTime(ticket.placedAt)}
              {matchLabels.length
                ? ` · ${matchLabels.slice(0, 2).join(' · ')}${matchLabels.length > 2 ? ` +${matchLabels.length - 2}` : ''}`
                : ''}
            </p>
            <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
              {ticket.legs.length} perna{ticket.legs.length === 1 ? '' : 's'} · @
              {formatOdd(ticket.combinedOdd)}
              {ticket.hasOddsBoost ? ' ↑' : ''}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {ticket.status === 'WON' ? (
            <div className="text-right">
              <p className="font-mono text-sm font-semibold text-emerald-400">
                {formatCurrency(ticket.actualReturn)}
              </p>
              <p className="text-[10px] text-emerald-400/70">Green</p>
            </div>
          ) : ticket.status === 'CASHED_OUT' ? (
            <div className="text-right">
              <p className="font-mono text-sm font-semibold text-amber-400">
                {formatCurrency(ticket.cashOutValue ?? ticket.actualReturn)}
              </p>
              <p className="text-[10px] text-amber-400">Cash Out</p>
            </div>
          ) : ticket.status === 'LOST' ? (
            <p className="text-sm font-semibold uppercase tracking-wide text-red-500">
              RED
            </p>
          ) : (
            statusBadge(ticket.status)
          )}
        </div>
      </button>

      {open && (
        <>
          <div className="space-y-0 border-t border-border/40 px-2 py-2">
            <div className="mb-1 flex items-center justify-between px-2 text-[11px] text-muted-foreground">
              <span>{ticket.bet365Ref ?? '—'}</span>
              <span className="font-mono">
                @{formatOdd(ticket.combinedOdd)}
                {ticket.hasOddsBoost ? ' ↑' : ''}
              </span>
            </div>

            {ticket.legs.length === 0 ? (
              <p className="px-2 py-3 text-xs text-muted-foreground">
                Nenhuma perna extraída — edite o bilhete.
              </p>
            ) : (
              ticket.legs.map((leg) => <LegRow key={leg.id} leg={leg} />)
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 px-4 py-2.5 text-xs">
            <div className="flex flex-wrap gap-3 text-muted-foreground">
              <span>Aposta {formatCurrency(ticket.stake)}</span>
              <span>Potencial {formatCurrency(ticket.potentialReturn)}</span>
              <span>
                Retorno{' '}
                <span
                  className={cn(
                    'font-medium',
                    (ticket.actualReturn ?? 0) > 0
                      ? 'text-emerald-400'
                      : 'text-foreground/70',
                  )}
                >
                  {formatCurrency(ticket.actualReturn)}
                </span>
              </span>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(ticket);
                }}
              >
                <Pencil className="mr-1 h-3.5 w-3.5" />
                Editar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-red-400"
                disabled={deleteTicket.isPending}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTicket.mutate(ticket.id, {
                    onSuccess: () => toast.success('Bilhete removido'),
                    onError: () => toast.error('Falha ao remover'),
                  });
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function LegRow({ leg }: { leg: StudyTicketLeg }) {
  const displayOdd = leg.boostedOdd ?? leg.odd;
  const won = leg.status === 'WON';

  return (
    <div className="flex items-start gap-2 rounded-lg px-2 py-2 hover:bg-white/[0.03]">
      <LegStatusIcon status={leg.status} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground/95">{leg.selection}</p>
        <p className="text-[11px] text-muted-foreground">
          {leg.market}
          {leg.matchLabel ? ` · ${leg.matchLabel}` : ''}
          {leg.matchDate ? ` · ${leg.matchDate}` : ''}
        </p>
        {leg.period && (
          <span className="mt-1 inline-block rounded border border-border/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {leg.period}
          </span>
        )}
        <ProgressBar
          value={leg.progressValue}
          line={leg.progressLine}
          won={won}
        />
      </div>
      <div className="shrink-0 text-right">
        {leg.boostedOdd != null && leg.odd != null && leg.boostedOdd !== leg.odd ? (
          <div className="font-mono text-xs">
            <span className="text-muted-foreground line-through">
              {formatOdd(leg.odd)}
            </span>
            <span className="ml-1 font-semibold text-emerald-400">
              {formatOdd(leg.boostedOdd)}
            </span>
          </div>
        ) : (
          <span className="font-mono text-xs font-semibold">
            {formatOdd(displayOdd)}
          </span>
        )}
      </div>
    </div>
  );
}

function EditStudyTicketDialog({
  ticket,
  onClose,
}: {
  ticket: StudyTicket;
  onClose: () => void;
}) {
  const update = useUpdateStudyTicket();
  const [stake, setStake] = useState(String(ticket.stake));
  const [combinedOdd, setCombinedOdd] = useState(
    ticket.combinedOdd != null ? String(ticket.combinedOdd) : '',
  );
  const [actualReturn, setActualReturn] = useState(
    ticket.actualReturn != null ? String(ticket.actualReturn) : '',
  );
  const [potentialReturn, setPotentialReturn] = useState(
    ticket.potentialReturn != null ? String(ticket.potentialReturn) : '',
  );
  const [cashOutValue, setCashOutValue] = useState(
    ticket.cashOutValue != null ? String(ticket.cashOutValue) : '',
  );
  const [status, setStatus] = useState<StudyTicketStatus>(ticket.status);
  const [notes, setNotes] = useState(ticket.notes ?? '');
  const [legs, setLegs] = useState(ticket.legs);

  const save = () => {
    const oddNum = combinedOdd ? Number(combinedOdd.replace(',', '.')) : null;
    update.mutate(
      {
        id: ticket.id,
        stake: Number(stake.replace(',', '.')),
        combinedOdd: oddNum,
        actualReturn: actualReturn
          ? Number(actualReturn.replace(',', '.'))
          : null,
        potentialReturn: potentialReturn
          ? Number(potentialReturn.replace(',', '.'))
          : null,
        cashOutValue: cashOutValue
          ? Number(cashOutValue.replace(',', '.'))
          : null,
        status,
        notes: notes || null,
        legs: legs.map((l, i) => ({
          sortOrder: i,
          builderGroup: l.builderGroup,
          matchLabel: l.matchLabel,
          matchDate: l.matchDate,
          market: l.market,
          selection: l.selection,
          period: l.period,
          odd: l.odd,
          boostedOdd: l.boostedOdd,
          status: l.status,
          progressValue: l.progressValue,
          progressLine: l.progressLine,
        })),
      },
      {
        onSuccess: () => {
          toast.success('Bilhete atualizado');
          onClose();
        },
        onError: () => toast.error('Falha ao salvar'),
      },
    );
  };

  const updateLegOdd = (
    id: string,
    field: 'odd' | 'boostedOdd',
    value: string,
  ) => {
    setLegs((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              [field]: value ? Number(value.replace(',', '.')) : null,
            }
          : l,
      ),
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">Editar bilhete de estudo</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-xs">
            <span className="text-muted-foreground">Stake</span>
            <Input value={stake} onChange={(e) => setStake(e.target.value)} />
          </label>
          <label className="space-y-1 text-xs">
            <span className="text-muted-foreground">Odd combinada</span>
            <Input
              value={combinedOdd}
              onChange={(e) => setCombinedOdd(e.target.value)}
              placeholder="Corrigir se veio 1,00"
            />
          </label>
          <label className="space-y-1 text-xs">
            <span className="text-muted-foreground">Retorno potencial</span>
            <Input
              value={potentialReturn}
              onChange={(e) => setPotentialReturn(e.target.value)}
            />
          </label>
          <label className="space-y-1 text-xs">
            <span className="text-muted-foreground">Retorno obtido</span>
            <Input
              value={actualReturn}
              onChange={(e) => setActualReturn(e.target.value)}
            />
          </label>
          <label className="space-y-1 text-xs">
            <span className="text-muted-foreground">Cash out (valor)</span>
            <Input
              value={cashOutValue}
              onChange={(e) => setCashOutValue(e.target.value)}
            />
          </label>
          <div className="space-y-1 text-xs">
            <span className="text-muted-foreground">Status</span>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as StudyTicketStatus)}
            >
              <SelectTrigger className="h-9 w-full bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(STUDY_STATUS_LABELS) as StudyTicketStatus[]).map(
                  (s) => (
                    <SelectItem key={s} value={s}>
                      {STUDY_STATUS_LABELS[s]}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Odds por perna (editáveis)
          </p>
          {legs.map((leg) => (
            <div
              key={leg.id}
              className="grid gap-2 rounded-lg border border-border/40 p-2 sm:grid-cols-[1fr_80px_80px]"
            >
              <div className="min-w-0">
                <p className="truncate text-sm">{leg.selection}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {leg.matchLabel}
                </p>
              </div>
              <Input
                className="h-8 font-mono text-xs"
                value={leg.odd ?? ''}
                onChange={(e) => updateLegOdd(leg.id, 'odd', e.target.value)}
                placeholder="Odd"
              />
              <Input
                className="h-8 font-mono text-xs"
                value={leg.boostedOdd ?? ''}
                onChange={(e) =>
                  updateLegOdd(leg.id, 'boostedOdd', e.target.value)
                }
                placeholder="Boost"
              />
            </div>
          ))}
        </div>

        <label className="mt-4 block space-y-1 text-xs">
          <span className="text-muted-foreground">Notas (IA / estudo)</span>
          <textarea
            className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={update.isPending} onClick={save}>
            {update.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}

export function StudyTicketsPanel() {
  const { data: tickets, isLoading } = useStudyTickets();
  const [editing, setEditing] = useState<StudyTicket | null>(null);
  const [year, setYear] = useState<string>('');
  const [month, setMonth] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandAllTickets, setExpandAllTickets] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(15);

  const availableYears = useMemo(() => {
    const set = new Set<number>();
    for (const t of tickets ?? []) set.add(new Date(t.placedAt).getFullYear());
    return [...set].sort((a, b) => b - a);
  }, [tickets]);

  const filtersReady = Boolean(year || dateFrom || dateTo);

  const filtered = useMemo(() => {
    if (!filtersReady) return [];

    return (tickets ?? []).filter((t) => {
      const d = new Date(t.placedAt);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      if (year && y !== Number(year)) return false;
      if (month !== 'all' && m !== Number(month)) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;

      const localDay = [
        y,
        String(m).padStart(2, '0'),
        String(d.getDate()).padStart(2, '0'),
      ].join('-');
      if (dateFrom && localDay < dateFrom) return false;
      if (dateTo && localDay > dateTo) return false;
      return true;
    });
  }, [tickets, year, month, dateFrom, dateTo, statusFilter, filtersReady]);

  const sorted = useMemo(
    () =>
      [...filtered].sort(
        (a, b) =>
          new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime(),
      ),
    [filtered],
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [year, month, dateFrom, dateTo, statusFilter, pageSize, filtersReady]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const clearFilters = () => {
    setYear('');
    setMonth('all');
    setDateFrom('');
    setDateTo('');
    setStatusFilter('all');
    setExpandAllTickets(false);
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!tickets?.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhum bilhete Bet365 importado ainda.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/50 bg-secondary/20 p-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="space-y-1 text-xs">
            <span className="text-muted-foreground">Ano</span>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                setMonth('all');
              }}
            >
              <option value="">Selecione</option>
              {availableYears.map((y) => (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs">
            <span className="text-muted-foreground">Mês</span>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              disabled={!year}
            >
              <option value="all">Todos</option>
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={String(idx + 1)}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs">
            <span className="text-muted-foreground">De</span>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-9"
            />
          </label>

          <label className="space-y-1 text-xs">
            <span className="text-muted-foreground">Até</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-9"
            />
          </label>

          <label className="space-y-1 text-xs">
            <span className="text-muted-foreground">Status</span>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              disabled={!filtersReady}
            >
              <option value="all">Todos</option>
              {(Object.keys(STUDY_STATUS_LABELS) as StudyTicketStatus[]).map(
                (s) => (
                  <option key={s} value={s}>
                    {STUDY_STATUS_LABELS[s]}
                  </option>
                ),
              )}
            </select>
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {!filtersReady
              ? 'Selecione um ano ou um intervalo de datas para carregar os bilhetes.'
              : (
                <>
                  Exibindo{' '}
                  <span className="font-medium text-foreground">
                    {sorted.length}
                  </span>{' '}
                  bilhete{sorted.length === 1 ? '' : 's'}
                </>
              )}
          </p>
          <div className="flex flex-wrap gap-2">
            {filtersReady && sorted.length > 0 && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8"
                onClick={() => setExpandAllTickets((v) => !v)}
              >
                {expandAllTickets ? 'Recolher bilhetes' : 'Expandir bilhetes'}
              </Button>
            )}
            {filtersReady && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8"
                onClick={clearFilters}
              >
                Limpar filtros
              </Button>
            )}
          </div>
        </div>
      </div>

      {!filtersReady ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Preencha <strong className="text-foreground">Ano</strong> e/ou as
          datas <strong className="text-foreground">De / Até</strong> para
          listar os bilhetes.
        </p>
      ) : sorted.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nenhum bilhete neste filtro.
        </p>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2">
            {paged.map((ticket) => (
              <StudyTicketCard
                key={`${ticket.id}-${expandAllTickets ? 'open' : 'closed'}`}
                ticket={ticket}
                onEdit={setEditing}
                defaultOpen={expandAllTickets}
              />
            ))}
          </div>
          <ListPagination
            page={page}
            pageSize={pageSize}
            total={sorted.length}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            itemLabel="bilhetes"
          />
        </div>
      )}

      {editing && (
        <EditStudyTicketDialog
          ticket={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
