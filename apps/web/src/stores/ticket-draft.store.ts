import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DraftSelection } from '@/types/ticket';

interface TicketDraftState {
  selections: DraftSelection[];
  stake: number;
  addSelection: (selection: DraftSelection) => boolean;
  setSelections: (selections: DraftSelection[]) => void;
  removeSelection: (matchId: string, selection: string) => void;
  updateSelectionOdd: (
    matchId: string,
    selection: string,
    odd: number,
  ) => void;
  setStake: (stake: number) => void;
  clear: () => void;
}

export const useTicketDraftStore = create<TicketDraftState>()(
  persist(
    (set, get) => ({
      selections: [],
      stake: 20,

      addSelection: (selection) => {
        const exists = get().selections.some(
          (s) =>
            s.matchId === selection.matchId &&
            s.selection === selection.selection,
        );
        if (exists) return false;

        set((state) => ({
          selections: [...state.selections, selection],
        }));
        return true;
      },

      setSelections: (selections) => set({ selections }),

      removeSelection: (matchId, selection) => {
        set((state) => ({
          selections: state.selections.filter(
            (s) => !(s.matchId === matchId && s.selection === selection),
          ),
        }));
      },

      updateSelectionOdd: (matchId, selection, odd) => {
        set((state) => ({
          selections: state.selections.map((s) =>
            s.matchId === matchId && s.selection === selection
              ? { ...s, odd }
              : s,
          ),
        }));
      },

      setStake: (stake) => set({ stake }),

      clear: () => set({ selections: [] }),
    }),
    { name: 'ticket-draft' },
  ),
);
