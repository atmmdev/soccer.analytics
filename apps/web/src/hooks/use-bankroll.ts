import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type {
  BankrollAvailableTickets,
  BankrollCorrelatedTickets,
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

export function useBankrollAvailableTickets(enabled = true) {
  return useQuery({
    queryKey: ['bankroll', 'available-tickets'],
    queryFn: async () => {
      const { data } = await apiClient.get<BankrollAvailableTickets>(
        '/bankroll/available-tickets',
      );
      return data;
    },
    enabled,
  });
}

export function useCreateBankrollPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      initialAmount: number;
      startsAt?: string;
      endsAt?: string;
      autoClose?: boolean;
      notes?: string;
      studyTicketIds?: string[];
      ticketIds?: string[];
    }) => {
      const { data } = await apiClient.post<BankrollPeriod>(
        '/bankroll/periods',
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankroll'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['study-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useUpdateBankrollPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      periodId,
      ...payload
    }: {
      periodId: string;
      name?: string;
      initialAmount?: number;
      startsAt?: string;
      endsAt?: string | null;
      autoClose?: boolean;
      notes?: string | null;
    }) => {
      const { data } = await apiClient.patch<BankrollPeriod>(
        `/bankroll/periods/${periodId}`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankroll'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useBankrollCorrelatedTickets(periodId?: string | null) {
  return useQuery({
    queryKey: ['bankroll', 'correlated', periodId ?? null],
    queryFn: async () => {
      const { data } = await apiClient.get<BankrollCorrelatedTickets>(
        `/bankroll/periods/${periodId}/correlated-tickets`,
      );
      return data;
    },
    enabled: !!periodId,
  });
}

export function useLinkBankrollTickets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      periodId,
      studyTicketIds,
      ticketIds,
    }: {
      periodId: string;
      studyTicketIds?: string[];
      ticketIds?: string[];
    }) => {
      const { data } = await apiClient.post<BankrollCorrelatedTickets>(
        `/bankroll/periods/${periodId}/link-tickets`,
        { studyTicketIds, ticketIds },
      );
      return data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ['bankroll', 'correlated', vars.periodId],
      });
      queryClient.invalidateQueries({ queryKey: ['bankroll'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['study-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useUnlinkBankrollTickets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      periodId,
      studyTicketIds,
      ticketIds,
    }: {
      periodId: string;
      studyTicketIds?: string[];
      ticketIds?: string[];
    }) => {
      const { data } = await apiClient.post<BankrollCorrelatedTickets>(
        `/bankroll/periods/${periodId}/unlink-tickets`,
        { studyTicketIds, ticketIds },
      );
      return data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ['bankroll', 'correlated', vars.periodId],
      });
      queryClient.invalidateQueries({ queryKey: ['bankroll'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['study-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
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
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useReopenBankrollPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (periodId: string) => {
      const { data } = await apiClient.post<BankrollPeriod>(
        `/bankroll/periods/${periodId}/reopen`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankroll'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteBankrollPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (periodId: string) => {
      const { data } = await apiClient.delete<{
        ok: boolean;
        id: string;
        name: string;
      }>(`/bankroll/periods/${periodId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankroll'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['study-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
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
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateBankrollEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      entryId,
      ...payload
    }: {
      entryId: string;
      amount?: number;
      description?: string | null;
    }) => {
      const { data } = await apiClient.patch<BankrollEntry>(
        `/bankroll/entries/${entryId}`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankroll'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteBankrollEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: string) => {
      const { data } = await apiClient.delete<{ ok: boolean; id: string }>(
        `/bankroll/entries/${entryId}`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankroll'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
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
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
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
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}
