import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { TicketEngineModule } from '../engines/ticket-engine/ticket-engine.module';

@Module({
  imports: [TicketEngineModule],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
