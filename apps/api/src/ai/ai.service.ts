import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiEngineService, MatchExplainInput } from '../engines/ai-engine/ai-engine.service';
import { AnalysisService } from '../analysis/analysis.service';

@Injectable()
export class AiService {
  constructor(
    private prisma: PrismaService,
    private aiEngine: AiEngineService,
    private analysisService: AnalysisService,
  ) {}

  async explainMatch(matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: { homeTeam: true, awayTeam: true, competition: true },
    });
    if (!match) throw new NotFoundException('Jogo não encontrado');

    const latest = await this.analysisService.getLatest(matchId);
    if (!latest || !latest.markets?.length) {
      throw new NotFoundException(
        'Nenhuma análise encontrada. Execute o Analysis Engine primeiro.',
      );
    }

    const input: MatchExplainInput = {
      matchLabel: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
      competition: match.competition.name,
      homeExpectedGoals: latest.homeExpectedGoals ?? 0,
      awayExpectedGoals: latest.awayExpectedGoals ?? 0,
      predictedScore: latest.predictedResult ?? '—',
      overallConfidence: latest.overallConfidence,
      markets: (
        latest.markets as Array<{
          selection: string;
          probability: number;
          fairOdd: number;
          bookmakerOdd: number;
          ev: number;
          confidence: number;
          recommendation: 'BET' | 'WATCH' | 'SKIP';
        }>
      ).map((m) => ({
        selection: m.selection,
        probability: m.probability,
        fairOdd: m.fairOdd,
        bookmakerOdd: m.bookmakerOdd,
        ev: m.ev,
        confidence: m.confidence,
        recommendation: m.recommendation,
      })),
    };

    return this.aiEngine.explainMatch(input);
  }

  explainFromData(input: MatchExplainInput) {
    return this.aiEngine.explainMatch(input);
  }
}
