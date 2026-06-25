import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { BankrollEntry, BankrollPoint, BankrollSummary } from '@/types/bankroll';

export function useBankrollSummary() {
  return useQuery({
    queryKey: ['bankroll', 'summary'],
    queryFn: async () => {
      const { data } = await apiClient.get<BankrollSummary>('/bankroll/summary');
      return data;
    },
  });
}

export function useBankrollHistory() {
  return useQuery({
    queryKey: ['bankroll', 'history'],
    queryFn: async () => {
      const { data } = await apiClient.get<BankrollPoint[]>('/bankroll/history');
      return data;
    },
  });
}

export function useBankrollEntries() {
  return useQuery({
    queryKey: ['bankroll', 'entries'],
    queryFn: async () => {
      const { data } = await apiClient.get<BankrollEntry[]>('/bankroll/entries');
      return data;
    },
  });
}

export function useCreateBankrollEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      type: 'DEPOSIT' | 'WITHDRAWAL';
      amount: number;
      description?: string;
    }) => {
      const { data } = await apiClient.post<BankrollEntry>(
        '/bankroll/entries',
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankroll'] });
    },
  });
}

export function usePlaceTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketId: string) => {
      const { data } = await apiClient.post(`/bankroll/tickets/${ticketId}/place`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankroll'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useSettleTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ticketId,
      result,
    }: {
      ticketId: string;
      result: 'WON' | 'LOST' | 'VOID';
    }) => {
      const { data } = await apiClient.post(
        `/bankroll/tickets/${ticketId}/settle`,
        { result },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankroll'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}
