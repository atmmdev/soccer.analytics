import { Module } from '@nestjs/common';
import { AnalysisEngineModule } from './analysis-engine/analysis-engine.module';
import { TicketEngineModule } from './ticket-engine/ticket-engine.module';
import { SimulationEngineModule } from './simulation-engine/simulation-engine.module';
import { StatisticsEngineModule } from './statistics-engine/statistics-engine.module';
import { DataEngineModule } from './data-engine/data-engine.module';
import { AiEngineModule } from './ai-engine/ai-engine.module';
import { PlayerEngineModule } from './player-engine/player-engine.module';

/**
 * Engines Module — intelligence engines reais do monorepo.
 *
 * Implementados:
 * - DataEngine, StatisticsEngine, AnalysisEngine, PlayerEngine
 * - TicketEngine, SimulationEngine, AiEngine
 *
 * EV, recomendações BET/WATCH/SKIP e mercados vivem no AnalysisEngine
 * (não há MarketEngine / EvEngine / RecommendationEngine separados).
 * Research Lab usa SimulationEngine + módulo `research/` (HTTP), não ResearchEngine.
 */
@Module({
  imports: [AnalysisEngineModule, TicketEngineModule, SimulationEngineModule, StatisticsEngineModule, DataEngineModule, AiEngineModule, PlayerEngineModule],
  exports: [AnalysisEngineModule, TicketEngineModule, SimulationEngineModule, StatisticsEngineModule, DataEngineModule, AiEngineModule, PlayerEngineModule],
})
export class EnginesModule {}
