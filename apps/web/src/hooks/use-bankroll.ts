import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type {
  BankrollEntry,
  BankrollPeriod,
  BankrollPoint,
  BankrollSummary,
} from '@/types/bankroll';

export function useBankrollPeriods() {
  return useQuery({
    queryKey: ['bankroll', 'periods'],
    queryFn: async () => {
      const { data } = await apiClient.get<BankrollPeriod[]>('/bankroll/periods');
      return data;
    },
  });
}

export function useBankrollSummary(periodId?: string | null) {
  return useQuery({
    queryKey: ['bankroll', 'summary', periodId ?? null],
    queryFn: async () => {
      const { data } = await apiClient.get<BankrollSummary>('/bankroll/summary', {
        params: periodId ? { periodId } : undefined,
      });
      return data;
    },
  });
}

export function useBankrollHistory(periodId?: string | null) {
  return useQuery({
    queryKey: ['bankroll', 'history', periodId ?? null],
    queryFn: async () => {
      const { data } = await apiClient.get<BankrollPoint[]>('/bankroll/history', {
        params: periodId ? { periodId } : undefined,
      });
      return data;
    },
  });
}

export function useBankrollEntries(periodId?: string | null) {
  return useQuery({
    queryKey: ['bankroll', 'entries', periodId ?? null],
    queryFn: async () => {
      const { data } = await apiClient.get<BankrollEntry[]>('/bankroll/entries', {
        params: periodId ? { periodId } : undefined,
      });
      return data;
    },
  });
}

export function useCreateBankrollPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      initialAmount: number;
      startsAt?: string;
      notes?: string;
    }) => {
      const { data } = await apiClient.post<BankrollPeriod>(
        '/bankroll/periods',
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankroll'] });
    },
  });
}

export function useCloseBankrollPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      periodId,
      notes,
    }: {
      periodId: string;
      notes?: string;
    }) => {
      const { data } = await apiClient.post<BankrollPeriod>(
        `/bankroll/periods/${periodId}/close`,
        { notes },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankroll'] });
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
      periodId?: string;
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
