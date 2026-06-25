'use client';

import { AppHeader } from '@/components/layout/app-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  SavedTicketsList,
  TicketBuilder,
} from '@/components/tickets/ticket-builder';

export default function TicketsPage() {
  return (
    <div className="flex min-h-full flex-col">
      <AppHeader
        title="Bilhetes"
        subtitle="Monte bilhetes com validação de correlação e EV combinado"
      />

      <div className="flex-1 space-y-6 p-6">
        <TicketBuilder />

        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="text-base">Bilhetes salvos</CardTitle>
          </CardHeader>
          <CardContent>
            <SavedTicketsList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
