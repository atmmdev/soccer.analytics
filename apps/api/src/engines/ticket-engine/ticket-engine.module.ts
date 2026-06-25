import { Module } from '@nestjs/common';
import { TicketEngineService } from './ticket-engine.service';

@Module({
  providers: [TicketEngineService],
  exports: [TicketEngineService],
})
export class TicketEngineModule {}
