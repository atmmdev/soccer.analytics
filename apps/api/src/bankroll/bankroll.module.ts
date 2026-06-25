import { Module } from '@nestjs/common';
import { BankrollController } from './bankroll.controller';
import { BankrollService } from './bankroll.service';

@Module({
  controllers: [BankrollController],
  providers: [BankrollService],
  exports: [BankrollService],
})
export class BankrollModule {}
