import { Module } from '@nestjs/common';
import { StudyTicketsController } from './study-tickets.controller';
import { StudyTicketsService } from './study-tickets.service';

@Module({
  controllers: [StudyTicketsController],
  providers: [StudyTicketsService],
  exports: [StudyTicketsService],
})
export class StudyTicketsModule {}
