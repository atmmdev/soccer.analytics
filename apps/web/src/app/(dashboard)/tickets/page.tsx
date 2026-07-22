'use client';

import { AppHeader } from '@/components/layout/app-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  SavedTicketsList,
  TicketBuilder,
} from '@/components/tickets/ticket-builder';
import { StudyTicketsPanel } from '@/components/tickets/study-tickets-panel';

export default function TicketsPage() {
  return (
    <div className="flex min-h-full flex-col">
      <AppHeader
        title="Bilhetes"
        subtitle="Monte bilhetes com EV · Estude apostas reais importadas da Bet365"
      />

      <div className="flex-1 space-y-6 p-6">
        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="text-base">
              Histórico Bet365 (estudo)
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Selecione ano ou intervalo de datas para carregar. Cada bilhete é
              colapsável.
            </p>
          </CardHeader>
          <CardContent>
            <StudyTicketsPanel />
          </CardContent>
        </Card>

        <TicketBuilder />

        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="text-base">Bilhetes do sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <SavedTicketsList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
