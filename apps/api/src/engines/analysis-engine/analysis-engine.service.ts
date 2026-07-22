import { Injectable } from '@nestjs/common';

export type Recommendation = 'BET' | 'WATCH' | 'SKIP';

export interface MarketOddInput {
  marketType: string;
  selection: string;
  bookmakerOdd: number;
}

export interface TeamMetricsInput {
  goalsFor: number;
  goalsAgainst: number;
  avgCorners: number;
  avgCards: number;
}

export interface MarketAnalysisResult {
  marketType: string;
  selection: string;
  probability: number;
  fairOdd: number;
  bookmakerOdd: number;
  ev: number;
  confidence: number;
  /** Score IA 0–100 (docs/betting/ai/score.md) — usado na recomendação */
  scoreIa: number;
  recommendation: Recommendation;
  playerModel?: boolean;
  /** false = mercado sem modelo; engine força SKIP (não usa 0.5 silencioso) */
  modelSupported?: boolean;
}

export interface PlayerMarketContext {
  probability: number;
  hasModel: boolean;
}

export interface AnalysisEngineResult {
  homeExpectedGoals: number;
  awayExpectedGoals: number;
  expectedCorners: number;
  expectedCards: number;
  predictedScore: string;
  overallConfidence: number;
  markets: MarketAnalysisResult[];
}

const LEAGUE_AVG_GOALS = 2.6;

export function factorial(n: number): number {
  if (n <= 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

export function poisson(lambda: number, k: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

export function scoreMatrix(
  homeLambda: number,
  awayLambda: number,
  maxGoals = 6,
): number[][] {
  const matrix: number[][] = [];
  for (let h = 0; h <= maxGoals; h++) {
    matrix[h] = [];
    for (let a = 0; a <= maxGoals; a++) {
      matrix[h][a] = poisson(homeLambda, h) * poisson(awayLambda, a);
    }
  }
  return matrix;
}

export function calculateExpectedGoals(
  homeGoalsFor: number,
  homeGoalsAgainst: number,
  awayGoalsFor: number,
  awayGoalsAgainst: number,
): { home: number; away: number } {
  const home = (homeGoalsFor * awayGoalsAgainst) / LEAGUE_AVG_GOALS;
  const away = (awayGoalsFor * homeGoalsAgainst) / LEAGUE_AVG_GOALS;
  return {
    home: Math.max(0.3, Math.min(4.5, home)),
    away: Math.max(0.3, Math.min(4.5, away)),
  };
}

function probability1X2(matrix: number[][]): { home: number; draw: number; away: number } {
  let home = 0;
  let draw = 0;
  let away = 0;
  for (let h = 0; h < matrix.length; h++) {
    for (let a = 0; a < matrix[h].length; a++) {
      const p = matrix[h][a];
      if (h > a) home += p;
      else if (h === a) draw += p;
      else away += p;
    }
  }
  const total = home + draw + away || 1;
  return { home: home / total, draw: draw / total, away: away / total };
}

function probabilityOver25(matrix: number[][]): number {
  let under = 0;
  for (let h = 0; h < matrix.length; h++) {
    for (let a = 0; a < matrix[h].length; a++) {
      if (h + a <= 2) under += matrix[h][a];
    }
  }
  return 1 - under;
}

function probabilityBtts(matrix: number[][]): number {
  let no = 0;
  for (let h = 0; h < matrix.length; h++) {
    for (let a = 0; a < matrix[h].length; a++) {
      if (h === 0 || a === 0) no += matrix[h][a];
    }
  }
  return 1 - no;
}

function mostLikelyScore(matrix: number[][]): string {
  const cell = mostLikelyScoreCell(matrix);
  return `${cell.home}-${cell.away}`;
}

/** Célula mais provável da matriz Poisson (placar exato). */
export function mostLikelyScoreCell(matrix: number[][]): {
  home: number;
  away: number;
  probability: number;
} {
  let bestH = 0;
  let bestA = 0;
  let bestP = 0;
  for (let h = 0; h < matrix.length; h++) {
    for (let a = 0; a < matrix[h].length; a++) {
      if (matrix[h][a] > bestP) {
        bestP = matrix[h][a];
        bestH = h;
        bestA = a;
      }
    }
  }
  return { home: bestH, away: bestA, probability: bestP };
}

export function calculateConfidence(
  sampleSize: number,
  dataCompleteness: number,
  consistency: number,
): number {
  // Compat: delega ao Score IA com pesos de docs/betting/ai/score.md
  return calculateScoreIa({
    sampleSize,
    statsQuality: dataCompleteness,
    modelSupported: true,
    marketType: '1X2',
    contextScore: consistency,
  });
}

/** Score IA 0–100 — SSOT de pesos em docs/betting/ai/score.md */
export function calculateScoreIa(input: {
  sampleSize: number;
  statsQuality: number;
  modelSupported: boolean;
  marketType: string;
  hasPlayerModel?: boolean;
  contextScore?: number;
}): number {
  const W_dados = 0.25;
  const W_amostra = 0.2;
  const W_modelo = 0.25;
  const W_mercado = 0.15;
  const W_contexto = 0.15;

  const S_dados = Math.min(100, Math.max(0, input.statsQuality));
  const S_amostra = Math.min(100, (input.sampleSize / 20) * 100);

  let S_modelo = 0;
  if (input.modelSupported) {
    const t = input.marketType.toUpperCase();
    if (t === 'PLAYER') {
      S_modelo = input.hasPlayerModel ? 85 : 25;
    } else if (t === 'CORNERS' || t === 'CARDS' || t === 'HANDICAP') {
      S_modelo = 78;
    } else {
      S_modelo = 90;
    }
  }

  const S_mercado = 70;
  const S_contexto = Math.min(100, Math.max(0, input.contextScore ?? 70));

  const score =
    W_dados * S_dados +
    W_amostra * S_amostra +
    W_modelo * S_modelo +
    W_mercado * S_mercado +
    W_contexto * S_contexto;

  return Math.round(Math.min(100, Math.max(0, score)));
}

export function getRecommendation(ev: number, scoreIa: number): Recommendation {
  if (ev > 0.05 && scoreIa >= 70) return 'BET';
  if (ev >= 0 && scoreIa >= 55) return 'WATCH';
  return 'SKIP';
}

function parseLineFromSelection(selection: string): number | null {
  const match = selection.match(/(\d+\.5|\d+)/);
  return match ? parseFloat(match[1]) : null;
}

function isOverSelection(selection: string): boolean {
  return selection.trim().toLowerCase().startsWith('over');
}

/** P(total > line) para linhas .5 via Poisson */
export function probabilityOverLine(lambda: number, line: number): number {
  const minOver = Math.ceil(line - 0.001);
  let pUnder = 0;
  for (let k = 0; k < minOver; k++) {
    pUnder += poisson(Math.max(0.1, lambda), k);
  }
  return Math.min(0.99, Math.max(0.01, 1 - pUnder));
}

function parseHandicapSelection(
  selection: string,
): { side: 'home' | 'away'; line: number } | null {
  const match = selection.trim().match(/^(Casa|Fora|Home|Away)\s*([+-]\d+(?:\.\d+)?)$/i);
  if (!match) return null;

  const sideKey = match[1].toLowerCase();
  const side = sideKey === 'casa' || sideKey === 'home' ? 'home' : 'away';
  return { side, line: parseFloat(match[2]) };
}

/** Handicap asiático: linha aplicada ao time selecionado */
export function probabilityHandicapCover(
  matrix: number[][],
  side: 'home' | 'away',
  line: number,
): number {
  let p = 0;
  for (let h = 0; h < matrix.length; h++) {
    for (let a = 0; a < matrix[h].length; a++) {
      const covers = side === 'home' ? h + line > a : a + line > h;
      if (covers) p += matrix[h][a];
    }
  }
  return Math.min(0.99, Math.max(0.01, p));
}

function resolveProbability(
  odd: MarketOddInput,
  goalMap: Record<string, number>,
  matrix: number[][],
  cornerLambda: number,
  cardLambda: number,
  playerContext?: Record<string, PlayerMarketContext>,
): { probability: number; modeled: boolean } {
  if (goalMap[odd.selection] !== undefined) {
    return { probability: goalMap[odd.selection], modeled: true };
  }

  const type = odd.marketType.toUpperCase();

  if (type === 'HANDICAP') {
    const parsed = parseHandicapSelection(odd.selection);
    if (parsed) {
      return {
        probability: probabilityHandicapCover(matrix, parsed.side, parsed.line),
        modeled: true,
      };
    }
    return { probability: 0, modeled: false };
  }

  if (type === 'PLAYER') {
    const ctx = playerContext?.[odd.selection];
    if (ctx?.hasModel) {
      return { probability: ctx.probability, modeled: true };
    }
    // Odd implícita só para exibição; recomendação permanece SKIP
    return {
      probability: Math.min(0.95, Math.max(0.02, 1 / odd.bookmakerOdd)),
      modeled: false,
    };
  }

  const line = parseLineFromSelection(odd.selection);
  if (line === null) {
    return { probability: 0, modeled: false };
  }

  const isOver = isOverSelection(odd.selection);

  if (type === 'CORNERS') {
    const pOver = probabilityOverLine(cornerLambda, line);
    return { probability: isOver ? pOver : 1 - pOver, modeled: true };
  }

  if (type === 'CARDS') {
    const pOver = probabilityOverLine(cardLambda, line);
    return { probability: isOver ? pOver : 1 - pOver, modeled: true };
  }

  return { probability: 0, modeled: false };
}

function marketScoreIa(
  period: number,
  statsQuality: number,
  marketType: string,
  modeled: boolean,
  playerContext?: Record<string, PlayerMarketContext>,
  selection?: string,
): number {
  const hasPlayerModel =
    marketType.toUpperCase() === 'PLAYER' &&
    Boolean(selection && playerContext?.[selection]?.hasModel);

  return calculateScoreIa({
    sampleSize: period,
    statsQuality,
    modelSupported: modeled,
    marketType,
    hasPlayerModel,
    contextScore: 70,
  });
}

function getMarketRecommendation(
  ev: number,
  scoreIa: number,
  marketType: string,
  playerContext?: Record<string, PlayerMarketContext>,
  selection?: string,
): Recommendation {
  if (marketType.toUpperCase() === 'PLAYER') {
    const hasModel = selection ? playerContext?.[selection]?.hasModel : false;
    if (!hasModel) return 'SKIP';
  }
  return getRecommendation(ev, scoreIa);
}

export function runAnalysis(
  home: TeamMetricsInput,
  away: TeamMetricsInput,
  odds: MarketOddInput[],
  period = 10,
  statsQuality = 85,
  playerContext: Record<string, PlayerMarketContext> = {},
): AnalysisEngineResult {
  const { home: homeXg, away: awayXg } = calculateExpectedGoals(
    home.goalsFor,
    home.goalsAgainst,
    away.goalsFor,
    away.goalsAgainst,
  );

  const cornerLambda = Math.max(1, home.avgCorners + away.avgCorners);
  const cardLambda = Math.max(0.5, home.avgCards + away.avgCards);

  const matrix = scoreMatrix(homeXg, awayXg);
  const result1x2 = probability1X2(matrix);
  const over25 = probabilityOver25(matrix);
  const btts = probabilityBtts(matrix);
  const predictedScore = mostLikelyScore(matrix);

  const baseConfidence = calculateScoreIa({
    sampleSize: period,
    statsQuality,
    modelSupported: true,
    marketType: '1X2',
    contextScore: 75,
  });

  const probabilityMap: Record<string, number> = {
    Casa: result1x2.home,
    Empate: result1x2.draw,
    Fora: result1x2.away,
    'Over 2.5': over25,
    'Under 2.5': 1 - over25,
    'BTTS Sim': btts,
    'BTTS Não': 1 - btts,
  };

  const markets: MarketAnalysisResult[] = odds.map((odd) => {
    const resolved = resolveProbability(
      odd,
      probabilityMap,
      matrix,
      cornerLambda,
      cardLambda,
      playerContext,
    );

    if (!resolved.modeled) {
      return {
        marketType: odd.marketType,
        selection: odd.selection,
        probability: round(resolved.probability),
        fairOdd: 99,
        bookmakerOdd: odd.bookmakerOdd,
        ev: round(resolved.probability * odd.bookmakerOdd - 1),
        confidence: 0,
        scoreIa: 0,
        recommendation: 'SKIP' as Recommendation,
        modelSupported: false,
        ...(odd.marketType.toUpperCase() === 'PLAYER'
          ? { playerModel: false }
          : {}),
      };
    }

    const probability = resolved.probability;
    const fairOdd = probability > 0 ? 1 / probability : 99;
    const ev = probability * odd.bookmakerOdd - 1;
    const scoreIa = marketScoreIa(
      period,
      statsQuality,
      odd.marketType,
      true,
      playerContext,
      odd.selection,
    );
    const hasPlayerModel =
      odd.marketType.toUpperCase() === 'PLAYER' &&
      Boolean(playerContext[odd.selection]?.hasModel);

    return {
      marketType: odd.marketType,
      selection: odd.selection,
      probability: round(probability),
      fairOdd: round(fairOdd),
      bookmakerOdd: odd.bookmakerOdd,
      ev: round(ev),
      confidence: scoreIa,
      scoreIa,
      recommendation: getMarketRecommendation(
        ev,
        scoreIa,
        odd.marketType,
        playerContext,
        odd.selection,
      ),
      modelSupported: true,
      ...(hasPlayerModel ? { playerModel: true } : {}),
    };
  });

  return {
    homeExpectedGoals: round(homeXg),
    awayExpectedGoals: round(awayXg),
    expectedCorners: round(cornerLambda),
    expectedCards: round(cardLambda),
    predictedScore,
    overallConfidence: baseConfidence,
    markets,
  };
}

function round(n: number) {
  return Math.round(n * 1000) / 1000;
}

@Injectable()
export class AnalysisEngineService {
  analyze(
    home: TeamMetricsInput,
    away: TeamMetricsInput,
    odds: MarketOddInput[],
    period = 10,
    statsQuality = 85,
    playerContext: Record<string, PlayerMarketContext> = {},
  ): AnalysisEngineResult {
    return runAnalysis(home, away, odds, period, statsQuality, playerContext);
  }
}
