import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { TicketEngineModule } from '../engines/ticket-engine/ticket-engine.module';
import { StudyTicketsModule } from '../study-tickets/study-tickets.module';

@Module({
  imports: [TicketEngineModule, StudyTicketsModule],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
