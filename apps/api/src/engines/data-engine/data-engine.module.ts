import { Module } from '@nestjs/common';
import { ApiFootballProvider } from './api-football.provider';
import { DataEngineService } from './data-engine.service';

@Module({
  providers: [ApiFootballProvider, DataEngineService],
  exports: [DataEngineService],
})
export class DataEngineModule {}
