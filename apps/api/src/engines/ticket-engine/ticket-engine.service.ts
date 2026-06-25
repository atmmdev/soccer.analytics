import { Injectable } from '@nestjs/common';
import { MarketType } from '@prisma/client';

export interface TicketSelectionInput {
  matchId: string;
  marketType: MarketType | string;
  selection: string;
  odd: number;
  probability?: number;
  ev?: number;
  confidence?: number;
}

export interface CorrelationWarning {
  code: 'DUPLICATE' | 'SAME_MATCH_RESULT' | 'CORRELATED';
  message: string;
  matchIds: string[];
}

export interface TicketCalculationResult {
  combinedOdd: number;
  combinedProbability: number | null;
  overallEV: number | null;
  suggestedStake: number;
  potentialReturn: number | null;
  warnings: CorrelationWarning[];
  valid: boolean;
}

const DEFAULT_BANKROLL = 1000;
const DEFAULT_STAKE_PERCENT = 0.02;
const KELLY_FRACTION = 0.25;

const MATCH_RESULT_SELECTIONS = new Set(['Casa', 'Empate', 'Fora']);

function round(n: number, decimals = 3) {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}

export function validateCorrelations(
  selections: TicketSelectionInput[],
): { warnings: CorrelationWarning[]; valid: boolean } {
  const warnings: CorrelationWarning[] = [];
  let valid = true;

  const byMatch = new Map<string, TicketSelectionInput[]>();
  for (const sel of selections) {
    const list = byMatch.get(sel.matchId) ?? [];
    list.push(sel);
    byMatch.set(sel.matchId, list);
  }

  for (const [matchId, sels] of byMatch) {
    const keys = new Set<string>();
    for (const s of sels) {
      const key = `${s.marketType}:${s.selection}`;
      if (keys.has(key)) {
        valid = false;
        warnings.push({
          code: 'DUPLICATE',
          message: `Seleção duplicada no mesmo jogo: ${s.selection}`,
          matchIds: [matchId],
        });
      }
      keys.add(key);
    }

    const matchResults = sels.filter(
      (s) =>
        s.marketType === MarketType.MATCH_RESULT ||
        MATCH_RESULT_SELECTIONS.has(s.selection),
    );
    if (matchResults.length > 1) {
      valid = false;
      warnings.push({
        code: 'SAME_MATCH_RESULT',
        message:
          'Não é possível combinar múltiplos resultados (1X2) do mesmo jogo no bilhete.',
        matchIds: [matchId],
      });
    }

    const hasOverUnder = sels.some((s) => s.marketType === MarketType.OVER_UNDER);
    const hasBtts = sels.some((s) => s.marketType === MarketType.BTTS);
    const hasResult = matchResults.length > 0;

    if (hasOverUnder && hasBtts) {
      warnings.push({
        code: 'CORRELATED',
        message:
          'Over/Under e BTTS no mesmo jogo tendem a ser correlacionados — revise o edge.',
        matchIds: [matchId],
      });
    }

    if (hasResult && hasOverUnder) {
      warnings.push({
        code: 'CORRELATED',
        message:
          'Resultado e Over/Under no mesmo jogo podem estar correlacionados.',
        matchIds: [matchId],
      });
    }
  }

  return { warnings, valid };
}

export function calculateCombinedOdd(selections: TicketSelectionInput[]): number {
  if (!selections.length) return 0;
  return round(selections.reduce((acc, s) => acc * s.odd, 1), 2);
}

export function calculateCombinedProbability(
  selections: TicketSelectionInput[],
): number | null {
  if (!selections.length) return null;
  if (selections.some((s) => s.probability == null)) return null;
  return round(
    selections.reduce((acc, s) => acc * (s.probability as number), 1),
    4,
  );
}

export function calculateOverallEV(
  combinedProbability: number | null,
  combinedOdd: number,
): number | null {
  if (combinedProbability == null || combinedOdd <= 0) return null;
  return round(combinedProbability * combinedOdd - 1, 4);
}

export function calculateSuggestedStake(
  combinedProbability: number | null,
  combinedOdd: number,
  bankroll = DEFAULT_BANKROLL,
  stake?: number,
): number {
  if (stake != null && stake > 0) return round(stake, 2);

  if (combinedProbability != null && combinedOdd > 1) {
    const edge = combinedProbability * combinedOdd - 1;
    if (edge > 0) {
      const kelly = edge / (combinedOdd - 1);
      const amount = bankroll * kelly * KELLY_FRACTION;
      return round(Math.min(bankroll * 0.05, Math.max(5, amount)), 2);
    }
  }

  return round(bankroll * DEFAULT_STAKE_PERCENT, 2);
}

export function calculateTicket(
  selections: TicketSelectionInput[],
  stake?: number,
  bankroll = DEFAULT_BANKROLL,
): TicketCalculationResult {
  const { warnings, valid } = validateCorrelations(selections);
  const combinedOdd = calculateCombinedOdd(selections);
  const combinedProbability = calculateCombinedProbability(selections);
  const overallEV = calculateOverallEV(combinedProbability, combinedOdd);
  const suggestedStake = calculateSuggestedStake(
    combinedProbability,
    combinedOdd,
    bankroll,
    stake,
  );
  const effectiveStake = stake && stake > 0 ? stake : suggestedStake;
  const potentialReturn =
    selections.length > 0 ? round(effectiveStake * combinedOdd, 2) : null;

  return {
    combinedOdd,
    combinedProbability,
    overallEV,
    suggestedStake,
    potentialReturn,
    warnings,
    valid: valid && selections.length > 0,
  };
}

@Injectable()
export class TicketEngineService {
  calculate(
    selections: TicketSelectionInput[],
    stake?: number,
    bankroll?: number,
  ): TicketCalculationResult {
    return calculateTicket(selections, stake, bankroll);
  }
}
