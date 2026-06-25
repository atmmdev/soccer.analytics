import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { BankrollModule } from '../bankroll/bankroll.module';
import { AnalysisModule } from '../analysis/analysis.module';
import { AnalyzerModule } from '../analyzer/analyzer.module';

@Module({
  imports: [BankrollModule, AnalysisModule, AnalyzerModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
