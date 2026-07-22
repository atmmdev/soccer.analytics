import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { StudyTicket } from '@/types/study-ticket';

export function useStudyTickets() {
  return useQuery({
    queryKey: ['study-tickets'],
    queryFn: async () => {
      const { data } = await apiClient.get<StudyTicket[]>('/study-tickets');
      return data;
    },
  });
}

export function useUpdateStudyTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: Partial<StudyTicket> & { id: string }) => {
      const { data } = await apiClient.patch<StudyTicket>(
        `/study-tickets/${id}`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['study-tickets'] });
      qc.invalidateQueries({ queryKey: ['bankroll'] });
    },
  });
}

export function useDeleteStudyTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/study-tickets/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['study-tickets'] });
      qc.invalidateQueries({ queryKey: ['bankroll'] });
    },
  });
}

export function useImportStudyTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (filePath: string) => {
      const { data } = await apiClient.post<StudyTicket>(
        '/study-tickets/import?force=true',
        { filePath },
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['study-tickets'] });
    },
  });
}
