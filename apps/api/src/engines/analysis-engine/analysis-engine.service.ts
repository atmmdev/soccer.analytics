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
  avgShots?: number;
  avgShotsOnTarget?: number;
  avgRedCards?: number;
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

function resultFromScore(home: number, away: number): 'Casa' | 'Empate' | 'Fora' {
  if (home > away) return 'Casa';
  if (home < away) return 'Fora';
  return 'Empate';
}

/** P(total gols > line) a partir da matriz Poisson */
export function probabilityGoalsOver(matrix: number[][], line: number): number {
  let pOver = 0;
  let total = 0;
  for (let h = 0; h < matrix.length; h++) {
    for (let a = 0; a < matrix[h].length; a++) {
      const p = matrix[h][a];
      total += p;
      if (h + a > line) pOver += p;
    }
  }
  return Math.min(0.99, Math.max(0.01, total > 0 ? pOver / total : 0.5));
}

export function probabilityDoubleChance(
  matrix: number[][],
  selection: string,
): number | null {
  const r = probability1X2(matrix);
  const s = selection.toLowerCase();
  if (s.includes('casa ou empate') || s === '1x') return r.home + r.draw;
  if (s.includes('empate ou fora') || s === 'x2') return r.draw + r.away;
  if (s.includes('casa ou fora') || s === '12') return r.home + r.away;
  return null;
}

export function probabilityExactScore(
  matrix: number[][],
  selection: string,
): number | null {
  const match = selection.trim().match(/^(\d+)\s*[-:]\s*(\d+)$/);
  if (!match) return null;
  const h = Number(match[1]);
  const a = Number(match[2]);
  if (h >= matrix.length || a >= (matrix[0]?.length ?? 0)) {
    // Fora da grade modelada: residual baixo
    return 0.005;
  }
  return Math.min(0.99, Math.max(0.001, matrix[h][a]));
}

/**
 * HT/FT via 1º tempo (~45% dos λ) + 2º tempo (resto), independentes.
 * Seleção: "Casa/Empate", "Empate/Fora", etc.
 */
export function probabilityHtFt(
  homeLambda: number,
  awayLambda: number,
  selection: string,
  htShare = 0.45,
): number | null {
  const parts = selection.split('/');
  if (parts.length !== 2) return null;
  const wantHt = parts[0].trim();
  const wantFt = parts[1].trim();
  if (!['Casa', 'Empate', 'Fora'].includes(wantHt)) return null;
  if (!['Casa', 'Empate', 'Fora'].includes(wantFt)) return null;

  const maxGoals = 4;
  const ht = scoreMatrix(homeLambda * htShare, awayLambda * htShare, maxGoals);
  const sh = scoreMatrix(
    homeLambda * (1 - htShare),
    awayLambda * (1 - htShare),
    maxGoals,
  );

  let p = 0;
  for (let h1 = 0; h1 <= maxGoals; h1++) {
    for (let a1 = 0; a1 <= maxGoals; a1++) {
      if (resultFromScore(h1, a1) !== wantHt) continue;
      for (let h2 = 0; h2 <= maxGoals; h2++) {
        for (let a2 = 0; a2 <= maxGoals; a2++) {
          const ftH = h1 + h2;
          const ftA = a1 + a2;
          if (resultFromScore(ftH, ftA) !== wantFt) continue;
          p += ht[h1][a1] * sh[h2][a2];
        }
      }
    }
  }

  return Math.min(0.99, Math.max(0.001, p));
}

export function probabilityWinningMargin(
  matrix: number[][],
  selection: string,
): number | null {
  const s = selection.trim();
  if (/^empate$/i.test(s)) {
    return probability1X2(matrix).draw;
  }

  const match = s.match(/^(Casa|Fora)\s+por\s+(\d+)(\+)?$/i);
  if (!match) return null;

  const side = match[1].toLowerCase() === 'casa' ? 'home' : 'away';
  const n = Number(match[2]);
  const plus = Boolean(match[3]);

  let p = 0;
  for (let h = 0; h < matrix.length; h++) {
    for (let a = 0; a < matrix[h].length; a++) {
      const diff = side === 'home' ? h - a : a - h;
      if (diff <= 0) continue;
      if (plus ? diff >= n : diff === n) p += matrix[h][a];
    }
  }
  return Math.min(0.99, Math.max(0.001, p));
}

function probabilityOver25(matrix: number[][]): number {
  return probabilityGoalsOver(matrix, 2.5);
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
    if (t === 'PLAYER' || t.startsWith('PLAYER_')) {
      S_modelo = input.hasPlayerModel ? 85 : 25;
    } else if (
      t === 'CORNERS' ||
      t === 'CARDS' ||
      t === 'HANDICAP' ||
      t === 'SHOTS' ||
      t === 'SHOTS_ON_TARGET' ||
      t === 'GOALKEEPER_SAVES' ||
      t === 'RED_CARD' ||
      t === 'BOTH_TEAMS_CARDS'
    ) {
      S_modelo = 78;
    } else if (t === 'HT_FT' || t === 'WINNING_MARGIN') {
      S_modelo = 80;
    } else if (t === 'EXACT_SCORE') {
      S_modelo = 82;
    } else if (t === 'DOUBLE_CHANCE' || t === 'OVER_UNDER' || t === 'BTTS' || t === 'MATCH_RESULT') {
      S_modelo = 90;
    } else {
      S_modelo = 70;
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
  homeLambda: number,
  awayLambda: number,
  cornerLambda: number,
  cardLambda: number,
  shotLambda: number,
  sotLambda: number,
  redLambda: number,
  homeCardLambda: number,
  awayCardLambda: number,
  playerContext?: Record<string, PlayerMarketContext>,
): { probability: number; modeled: boolean } {
  if (goalMap[odd.selection] !== undefined) {
    return { probability: goalMap[odd.selection], modeled: true };
  }

  const type = odd.marketType.toUpperCase();

  if (type === 'DOUBLE_CHANCE') {
    const p = probabilityDoubleChance(matrix, odd.selection);
    if (p !== null) return { probability: p, modeled: true };
    return { probability: 0, modeled: false };
  }

  if (type === 'EXACT_SCORE') {
    const p = probabilityExactScore(matrix, odd.selection);
    if (p !== null) return { probability: p, modeled: true };
    return { probability: 0, modeled: false };
  }

  if (type === 'HT_FT') {
    const p = probabilityHtFt(homeLambda, awayLambda, odd.selection);
    if (p !== null) return { probability: p, modeled: true };
    return { probability: 0, modeled: false };
  }

  if (type === 'WINNING_MARGIN') {
    const p = probabilityWinningMargin(matrix, odd.selection);
    if (p !== null) return { probability: p, modeled: true };
    return { probability: 0, modeled: false };
  }

  if (type === 'RED_CARD') {
    const pYes = 1 - Math.exp(-Math.max(0.01, redLambda));
    const yes = /sim|yes/i.test(odd.selection);
    return { probability: yes ? pYes : 1 - pYes, modeled: true };
  }

  if (type === 'BOTH_TEAMS_CARDS') {
    const pHome = 1 - Math.exp(-Math.max(0.01, homeCardLambda));
    const pAway = 1 - Math.exp(-Math.max(0.01, awayCardLambda));
    const pBoth = pHome * pAway;
    const yes = /sim|yes/i.test(odd.selection);
    return { probability: yes ? pBoth : 1 - pBoth, modeled: true };
  }

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

  if (type === 'PLAYER' || type.startsWith('PLAYER_')) {
    const ctx = playerContext?.[odd.selection];
    if (ctx?.hasModel) {
      return { probability: ctx.probability, modeled: true };
    }
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

  if (type === 'OVER_UNDER') {
    const pOver = probabilityGoalsOver(matrix, line);
    return { probability: isOver ? pOver : 1 - pOver, modeled: true };
  }

  if (type === 'CORNERS') {
    const pOver = probabilityOverLine(cornerLambda, line);
    return { probability: isOver ? pOver : 1 - pOver, modeled: true };
  }

  if (type === 'CARDS') {
    const pOver = probabilityOverLine(cardLambda, line);
    return { probability: isOver ? pOver : 1 - pOver, modeled: true };
  }

  if (type === 'SHOTS') {
    const pOver = probabilityOverLine(shotLambda, line);
    return { probability: isOver ? pOver : 1 - pOver, modeled: true };
  }

  if (type === 'SHOTS_ON_TARGET') {
    const pOver = probabilityOverLine(sotLambda, line);
    return { probability: isOver ? pOver : 1 - pOver, modeled: true };
  }

  if (type === 'GOALKEEPER_SAVES') {
    // Aproxima defesas ≈ chutes ao gol - gols esperados
    const saveLambda = Math.max(0.5, sotLambda - homeLambda - awayLambda);
    const pOver = probabilityOverLine(saveLambda, line);
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
  const type = marketType.toUpperCase();
  const hasPlayerModel =
    (type === 'PLAYER' || type.startsWith('PLAYER_')) &&
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
  const type = marketType.toUpperCase();
  if (type === 'PLAYER' || type.startsWith('PLAYER_')) {
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
  const shotLambda = Math.max(
    8,
    (home.avgShots ?? home.goalsFor * 8) + (away.avgShots ?? away.goalsFor * 8),
  );
  const sotLambda = Math.max(
    3,
    (home.avgShotsOnTarget ?? home.goalsFor * 2.8) +
      (away.avgShotsOnTarget ?? away.goalsFor * 2.8),
  );
  const redLambda = Math.max(
    0.05,
    (home.avgRedCards ?? 0.12) + (away.avgRedCards ?? 0.12),
  );

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
      homeXg,
      awayXg,
      cornerLambda,
      cardLambda,
      shotLambda,
      sotLambda,
      redLambda,
      home.avgCards,
      away.avgCards,
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
        ...(odd.marketType.toUpperCase() === 'PLAYER' ||
        odd.marketType.toUpperCase().startsWith('PLAYER_')
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
      (odd.marketType.toUpperCase() === 'PLAYER' ||
        odd.marketType.toUpperCase().startsWith('PLAYER_')) &&
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
