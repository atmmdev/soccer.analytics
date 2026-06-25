import { Module } from '@nestjs/common';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { AnalysisEngineModule } from '../engines/analysis-engine/analysis-engine.module';
import { StatisticsEngineModule } from '../engines/statistics-engine/statistics-engine.module';

@Module({
  imports: [AnalysisEngineModule, StatisticsEngineModule],
  controllers: [AnalysisController],
  providers: [AnalysisService],
  exports: [AnalysisService],
})
export class AnalysisModule {}
