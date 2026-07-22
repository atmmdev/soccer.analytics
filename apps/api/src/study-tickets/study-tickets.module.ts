import { Module, forwardRef } from '@nestjs/common';
import { StudyTicketsController } from './study-tickets.controller';
import { StudyTicketsService } from './study-tickets.service';
import { BankrollModule } from '../bankroll/bankroll.module';

@Module({
  imports: [forwardRef(() => BankrollModule)],
  controllers: [StudyTicketsController],
  providers: [StudyTicketsService],
  exports: [StudyTicketsService],
})
export class StudyTicketsModule {}
