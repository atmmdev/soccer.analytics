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
  recommendation: Recommendation;
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
  return `${bestH}-${bestA}`;
}

export function calculateConfidence(
  sampleSize: number,
  dataCompleteness: number,
  consistency: number,
): number {
  const sampleScore = Math.min(100, (sampleSize / 20) * 100);
  const score =
    sampleScore * 0.35 +
    dataCompleteness * 0.35 +
    consistency * 0.3;
  return Math.round(Math.min(95, Math.max(40, score)));
}

export function getRecommendation(ev: number, confidence: number): Recommendation {
  if (ev > 0.05 && confidence >= 70) return 'BET';
  if (ev >= 0 && confidence >= 50) return 'WATCH';
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

function resolveProbability(
  odd: MarketOddInput,
  goalMap: Record<string, number>,
  cornerLambda: number,
  cardLambda: number,
): number {
  if (goalMap[odd.selection] !== undefined) {
    return goalMap[odd.selection];
  }

  const line = parseLineFromSelection(odd.selection);
  if (line === null) return 0.5;

  const isOver = isOverSelection(odd.selection);
  const type = odd.marketType.toUpperCase();

  if (type === 'CORNERS') {
    const pOver = probabilityOverLine(cornerLambda, line);
    return isOver ? pOver : 1 - pOver;
  }

  if (type === 'CARDS') {
    const pOver = probabilityOverLine(cardLambda, line);
    return isOver ? pOver : 1 - pOver;
  }

  return 0.5;
}

function marketConfidence(
  baseConfidence: number,
  probability: number,
  marketType: string,
  statsQuality: number,
): number {
  const edgeBoost = probability > 0.55 || probability < 0.45 ? 1.05 : 0.92;
  const type = marketType.toUpperCase();
  const advancedPenalty =
    type === 'CORNERS' || type === 'CARDS' ? statsQuality / 100 : 1;

  return Math.round(baseConfidence * edgeBoost * advancedPenalty);
}

export function runAnalysis(
  home: TeamMetricsInput,
  away: TeamMetricsInput,
  odds: MarketOddInput[],
  period = 10,
  statsQuality = 85,
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

  const baseConfidence = calculateConfidence(period, statsQuality, 75);

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
    const probability = resolveProbability(odd, probabilityMap, cornerLambda, cardLambda);
    const fairOdd = probability > 0 ? 1 / probability : 99;
    const ev = probability * odd.bookmakerOdd - 1;
    const confidence = marketConfidence(
      baseConfidence,
      probability,
      odd.marketType,
      statsQuality,
    );

    return {
      marketType: odd.marketType,
      selection: odd.selection,
      probability: round(probability),
      fairOdd: round(fairOdd),
      bookmakerOdd: odd.bookmakerOdd,
      ev: round(ev),
      confidence,
      recommendation: getRecommendation(ev, confidence),
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
  ): AnalysisEngineResult {
    return runAnalysis(home, away, odds, period, statsQuality);
  }
}
