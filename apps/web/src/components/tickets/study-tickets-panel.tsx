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
  DEFAULT_PAGE_SIZE,
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

/** Aceita digitação parcial ("1.", "1,3") sem perder o separador decimal. */
function isDecimalTyping(value: string) {
  return value === '' || /^\d*[.,]?\d*$/.test(value);
}

function parseDecimalInput(value: string): number | null {
  const normalized = value.trim().replace(',', '.');
  if (!normalized || normalized === '.') return null;
  // "1." ainda incompleto — usa a parte inteira só para cálculo ao vivo
  const n = Number(
    normalized.endsWith('.') ? normalized.slice(0, -1) : normalized,
  );
  return Number.isFinite(n) ? n : null;
}

function oddToInputString(value: number | null | undefined) {
  if (value == null) return '';
  return String(value);
}

function effectiveLegOdd(leg: {
  odd: number | null;
  boostedOdd: number | null;
}): number | null {
  const v = leg.boostedOdd ?? leg.odd;
  // Ignora placeholder 1.00 do PDF Bet365
  return v != null && v > 1.001 ? v : null;
}

/**
 * Odd combinada a partir das pernas:
 * - Em "Criar Aposta", várias pernas compartilham builderGroup e a odd
 *   costuma estar só em uma delas → usa 1 odd por grupo.
 * - Pernas sem grupo entram individualmente.
 * - Produto de todas as odds efetivas encontradas (parcial ok).
 */
function computeCombinedOddFromLegs(
  legs: {
    odd: number | null;
    boostedOdd: number | null;
    builderGroup?: number | null;
  }[],
): number | null {
  if (!legs.length) return null;

  const byGroup = new Map<string, number | null>();
  for (let i = 0; i < legs.length; i++) {
    const leg = legs[i];
    const key =
      leg.builderGroup != null ? `g-${leg.builderGroup}` : `solo-${i}`;
    const odd = effectiveLegOdd(leg);
    const prev = byGroup.get(key) ?? null;
    // Mantém a maior odd do grupo (ou a primeira válida)
    if (odd != null && (prev == null || odd > prev)) {
      byGroup.set(key, odd);
    } else if (!byGroup.has(key)) {
      byGroup.set(key, null);
    }
  }

  const odds = [...byGroup.values()].filter((o): o is number => o != null);
  if (!odds.length) return null;
  return Number(odds.reduce((acc, o) => acc * o, 1).toFixed(4));
}

type EditableLeg = StudyTicketLeg & {
  oddStr: string;
  boostedOddStr: string;
};

function toEditableLegs(legs: StudyTicketLeg[]): EditableLeg[] {
  return legs.map((l) => ({
    ...l,
    oddStr: oddToInputString(l.odd),
    boostedOddStr: oddToInputString(l.boostedOdd),
  }));
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
  const [stake, setStake] = useState(
    ticket.stake != null ? String(ticket.stake) : '',
  );
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
  const [legs, setLegs] = useState(() => toEditableLegs(ticket.legs));
  /** false = recalcula a partir das pernas / stake */
  const [combinedOddManual, setCombinedOddManual] = useState(false);
  const [potentialReturnManual, setPotentialReturnManual] = useState(false);

  const autoCombined = useMemo(
    () => computeCombinedOddFromLegs(legs),
    [legs],
  );

  useEffect(() => {
    if (combinedOddManual) return;
    if (autoCombined != null) {
      setCombinedOdd(String(autoCombined));
    } else {
      setCombinedOdd('');
    }
  }, [autoCombined, combinedOddManual]);

  useEffect(() => {
    if (potentialReturnManual) return;
    const stakeN = parseDecimalInput(stake);
    const oddN =
      parseDecimalInput(combinedOdd) ??
      (combinedOddManual ? null : autoCombined);
    if (stakeN != null && oddN != null && stakeN > 0 && oddN > 0) {
      setPotentialReturn((stakeN * oddN).toFixed(2));
    } else if (!potentialReturnManual) {
      setPotentialReturn('');
    }
  }, [
    stake,
    combinedOdd,
    autoCombined,
    combinedOddManual,
    potentialReturnManual,
  ]);

  const save = () => {
    const stakeNum = parseDecimalInput(stake);
    if (stakeNum == null || stakeNum < 0) {
      toast.error('Stake inválida');
      return;
    }
    const oddNum = parseDecimalInput(combinedOdd);
    update.mutate(
      {
        id: ticket.id,
        stake: stakeNum,
        combinedOdd: oddNum,
        actualReturn: parseDecimalInput(actualReturn),
        potentialReturn: parseDecimalInput(potentialReturn),
        cashOutValue: parseDecimalInput(cashOutValue),
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
          odd: parseDecimalInput(l.oddStr),
          boostedOdd: parseDecimalInput(l.boostedOddStr),
          status: l.status,
          progressValue: l.progressValue,
          progressLine: l.progressLine,
        })),
      },
      {
        onSuccess: (saved) => {
          const jsonHint =
            saved &&
            typeof saved === 'object' &&
            'jsonPath' in saved &&
            typeof (saved as { jsonPath?: string }).jsonPath === 'string'
              ? ` · JSON: ${(saved as { jsonPath: string }).jsonPath}`
              : '';
          toast.success(`Bilhete atualizado${jsonHint}`);
          onClose();
        },
        onError: () => toast.error('Falha ao salvar'),
      },
    );
  };

  const updateLegOddStr = (
    id: string,
    field: 'oddStr' | 'boostedOddStr',
    value: string,
  ) => {
    if (!isDecimalTyping(value)) return;
    setCombinedOddManual(false);
    setPotentialReturnManual(false);
    setLegs((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const numField = field === 'oddStr' ? 'odd' : 'boostedOdd';
        return {
          ...l,
          [field]: value,
          [numField]: parseDecimalInput(value),
        };
      }),
    );
  };

  const onStakeChange = (value: string) => {
    if (!isDecimalTyping(value)) return;
    setPotentialReturnManual(false);
    setStake(value);
  };

  const onCombinedOddChange = (value: string) => {
    if (!isDecimalTyping(value)) return;
    setCombinedOddManual(true);
    setPotentialReturnManual(false);
    setCombinedOdd(value);
  };

  const onPotentialReturnChange = (value: string) => {
    if (!isDecimalTyping(value)) return;
    setPotentialReturnManual(true);
    setPotentialReturn(value);
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
            <Input
              inputMode="decimal"
              value={stake}
              onChange={(e) => onStakeChange(e.target.value)}
            />
          </label>
          <label className="space-y-1 text-xs">
            <span className="text-muted-foreground">
              Odd combinada
              {!combinedOddManual && autoCombined != null ? (
                <span className="ml-1 font-normal opacity-70">
                  (auto · {autoCombined.toFixed(2)})
                </span>
              ) : null}
            </span>
            <Input
              inputMode="decimal"
              value={combinedOdd}
              onChange={(e) => onCombinedOddChange(e.target.value)}
              placeholder="Produto das pernas"
            />
          </label>
          <label className="space-y-1 text-xs">
            <span className="text-muted-foreground">
              Retorno potencial
              {!potentialReturnManual ? (
                <span className="ml-1 font-normal opacity-70">
                  (stake × odd)
                </span>
              ) : null}
            </span>
            <Input
              inputMode="decimal"
              value={potentialReturn}
              onChange={(e) => onPotentialReturnChange(e.target.value)}
            />
          </label>
          <label className="space-y-1 text-xs">
            <span className="text-muted-foreground">Retorno obtido</span>
            <Input
              inputMode="decimal"
              value={actualReturn}
              onChange={(e) => {
                const v = e.target.value;
                if (!isDecimalTyping(v)) return;
                setActualReturn(v);
              }}
            />
          </label>
          <label className="space-y-1 text-xs">
            <span className="text-muted-foreground">Cash out (valor)</span>
            <Input
              inputMode="decimal"
              value={cashOutValue}
              onChange={(e) => {
                const v = e.target.value;
                if (!isDecimalTyping(v)) return;
                setCashOutValue(v);
              }}
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
            Odds por perna (editáveis — use ponto ou vírgula, ex.: 1.33)
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
                inputMode="decimal"
                value={leg.oddStr}
                onChange={(e) =>
                  updateLegOddStr(leg.id, 'oddStr', e.target.value)
                }
                placeholder="Odd"
              />
              <Input
                className="h-8 font-mono text-xs"
                inputMode="decimal"
                value={leg.boostedOddStr}
                onChange={(e) =>
                  updateLegOddStr(leg.id, 'boostedOddStr', e.target.value)
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
  const [pageSize, setPageSize] = useState<PageSize>(DEFAULT_PAGE_SIZE);

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
