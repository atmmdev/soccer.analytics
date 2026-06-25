import { Module } from '@nestjs/common';
import { ResearchController } from './research.controller';
import { ResearchService } from './research.service';
import { SimulationEngineModule } from '../engines/simulation-engine/simulation-engine.module';

@Module({
  imports: [SimulationEngineModule],
  controllers: [ResearchController],
  providers: [ResearchService],
})
export class ResearchModule {}
