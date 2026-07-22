"use client";

import Link from "next/link";
import { AlertTriangle, Loader2, Plus, Ticket, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useDeleteTicket,
  useSaveTicket,
  useTicketCalculation,
  useTickets,
} from "@/hooks/use-tickets";
import { usePlaceTicket, useSettleTicket } from "@/hooks/use-bankroll";
import { formatStudyTicketCode } from "@/lib/study-ticket-code";
import { useTicketDraftStore } from "@/stores/ticket-draft.store";
import { TICKET_STATUS_LABELS } from "@/types/ticket";
import { isAxiosError } from "axios";
import { toast } from "sonner";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatPct(value: number | null) {
  if (value == null) return "—";
  return `${(value * 100).toFixed(1)}%`;
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function TicketBuilder() {
  const {
    selections,
    stake,
    setStake,
    removeSelection,
    updateSelectionOdd,
    clear,
  } = useTicketDraftStore();
  const { data: calc, isLoading: calculating } = useTicketCalculation(
    selections,
    stake,
  );
  const saveTicket = useSaveTicket();

  const handleSave = () => {
    if (!selections.length) {
      toast.error("Adicione seleções ao bilhete");
      return;
    }
    if (calc && !calc.valid) {
      toast.error("Corrija os conflitos de correlação antes de salvar");
      return;
    }

    const code = formatStudyTicketCode();

    saveTicket.mutate(
      { name: code, stake, selections },
      {
        onSuccess: (ticket) => {
          const studyJson =
            (ticket as { studyJson?: unknown }).studyJson ?? null;
          if (studyJson) {
            downloadJson(`${code}.json`, studyJson);
          }
          toast.success(`Bilhete salvo: ${code}`);
          clear();
        },
        onError: (error) => {
          const message = isAxiosError(error)
            ? ((error.response?.data as { message?: string })?.message ??
              error.message)
            : "Erro ao salvar";
          toast.error(message);
        },
      },
    );
  };

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          <div className="flex items-center gap-2">
            <Ticket className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium uppercase">Montar bilhete</span>
          </div>
          <div className="flex justify-center gap-2">
            <Button
              className="uppercase text-xs tracking-widest"
              disabled={
                !selections.length ||
                saveTicket.isPending ||
                (calc != null && !calc.valid)
              }
              onClick={handleSave}
            >
              {saveTicket.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Salvar
            </Button>
            {selections.length > 0 && (
              <Button
                variant="outline"
                onClick={clear}
                className="uppercase text-xs tracking-widest"
              >
                Limpar
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {selections.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma seleção. Execute uma análise e clique em{" "}
              <Plus className="inline h-3.5 w-3.5" /> para adicionar mercados.
            </p>
            <Button className="mt-4" variant="outline" asChild>
              <Link href="/analyzer">Ir para Estatísticas</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {selections.map((sel, index) => (
              <div
                key={`${sel.matchId}-${sel.selection}`}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-border/40 bg-secondary/20 px-3 py-2"
              >
                <div className="min-w-0 flex-1 basis-[180px]">
                  <p className="truncate text-sm font-medium">
                    {sel.matchLabel} — {sel.selection}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    EV {sel.ev != null ? formatPct(sel.ev) : "—"}
                  </p>
                </div>

                {index === 0 ? (
                  <div className="w-[100px] shrink-0 space-y-1">
                    <label className="text-[10px] text-muted-foreground">
                      Stake (R$)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      className="h-8 font-mono text-sm"
                      value={stake}
                      onChange={(e) => setStake(Number(e.target.value) || 0)}
                    />
                  </div>
                ) : (
                  <div className="hidden w-[100px] shrink-0 sm:block" />
                )}

                <div className="w-[88px] shrink-0 space-y-1">
                  <label className="text-[10px] text-muted-foreground">
                    Odd
                  </label>
                  <Input
                    type="number"
                    min={1.01}
                    step={0.01}
                    className="h-8 font-mono text-sm text-primary"
                    value={sel.odd}
                    onChange={(e) => {
                      const next = Number(e.target.value);
                      if (!Number.isFinite(next) || next < 1.01) return;
                      updateSelectionOdd(sel.matchId, sel.selection, next);
                    }}
                  />
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-8 h-8 w-8 shrink-0"
                  onClick={() => removeSelection(sel.matchId, sel.selection)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {calc?.warnings.length ? (
          <div className="space-y-2">
            {calc.warnings.map((w, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200"
              >
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {w.message}
              </div>
            ))}
          </div>
        ) : null}

        <div className="flex justify-between">
          {calculating && selections.length > 0 ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : calc && selections.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Odd total</p>
                <p className="font-mono font-bold">
                  {calc.combinedOdd.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Probabilidade</p>
                <p className="font-mono font-bold">
                  {formatPct(calc.combinedProbability)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">EV</p>
                <p className="font-mono font-bold text-emerald-400">
                  {calc.overallEV != null
                    ? `${calc.overallEV >= 0 ? "+" : ""}${formatPct(calc.overallEV)}`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Retorno potencial
                </p>
                <p className="font-mono font-bold text-primary">
                  {calc.potentialReturn != null
                    ? formatCurrency(calc.potentialReturn)
                    : "—"}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function SavedTicketsList() {
  const { data: tickets, isLoading } = useTickets();
  const deleteTicket = useDeleteTicket();
  const placeTicket = usePlaceTicket();
  const settleTicket = useSettleTicket();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!tickets?.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhum bilhete salvo ainda.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket) => (
        <Card key={ticket.id} className="border-border/60 bg-card/50">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-medium">{ticket.name ?? "Bilhete"}</p>
              <p className="text-xs text-muted-foreground">
                {ticket.selections.length} seleções ·{" "}
                {new Date(ticket.createdAt).toLocaleString("pt-BR")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right text-sm">
                <p className="font-mono font-bold">
                  {ticket.combinedOdd?.toFixed(2) ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {ticket.stake != null ? formatCurrency(ticket.stake) : "—"}
                </p>
              </div>
              <Badge variant="outline">
                {TICKET_STATUS_LABELS[ticket.status]}
              </Badge>
              {ticket.status === "DRAFT" && (
                <Button
                  size="sm"
                  disabled={placeTicket.isPending}
                  onClick={() =>
                    placeTicket.mutate(ticket.id, {
                      onSuccess: () =>
                        toast.success("Bilhete apostado — stake debitada"),
                      onError: () =>
                        toast.error("Falha ao apostar (verifique saldo)"),
                    })
                  }
                >
                  Apostar
                </Button>
              )}
              {ticket.status === "PLACED" && (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-emerald-400"
                    disabled={settleTicket.isPending}
                    onClick={() =>
                      settleTicket.mutate(
                        { ticketId: ticket.id, result: "WON" },
                        { onSuccess: () => toast.success("Green registrado") },
                      )
                    }
                  >
                    Green
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-400"
                    disabled={settleTicket.isPending}
                    onClick={() =>
                      settleTicket.mutate(
                        { ticketId: ticket.id, result: "LOST" },
                        { onSuccess: () => toast.success("Red registrado") },
                      )
                    }
                  >
                    Red
                  </Button>
                </div>
              )}
              {ticket.status === "DRAFT" && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    deleteTicket.mutate(ticket.id, {
                      onSuccess: () => toast.success("Bilhete removido"),
                    })
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
