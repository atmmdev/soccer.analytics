import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiEngineModule } from '../engines/ai-engine/ai-engine.module';
import { AnalysisModule } from '../analysis/analysis.module';

@Module({
  imports: [AiEngineModule, AnalysisModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
