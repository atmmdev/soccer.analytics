import { Module } from '@nestjs/common';
import { AnalysisEngineModule } from './analysis-engine/analysis-engine.module';
import { TicketEngineModule } from './ticket-engine/ticket-engine.module';
import { SimulationEngineModule } from './simulation-engine/simulation-engine.module';
import { StatisticsEngineModule } from './statistics-engine/statistics-engine.module';
import { DataEngineModule } from './data-engine/data-engine.module';
import { AiEngineModule } from './ai-engine/ai-engine.module';

/**
 * Engines Module — aggregates all intelligence engines.
 * Each engine will be added as a sub-module in future phases.
 *
 * Planned engines:
 * - DataEngine: imports external data
 * - MatchEngine: analyzes matches
 * - TeamEngine: analyzes teams
 * - PlayerEngine: analyzes players
 * - StatisticsEngine: calculates statistics
 * - AnalysisEngine: orchestrates analysis (confidence, probability, EV)
 * - MarketEngine: transforms stats into markets
 * - TicketEngine: builds tickets
 * - SimulationEngine: tests strategies with history
 * - ResearchEngine: hypothesis laboratory
 * - EvEngine: calculates Expected Value
 * - RecommendationEngine: suggests markets
 * - AiEngine: explains recommendations
 */
@Module({
  imports: [AnalysisEngineModule, TicketEngineModule, SimulationEngineModule, StatisticsEngineModule, DataEngineModule, AiEngineModule],
  exports: [AnalysisEngineModule, TicketEngineModule, SimulationEngineModule, StatisticsEngineModule, DataEngineModule, AiEngineModule],
})
export class EnginesModule {}
