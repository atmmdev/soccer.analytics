import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { EnginesModule } from './engines/engines.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MatchesModule } from './matches/matches.module';
import { AnalyzerModule } from './analyzer/analyzer.module';

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
  ],
})
export class AppModule {}
