import { Module } from '@nestjs/common';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { AnalysisEngineModule } from '../engines/analysis-engine/analysis-engine.module';
import { StatisticsEngineModule } from '../engines/statistics-engine/statistics-engine.module';
import { PlayerEngineModule } from '../engines/player-engine/player-engine.module';
import { DataEngineModule } from '../engines/data-engine/data-engine.module';

@Module({
  imports: [
    AnalysisEngineModule,
    StatisticsEngineModule,
    PlayerEngineModule,
    DataEngineModule,
  ],
  controllers: [AnalysisController],
  providers: [AnalysisService],
  exports: [AnalysisService],
})
export class AnalysisModule {}
