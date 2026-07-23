import { Module } from '@nestjs/common';
import { StatisticsEngineService } from './statistics-engine.service';
import { DataEngineModule } from '../data-engine/data-engine.module';

@Module({
  imports: [DataEngineModule],
  providers: [StatisticsEngineService],
  exports: [StatisticsEngineService],
})
export class StatisticsEngineModule {}
