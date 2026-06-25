import { Module } from '@nestjs/common';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { DataEngineModule } from '../engines/data-engine/data-engine.module';
import { AnalysisModule } from '../analysis/analysis.module';

@Module({
  imports: [DataEngineModule, AnalysisModule],
  controllers: [SyncController],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}
