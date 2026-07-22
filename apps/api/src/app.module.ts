import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { EnginesModule } from './engines/engines.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MatchesModule } from './matches/matches.module';
import { AnalyzerModule } from './analyzer/analyzer.module';
import { AnalysisModule } from './analysis/analysis.module';
import { TicketsModule } from './tickets/tickets.module';
import { StudyTicketsModule } from './study-tickets/study-tickets.module';
import { BankrollModule } from './bankroll/bankroll.module';
import { ResearchModule } from './research/research.module';
import { AiModule } from './ai/ai.module';
import { DataModule } from './data/data.module';
import { AlertsModule } from './alerts/alerts.module';
import { ReportsModule } from './reports/reports.module';
import { SyncModule } from './sync/sync.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    HealthModule,
    EnginesModule,
    DashboardModule,
    MatchesModule,
    AnalyzerModule,
    AnalysisModule,
    TicketsModule,
    StudyTicketsModule,
    BankrollModule,
    ResearchModule,
    AiModule,
    DataModule,
    AlertsModule,
    ReportsModule,
    SyncModule,
    SearchModule,
  ],
})
export class AppModule {}
