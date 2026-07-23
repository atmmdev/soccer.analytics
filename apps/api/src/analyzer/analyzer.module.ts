import { Module } from '@nestjs/common';
import { AnalyzerController } from './analyzer.controller';
import { AnalyzerService } from './analyzer.service';
import { StatisticsEngineModule } from '../engines/statistics-engine/statistics-engine.module';
import { DataEngineModule } from '../engines/data-engine/data-engine.module';

@Module({
  imports: [StatisticsEngineModule, DataEngineModule],
  controllers: [AnalyzerController],
  providers: [AnalyzerService],
  exports: [AnalyzerService],
})
export class AnalyzerModule {}
