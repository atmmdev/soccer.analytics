import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MatchStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DataEngineService } from '../engines/data-engine/data-engine.service';
import type { ApiFootballUsage } from '../engines/data-engine/api-football-usage.service';
import { AnalysisService } from '../analysis/analysis.service';
import {
  SYNC_AGENDA_LOOKAHEAD_DAYS,
  SYNC_STATS_LOOKBACK_DAYS,
  buildDateWindow,
  readSyncLeagueIds,
  SYNC_LEAGUE_LABELS,
} from './sync-config';

const SYNC_STATE_KEY = 'daily_sync';
/** Full sync (odds/stats/analysis) */
const FULL_RESYNC_INTERVAL_MS = 2 * 60 * 60 * 1000;
/** Fixtures-only refresh so live/finished scores update during the day */
const FIXTURES_RESYNC_INTERVAL_MS = 10 * 60 * 1000;

export type SyncStatusValue = 'idle' | 'running' | 'completed' | 'failed' | 'skipped';

export interface SyncStatus {
  status: SyncStatusValue;
  syncDate: string | null;
  currentStep: string | null;
  configured: boolean;
  message: string | null;
  completedAt: string | null;
  result: Record<string, unknown> | null;
  apiUsage: ApiFootballUsage | null;
}

interface StoredSyncState {
  syncDate: string;
  status: SyncStatusValue;
  currentStep?: string | null;
  completedAt?: string | null;
  message?: string | null;
  result?: Record<string, unknown> | null;
}

@Injectable()
export class SyncService implements OnModuleInit {
  private readonly logger = new Logger(SyncService.name);
  private running = false;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private dataEngine: DataEngineService,
    private analysis: AnalysisService,
  ) { }

  onModuleInit() {
    void this.ensureDailySync();
  }

  isConfigured(): boolean {
    return Boolean(this.config.get<string>('API_FOOTBALL_KEY'));
  }

  async getStatus(): Promise<SyncStatus> {
    const stored = await this.readState();
    return this.toStatus(stored);
  }

  async ensureDailySync(): Promise<SyncStatus> {
    if (!this.isConfigured()) {
      return {
        status: 'skipped',
        syncDate: null,
        currentStep: null,
        configured: false,
        message: 'Configure API_FOOTBALL_KEY em apps/api/.env',
        completedAt: null,
        result: null,
        apiUsage: await this.safeUsage(),
      };
    }

    const today = this.formatDate(new Date());
    const stored = await this.readState();

    if (this.running) {
      return this.toStatus(
        stored
          ? { ...stored, status: 'running' }
          : { syncDate: today, status: 'running', currentStep: 'starting' },
      );
    }

    if (this.isUpToDate(stored, today) && stored) {
      if (this.needsFixturesRefresh(stored)) {
        void this.refreshFixturesOnly(today);
        return this.toStatus({
          ...stored,
          syncDate: stored.syncDate,
          status: 'running',
          currentStep: 'fixtures',
        });
      }
      return this.toStatus(stored);
    }

    void this.runDailySync(today);
    return this.toStatus({
      syncDate: today,
      status: 'running',
      currentStep: 'starting',
    });
  }

  async forceSync(): Promise<SyncStatus> {
    if (!this.isConfigured()) {
      return this.ensureDailySync();
    }

    if (this.running) {
      return this.getStatus();
    }

    const today = this.formatDate(new Date());
    void this.runDailySync(today, true);
    return this.getStatus();
  }

  /** Só busca odds de jogos agendados/ao vivo que ainda não têm odds no banco. */
  async forcePendingOddsSync(): Promise<SyncStatus> {
    if (!this.isConfigured()) {
      return this.ensureDailySync();
    }

    if (this.running) {
      return this.getStatus();
    }

    const today = this.formatDate(new Date());
    void this.runPendingOddsSync(today);
    return this.getStatus();
  }

  private isUpToDate(stored: StoredSyncState | null, today: string): boolean {
    if (!stored || stored.status !== 'completed' || stored.syncDate !== today) {
      return false;
    }
    if (!stored.completedAt) return false;
    return Date.now() - new Date(stored.completedAt).getTime() < FULL_RESYNC_INTERVAL_MS;
  }

  private needsFixturesRefresh(stored: StoredSyncState): boolean {
    const result = stored.result as { lastFixturesRefreshAt?: string } | null;
    const last = result?.lastFixturesRefreshAt ?? stored.completedAt;
    if (!last) return true;
    return Date.now() - new Date(last).getTime() >= FIXTURES_RESYNC_INTERVAL_MS;
  }

  /**
   * Sync parcial: apenas odds de jogos SCHEDULED/LIVE sem odds no banco.
   * Para no 429 para poder retomar depois sem refazer fixtures/stats/análises.
   */
  private async runPendingOddsSync(syncDate: string) {
    if (this.running) return;
    this.running = true;

    const existing = await this.readState();
    const previousResult = (existing?.result ?? {}) as Record<string, unknown>;
    const result: Record<string, unknown> = {
      ...previousResult,
      odds: [] as unknown[],
      oddsErrors: [] as string[],
      oddsPendingMode: true,
    };

    try {
      await this.writeState({
        syncDate,
        status: 'running',
        currentStep: 'odds-pending',
        result,
      });

      let rateLimited = false;
      let remainingWithoutOdds = 0;
      let matchesProcessed = 0;
      let oddsCreated = 0;

      for (const date of this.getAgendaDates()) {
        if (rateLimited) break;

        try {
          const odds = await this.dataEngine.importPendingOdds(date, {
            leagueIds: this.getLeagueIds(),
          });
          (result.odds as unknown[]).push(odds);
          matchesProcessed += odds.matchesProcessed;
          oddsCreated += odds.oddsCreated;
          remainingWithoutOdds += odds.remainingWithoutOdds;
          if (odds.rateLimited) {
            rateLimited = true;
            (result.oddsErrors as string[]).push(
              `${date}: limite por minuto atingido — rode de novo em ~1 min para continuar`,
            );
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Erro desconhecido';
          (result.oddsErrors as string[]).push(`${date}: ${message}`);
          this.logger.warn(`Pending odds import skipped for ${date}: ${message}`);
        }

        await this.writeState({
          syncDate,
          status: 'running',
          currentStep: 'odds-pending',
          result,
        });
      }

      const message = rateLimited
        ? `Odds pendentes pausadas no rate limit (${matchesProcessed} jogos atualizados, ${remainingWithoutOdds} ainda sem odds). Aguarde ~1 min e rode de novo.`
        : remainingWithoutOdds > 0
          ? `Odds pendentes concluídas: ${matchesProcessed} jogos atualizados, ${remainingWithoutOdds} ainda sem odds na API.`
          : `Odds pendentes concluídas: ${matchesProcessed} jogos atualizados (${oddsCreated} odds).`;

      await this.writeState({
        syncDate,
        status: 'completed',
        currentStep: null,
        completedAt: new Date().toISOString(),
        message,
        result: {
          ...result,
          lastOddsPendingAt: new Date().toISOString(),
        },
      });

      this.logger.log(`Pending odds sync completed for ${syncDate}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      this.logger.error(`Pending odds sync failed: ${message}`);
      await this.writeState({
        syncDate,
        status: 'failed',
        currentStep: null,
        message,
        result,
      });
    } finally {
      this.running = false;
    }
  }

  /** Lightweight pass: update status/scores without odds/stats/analysis */
  private async refreshFixturesOnly(syncDate: string) {
    if (this.running) return;
    this.running = true;

    try {
      const existing = await this.readState();
      await this.writeState({
        syncDate,
        status: 'running',
        currentStep: 'fixtures',
        result: existing?.result ?? {},
      });

      const fixtureDates = this.getAgendaDates();
      const leagueIds = this.getLeagueIds();
      for (const date of fixtureDates) {
        try {
          await this.dataEngine.importFixtures(date, { leagueIds });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Erro desconhecido';
          this.logger.warn(`Fixtures refresh skipped for ${date}: ${message}`);
        }
      }

      const refreshedAt = new Date().toISOString();
      await this.writeState({
        syncDate,
        status: existing?.status === 'failed' ? 'failed' : 'completed',
        currentStep: null,
        completedAt: existing?.completedAt ?? refreshedAt,
        message: existing?.message ?? 'Fixtures atualizados',
        result: {
          ...(existing?.result ?? {}),
          lastFixturesRefreshAt: refreshedAt,
        },
      });

      this.logger.log(`Fixtures refresh completed for ${syncDate}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      this.logger.error(`Fixtures refresh failed: ${message}`);
    } finally {
      this.running = false;
    }
  }

  private async runDailySync(syncDate: string, force = false) {
    if (this.running) return;
    this.running = true;

    const result: Record<string, unknown> = {
      fixtures: [] as unknown[],
      fixtureErrors: [] as string[],
      odds: [] as unknown[],
      oddsErrors: [] as string[],
      statistics: [] as unknown[],
      analysesRun: 0,
      snapshotsDiscarded: 0,
    };

    try {
      await this.writeState({
        syncDate,
        status: 'running',
        currentStep: 'fixtures',
        result,
      });

      const agendaDates = this.getAgendaDates();
      const statsDates = this.getStatsDates();
      const leagueIds = this.getLeagueIds();
      result.syncWindow = {
        agenda: agendaDates,
        stats: statsDates,
        leagues: leagueIds,
        note: this.leagueFilterNote(),
      };

      for (const date of agendaDates) {
        try {
          const fixtures = await this.dataEngine.importFixtures(date, {
            leagueIds,
          });
          (result.fixtures as unknown[]).push(fixtures);
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Erro desconhecido';
          (result.fixtureErrors as string[]).push(`${date}: ${message}`);
          this.logger.warn(`Skipping fixtures import for ${date}: ${message}`);
        }
      }
      result.lastFixturesRefreshAt = new Date().toISOString();

      await this.writeState({ syncDate, status: 'running', currentStep: 'resolve', result });
      result.snapshotsDiscarded = await this.analysis.discardInactiveAnalyses();

      await this.writeState({ syncDate, status: 'running', currentStep: 'odds', result });
      // Odds só na agenda (hoje→+7), jogos SCHEDULED/LIVE das ligas allowlist
      for (const date of agendaDates) {
        try {
          const odds = await this.dataEngine.importOdds(date, { leagueIds });
          (result.odds as unknown[]).push(odds);
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Erro desconhecido';
          (result.oddsErrors as string[]).push(`${date}: ${message}`);
          this.logger.warn(`Skipping odds import for ${date}: ${message}`);
        }
      }

      await this.writeState({ syncDate, status: 'running', currentStep: 'statistics', result });
      for (const date of statsDates) {
        for (;;) {
          const stats = await this.dataEngine.importStatistics(date, {
            leagueIds,
          });
          (result.statistics as unknown[]).push(stats);
          if (stats.rateLimited || stats.remainingWithoutStats === 0) break;
        }
      }

      await this.writeState({ syncDate, status: 'running', currentStep: 'players', result });
      result.players = [] as unknown[];
      for (const date of statsDates) {
        for (;;) {
          const players = await this.dataEngine.importPlayerStats(date, {
            leagueIds,
          });
          (result.players as unknown[]).push(players);
          if (players.rateLimited || players.remainingWithoutPlayers === 0) break;
        }
      }

      await this.writeState({ syncDate, status: 'running', currentStep: 'analysis', result });
      result.analysesRun = await this.analysis.autoAnalyzeUpcoming();

      await this.writeState({
        syncDate,
        status: 'completed',
        currentStep: null,
        completedAt: new Date().toISOString(),
        message: force
          ? `Sincronização manual concluída (${this.leagueFilterNote()})`
          : `Sincronização diária concluída (${this.leagueFilterNote()})`,
        result,
      });

      this.logger.log(`Daily sync completed for ${syncDate}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      this.logger.error(`Daily sync failed: ${message}`);
      await this.writeState({
        syncDate,
        status: 'failed',
        currentStep: null,
        message,
        result,
      });
    } finally {
      this.running = false;
    }
  }

  private getLeagueIds(): string[] {
    return readSyncLeagueIds(this.config.get<string>('SYNC_LEAGUE_IDS'));
  }

  /** Fixtures + odds: hoje → +7 */
  private getAgendaDates(): string[] {
    return buildDateWindow(0, SYNC_AGENDA_LOOKAHEAD_DAYS);
  }

  /** Stats/players: finalizados recentes (−3 … ontem/hoje) */
  private getStatsDates(): string[] {
    return buildDateWindow(-SYNC_STATS_LOOKBACK_DAYS, 0);
  }

  private leagueFilterNote(): string {
    const ids = this.getLeagueIds();
    const names = ids.map((id) => SYNC_LEAGUE_LABELS[id] ?? id).join(', ');
    return `Ligas: ${names}`;
  }

  private async readState(): Promise<StoredSyncState | null> {
    const row = await this.prisma.appState.findUnique({ where: { key: SYNC_STATE_KEY } });
    if (!row) return null;
    return row.value as unknown as StoredSyncState;
  }

  private async writeState(partial: Partial<StoredSyncState> & { syncDate: string }) {
    const existing = await this.readState();
    const value: StoredSyncState = {
      syncDate: partial.syncDate,
      status: partial.status ?? existing?.status ?? 'running',
      currentStep: partial.currentStep ?? existing?.currentStep ?? null,
      completedAt: partial.completedAt ?? existing?.completedAt ?? null,
      message: partial.message ?? existing?.message ?? null,
      result: partial.result ?? existing?.result ?? null,
    };

    await this.prisma.appState.upsert({
      where: { key: SYNC_STATE_KEY },
      create: { key: SYNC_STATE_KEY, value: value as object },
      update: { value: value as object },
    });
  }

  private async toStatus(stored: StoredSyncState | null): Promise<SyncStatus> {
    const status: SyncStatusValue = this.running
      ? 'running'
      : stored?.status ?? 'idle';

    return {
      status,
      syncDate: stored?.syncDate ?? null,
      currentStep: stored?.currentStep ?? null,
      configured: this.isConfigured(),
      message: stored?.message ?? null,
      completedAt: stored?.completedAt ?? null,
      result: stored?.result ?? null,
      apiUsage: await this.safeUsage(),
    };
  }

  private async safeUsage() {
    try {
      return await this.dataEngine.getApiFootballUsage();
    } catch {
      return null;
    }
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private offsetDate(iso: string, days: number): string {
    const [y, m, d] = iso.split('-').map(Number);
    return this.formatDate(this.addDays(new Date(y, m - 1, d), days));
  }

  private addDays(date: Date, days: number): Date {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  }
}
