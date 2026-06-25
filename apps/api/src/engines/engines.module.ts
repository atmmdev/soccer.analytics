import { Module } from '@nestjs/common';
import { AnalysisEngineModule } from './analysis-engine/analysis-engine.module';

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
  imports: [AnalysisEngineModule],
  exports: [AnalysisEngineModule],
})
export class EnginesModule {}
