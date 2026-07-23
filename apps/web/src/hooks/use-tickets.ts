import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { DraftSelection, Ticket, TicketCalculation } from '@/types/ticket';

export function useTicketCalculation(
  selections: DraftSelection[],
  stake: number,
  enabled = true,
) {
  return useQuery({
    queryKey: ['tickets', 'calculate', selections, stake],
    queryFn: async () => {
      const { data } = await apiClient.post<TicketCalculation>(
        '/tickets/calculate',
        {
          selections: selections.map(
            ({ matchLabel: _m, competition: _c, ...rest }) => rest,
          ),
          stake,
        },
      );
      return data;
    },
    enabled: enabled && selections.length > 0,
  });
}

export function useTickets() {
  return useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const { data } = await apiClient.get<Ticket[]>('/tickets');
      return data;
    },
  });
}

export function useSaveTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name?: string;
      stake: number;
      selections: DraftSelection[];
    }) => {
      const { data } = await apiClient.post<
        Ticket & { studyJson?: unknown; studyJsonPath?: string }
      >('/tickets', {
        name: payload.name,
        stake: payload.stake,
        selections: payload.selections.map(
          ({ matchLabel: _m, competition: _c, ...rest }) => rest,
        ),
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      id: string;
      name?: string;
      status?: Ticket['status'];
      stake?: number;
      actualReturn?: number | null;
      selections?: Array<{
        id: string;
        odd?: number;
        probability?: number;
        ev?: number;
        confidence?: number;
      }>;
    }) => {
      const { id, ...body } = payload;
      const { data } = await apiClient.patch<Ticket>(`/tickets/${id}`, body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useImportTicketPdf() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: string; file: File }) => {
      const form = new FormData();
      form.append('file', payload.file);
      const { data } = await apiClient.post<{
        ticket: Ticket;
        warnings: string[];
        parsedLegs: number;
        linkedLegs: number;
      }>(`/tickets/${payload.id}/import-pdf`, form, {
        headers: { 'Content-Type': undefined },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/tickets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}
