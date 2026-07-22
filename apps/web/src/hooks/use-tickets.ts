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
          selections: selections.map(({ matchLabel: _, ...rest }) => rest),
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
        selections: payload.selections.map(({ matchLabel: _, ...rest }) => rest),
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
