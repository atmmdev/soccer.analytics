import { Module } from '@nestjs/common';
import { StatisticsEngineService } from './statistics-engine.service';

@Module({
  providers: [StatisticsEngineService],
  exports: [StatisticsEngineService],
})
export class StatisticsEngineModule {}
