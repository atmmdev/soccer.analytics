'use client';

import Link from 'next/link';
import { Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTicketDraftStore } from '@/stores/ticket-draft.store';

export function TicketDraftBanner() {
  const count = useTicketDraftStore((s) => s.selections.length);

  if (count === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3">
      <div className="flex items-center gap-2 text-sm">
        <Ticket className="h-4 w-4 text-primary" />
        <span>
          <strong>{count}</strong>{' '}
          {count === 1 ? 'seleção no bilhete' : 'seleções no bilhete'}
        </span>
      </div>
      <Button size="sm" asChild>
        <Link href="/tickets">Abrir Bilhetes</Link>
      </Button>
    </div>
  );
}
