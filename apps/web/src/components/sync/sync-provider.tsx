'use client';

import { useSyncEnsure } from '@/hooks/use-sync';

/** Dispara sync automática ao montar — UI fica no header (SyncStatusMenu). */
export function SyncProvider({ children }: { children: React.ReactNode }) {
  useSyncEnsure();
  return <>{children}</>;
}
