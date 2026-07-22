import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { loadPromptMarkdown } from './prompt-loader';

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
  provider: 'template' | 'openai';
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
      'Odds importadas',
    ],
    provider: 'template',
    generatedAt: new Date().toISOString(),
  };
}

@Injectable()
export class AiEngineService {
  private readonly logger = new Logger(AiEngineService.name);

  constructor(private config: ConfigService) {}

  async explainMatch(input: MatchExplainInput): Promise<AiExplanation> {
    const template = generateExplanation(input);
    const apiKey = this.config.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      return template;
    }

    try {
      const enhanced = await this.enhanceWithOpenAi(input, template, apiKey);
      return { ...enhanced, provider: 'openai' };
    } catch (err) {
      this.logger.warn(
        `OpenAI fallback to template: ${err instanceof Error ? err.message : 'unknown'}`,
      );
      return template;
    }
  }

  private async enhanceWithOpenAi(
    input: MatchExplainInput,
    template: AiExplanation,
    apiKey: string,
  ): Promise<AiExplanation> {
    const model = this.config.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini';

    const marketData = input.markets
      .map(
        (m) =>
          `${m.selection}: prob=${formatPct(m.probability)}, odd=${m.bookmakerOdd}, EV=${formatPct(m.ev)}, conf=${m.confidence}%, rec=${m.recommendation}`,
      )
      .join('\n');

    const prompt = `Você é analista esportivo quantitativo. Reescreva a explicação abaixo em português claro e profissional.

REGRAS OBRIGATÓRIAS:
- Use APENAS os números fornecidos. Nunca invente estatísticas, odds ou previsões.
- Mantenha as recomendações BET/WATCH/SKIP exatamente como indicadas.
- Tom: inteligência esportiva, não casa de apostas.

Jogo: ${input.matchLabel}${input.competition ? ` (${input.competition})` : ''}
Placar previsto: ${input.predictedScore}
xG: ${input.homeExpectedGoals.toFixed(2)} - ${input.awayExpectedGoals.toFixed(2)}
Confiança: ${input.overallConfidence}%

Mercados:
${marketData}

Resumo template:
${template.summary}

Retorne JSON válido:
{
  "summary": "parágrafo de 2-4 frases",
  "marketInsights": [{"selection":"...","explanation":"...","recommendation":"BET|WATCH|SKIP"}],
  "risks": ["risco 1", "risco 2"]
}`;

    const analyzerDoc = loadPromptMarkdown('analyzer');
    const systemParts = [
      'Responda apenas JSON válido em português do Brasil.',
      'Nunca invente estatísticas, odds ou previsões — use só os números fornecidos.',
      'Mantenha BET/WATCH/SKIP exatamente como indicados.',
    ];
    if (analyzerDoc) {
      systemParts.push(
        '--- Prompt canônico (docs/prompts/analyzer.md) ---\n' +
          analyzerDoc.slice(0, 4000),
      );
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: systemParts.join('\n\n'),
          },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenAI ${response.status}: ${body.slice(0, 200)}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('Resposta vazia da OpenAI');

    const parsed = JSON.parse(content) as {
      summary?: string;
      marketInsights?: Array<{
        selection: string;
        explanation: string;
        recommendation: string;
      }>;
      risks?: string[];
    };

    return {
      summary: parsed.summary ?? template.summary,
      topPick: template.topPick,
      marketInsights:
        parsed.marketInsights?.length
          ? parsed.marketInsights.map((m) => ({
              selection: m.selection,
              explanation: m.explanation,
              recommendation: m.recommendation,
            }))
          : template.marketInsights,
      risks: parsed.risks?.length ? parsed.risks : template.risks,
      dataSources: [...template.dataSources, 'OpenAI (reescrita)'],
      provider: 'openai',
      generatedAt: new Date().toISOString(),
    };
  }
}
