import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { BankrollModule } from '../bankroll/bankroll.module';
import { AnalysisModule } from '../analysis/analysis.module';

@Module({
  imports: [BankrollModule, AnalysisModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
