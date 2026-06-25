import { Injectable } from '@nestjs/common';

export interface MarketExplainInput {
  selection: string;
  probability: number;
  fairOdd: number;
  bookmakerOdd: number;
  ev: number;
  confidence: number;
  recommendation: 'BET' | 'WATCH' | 'SKIP';
}

export interface MatchExplainInput {
  matchLabel: string;
  competition?: string;
  homeExpectedGoals: number;
  awayExpectedGoals: number;
  predictedScore: string;
  overallConfidence: number;
  markets: MarketExplainInput[];
}

export interface AiExplanation {
  summary: string;
  topPick: string | null;
  marketInsights: Array<{
    selection: string;
    explanation: string;
    recommendation: string;
  }>;
  risks: string[];
  dataSources: string[];
  provider: 'template';
  generatedAt: string;
}

function formatPct(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function explainMarket(m: MarketExplainInput): string {
  const impliedProb = 1 / m.bookmakerOdd;
  const edge = m.probability - impliedProb;

  if (m.recommendation === 'BET') {
    return (
      `Probabilidade do modelo: ${formatPct(m.probability)} (odd justa ${m.fairOdd.toFixed(2)}). ` +
      `A casa paga ${m.bookmakerOdd.toFixed(2)} (prob. implícita ${formatPct(impliedProb)}). ` +
      `Edge de ${formatPct(edge)} com EV ${formatPct(m.ev)} e confiança ${m.confidence}%. ` +
      `Critérios atendidos: EV > 5% e confiança ≥ 70.`
    );
  }

  if (m.recommendation === 'WATCH') {
    return (
      `EV positivo (${formatPct(m.ev)}) mas confiança ${m.confidence}% ou edge ainda moderado. ` +
      `Prob. modelo ${formatPct(m.probability)} vs odd casa ${m.bookmakerOdd.toFixed(2)}. ` +
      `Vale monitorar linha e confirmar antes de apostar.`
    );
  }

  return (
    `Sem edge: EV ${formatPct(m.ev)}. Prob. modelo ${formatPct(m.probability)} ` +
    `vs implícita ${formatPct(impliedProb)} na odd ${m.bookmakerOdd.toFixed(2)}. ` +
    `Confiança ${m.confidence}%. Recomendado ignorar.`
  );
}

export function generateExplanation(input: MatchExplainInput): AiExplanation {
  const sorted = [...input.markets].sort((a, b) => b.ev - a.ev);
  const best = sorted.find((m) => m.recommendation === 'BET') ?? sorted.find((m) => m.ev > 0);
  const skips = input.markets.filter((m) => m.recommendation === 'SKIP').length;

  const summary =
    `Análise Poisson para ${input.matchLabel}` +
    (input.competition ? ` (${input.competition})` : '') +
    `: placar previsto ${input.predictedScore}, ` +
    `gols esperados ${input.homeExpectedGoals.toFixed(2)}–${input.awayExpectedGoals.toFixed(2)}, ` +
    `confiança geral ${input.overallConfidence}%. ` +
    (best
      ? `Melhor oportunidade identificada: ${best.selection} (EV ${formatPct(best.ev)}).`
      : `Nenhum mercado com EV > 5% e confiança alta nesta rodada.`) +
    ` ${skips} de ${input.markets.length} mercados marcados como ignorar.`;

  const risks: string[] = [
    'Análise baseada em histórico recente e odds importadas — confirme lineups e lesões antes de apostar.',
    'Modelo Poisson assume independência de gols; mercados correlacionados no mesmo jogo aumentam risco.',
  ];

  if (input.overallConfidence < 65) {
    risks.push(
      `Confiança geral baixa (${input.overallConfidence}%) — amostra ou qualidade dos dados limitada.`,
    );
  }

  const highEvMarkets = input.markets.filter((m) => m.ev > 0.1);
  if (highEvMarkets.length >= 2) {
    risks.push(
      'Múltiplos mercados com EV alto no mesmo jogo podem indicar correlação — evite acumular no bilhete.',
    );
  }

  return {
    summary,
    topPick: best?.selection ?? null,
    marketInsights: input.markets.map((m) => ({
      selection: m.selection,
      explanation: explainMarket(m),
      recommendation: m.recommendation,
    })),
    risks,
    dataSources: [
      'Analysis Engine (Poisson)',
      'Statistics Engine (jogos finalizados)',
      'Odds importadas ou do banco',
    ],
    provider: 'template',
    generatedAt: new Date().toISOString(),
  };
}

@Injectable()
export class AiEngineService {
  explainMatch(input: MatchExplainInput): AiExplanation {
    return generateExplanation(input);
  }
}
