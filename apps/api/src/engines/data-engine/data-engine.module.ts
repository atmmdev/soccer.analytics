import { Module } from '@nestjs/common';
import { ApiFootballProvider } from './api-football.provider';
import { ApiFootballUsageService } from './api-football-usage.service';
import { DataEngineService } from './data-engine.service';

@Module({
  providers: [ApiFootballUsageService, ApiFootballProvider, DataEngineService],
  exports: [DataEngineService, ApiFootballUsageService],
})
export class DataEngineModule {}
