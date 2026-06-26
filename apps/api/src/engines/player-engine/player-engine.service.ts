import { Injectable } from '@nestjs/common';
import { MatchStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { poisson } from '../analysis-engine/analysis-engine.service';

export interface ComputedPlayerStats {
  playerId: string;
  name: string;
  teamId: string;
  period: number;
  matches: number;
  starts: number;
  minutes: number;
  goals: number;
  assists: number;
  goalsPer90: number;
  startRate: number;
  source: 'computed' | 'fallback';
}

export interface PlayerProbabilityContext {
  probability: number;
  hasModel: boolean;
  goalsPer90?: number;
  matches?: number;
}

export function normalizePlayerName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s.]/g, '')
    .trim();
}

export function matchPlayerByName(
  selection: string,
  players: Array<{ id: string; name: string }>,
): string | null {
  if (players.length === 0) return null;

  const normSel = normalizePlayerName(selection);
  const exact = players.find((p) => normalizePlayerName(p.name) === normSel);
  if (exact) return exact.id;

  const selParts = normSel.split(/\s+/).filter(Boolean);
  const selLast = selParts[selParts.length - 1];
  if (!selLast) return null;

  const byLastName = players.filter((p) => {
    const parts = normalizePlayerName(p.name).split(/\s+/);
    const last = parts[parts.length - 1];
    return last === selLast || last.startsWith(selLast.replace(/\./g, ''));
  });

  if (byLastName.length === 1) return byLastName[0].id;

  if (normSel.includes('.')) {
    const initial = selParts[0].replace('.', '');
    const narrowed = byLastName.filter((p) => {
      const parts = normalizePlayerName(p.name).split(/\s+/);
      return parts[0]?.startsWith(initial);
    });
    if (narrowed.length === 1) return narrowed[0].id;
  }

  const contains = players.filter((p) => {
    const norm = normalizePlayerName(p.name);
    return norm.includes(normSel) || normSel.includes(norm);
  });
  if (contains.length === 1) return contains[0].id;

  return null;
}

/** P(marcar ≥1 gol) via Poisson — λ = taxa ajustada ao xG do time */
export function probabilityAnytimeGoal(
  stats: ComputedPlayerStats,
  teamExpectedGoals: number,
  teamAvgGoalsFor: number,
  isLikelyStarter = true,
): number {
  if (stats.matches === 0 || stats.minutes === 0) {
    return 0.05;
  }

  const avgMinutes = stats.minutes / stats.matches;
  const starterFactor = isLikelyStarter
    ? Math.min(1, stats.startRate * 0.9 + 0.1)
    : Math.max(0.35, stats.startRate * 0.6);
  const expectedMinutes = avgMinutes * starterFactor;

  const baseRate =
    stats.goalsPer90 > 0
      ? stats.goalsPer90
      : (stats.goals / stats.matches) * (90 / Math.max(avgMinutes, 30));

  const teamFactor =
    teamAvgGoalsFor > 0 ? teamExpectedGoals / teamAvgGoalsFor : 1;

  const lambda = (baseRate / 90) * expectedMinutes * teamFactor;
  const p = 1 - poisson(Math.max(0.05, lambda), 0);

  return Math.min(0.82, Math.max(0.02, p));
}

@Injectable()
export class PlayerEngineService {
  constructor(private prisma: PrismaService) {}

  async computePlayerStats(
    playerId: string,
    period = 10,
  ): Promise<ComputedPlayerStats> {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      return this.fallbackStats(playerId, '—', '', period);
    }

    const rows = await this.prisma.matchPlayerPerformance.findMany({
      where: {
        playerId,
        match: { status: MatchStatus.FINISHED },
      },
      orderBy: { match: { matchDate: 'desc' } },
      take: period,
    });

    if (rows.length === 0) {
      return this.fallbackStats(playerId, player.name, player.teamId ?? '', period);
    }

    let minutes = 0;
    let goals = 0;
    let assists = 0;
    let starts = 0;

    for (const row of rows) {
      minutes += row.minutes;
      goals += row.goals;
      assists += row.assists;
      if (row.wasStarter) starts++;
    }

    const matches = rows.length;
    const goalsPer90 = minutes > 0 ? (goals / minutes) * 90 : 0;

    return {
      playerId,
      name: player.name,
      teamId: player.teamId ?? '',
      period,
      matches,
      starts,
      minutes,
      goals,
      assists,
      goalsPer90: round(goalsPer90),
      startRate: round(starts / matches),
      source: 'computed',
    };
  }

  async buildPlayerContextForMatch(
    matchId: string,
    homeTeamId: string,
    awayTeamId: string,
    homeExpectedGoals: number,
    awayExpectedGoals: number,
    homeAvgGoalsFor: number,
    awayAvgGoalsFor: number,
    playerSelections: string[],
    period = 10,
    starterExternalIds: Set<string> = new Set(),
  ): Promise<Record<string, PlayerProbabilityContext>> {
    void matchId;
    if (playerSelections.length === 0) return {};

    const squad = await this.prisma.player.findMany({
      where: { teamId: { in: [homeTeamId, awayTeamId] } },
      select: { id: true, name: true, teamId: true, externalId: true },
    });

    const context: Record<string, PlayerProbabilityContext> = {};

    for (const selection of playerSelections) {
      const playerId = matchPlayerByName(selection, squad);
      if (!playerId) {
        context[selection] = { probability: 0, hasModel: false };
        continue;
      }

      const player = squad.find((p) => p.id === playerId)!;
      const stats = await this.computePlayerStats(playerId, period);

      if (stats.source === 'fallback') {
        context[selection] = { probability: 0, hasModel: false };
        continue;
      }

      const isHome = player.teamId === homeTeamId;
      const teamXg = isHome ? homeExpectedGoals : awayExpectedGoals;
      const teamAvg = isHome ? homeAvgGoalsFor : awayAvgGoalsFor;
      const isStarter =
        player.externalId != null && starterExternalIds.has(player.externalId)
          ? true
          : stats.startRate >= 0.5;

      const probability = probabilityAnytimeGoal(
        stats,
        teamXg,
        teamAvg,
        isStarter,
      );

      context[selection] = {
        probability,
        hasModel: true,
        goalsPer90: stats.goalsPer90,
        matches: stats.matches,
      };
    }

    return context;
  }

  private fallbackStats(
    playerId: string,
    name: string,
    teamId: string,
    period: number,
  ): ComputedPlayerStats {
    return {
      playerId,
      name,
      teamId,
      period,
      matches: 0,
      starts: 0,
      minutes: 0,
      goals: 0,
      assists: 0,
      goalsPer90: 0,
      startRate: 0,
      source: 'fallback',
    };
  }
}

function round(n: number) {
  return Math.round(n * 1000) / 1000;
}
