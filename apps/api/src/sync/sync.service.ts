import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MatchStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DataEngineService } from '../engines/data-engine/data-engine.service';
import { AnalysisService } from '../analysis/analysis.service';

const SYNC_STATE_KEY = 'daily_sync';
const RESYNC_INTERVAL_MS = 4 * 60 * 60 * 1000;
const STATS_MAX_BATCHES_PER_DATE = 3;

export type SyncStatusValue = 'idle' | 'running' | 'completed' | 'failed' | 'skipped';

export interface SyncStatus {
  status: SyncStatusValue;
  syncDate: string | null;
  currentStep: string | null;
  configured: boolean;
  message: string | null;
  completedAt: string | null;
  result: Record<string, unknown> | null;
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
  ) {}

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

    if (this.isUpToDate(stored, today)) {
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

  private isUpToDate(stored: StoredSyncState | null, today: string): boolean {
    if (!stored || stored.status !== 'completed' || stored.syncDate !== today) {
      return false;
    }
    if (!stored.completedAt) return false;
    return Date.now() - new Date(stored.completedAt).getTime() < RESYNC_INTERVAL_MS;
  }

  private async runDailySync(syncDate: string, force = false) {
    if (this.running) return;
    this.running = true;

    const result: Record<string, unknown> = {
      fixtures: [] as unknown[],
      odds: [] as unknown[],
      statistics: [] as unknown[],
      analysesRun: 0,
      snapshotsResolved: 0,
    };

    try {
      await this.writeState({
        syncDate,
        status: 'running',
        currentStep: 'fixtures',
        result,
      });

      const fixtureDates = this.getFixtureDates();
      for (const date of fixtureDates) {
        const fixtures = await this.dataEngine.importFixtures(date);
        (result.fixtures as unknown[]).push(fixtures);
      }

      await this.writeState({ syncDate, status: 'running', currentStep: 'resolve', result });
      result.snapshotsResolved = await this.analysis.resolveFinishedSnapshots();

      await this.writeState({ syncDate, status: 'running', currentStep: 'odds', result });
      const oddsDates = [syncDate, this.offsetDate(syncDate, 1)];
      for (const date of oddsDates) {
        const odds = await this.dataEngine.importOdds(date);
        (result.odds as unknown[]).push(odds);
      }

      await this.writeState({ syncDate, status: 'running', currentStep: 'statistics', result });
      for (const date of fixtureDates) {
        for (let batch = 0; batch < STATS_MAX_BATCHES_PER_DATE; batch++) {
          const stats = await this.dataEngine.importStatistics(date);
          (result.statistics as unknown[]).push(stats);
          if (stats.rateLimited || stats.remainingWithoutStats === 0) break;
          await this.sleep(6500);
        }
      }

      await this.writeState({ syncDate, status: 'running', currentStep: 'analysis', result });
      result.analysesRun = await this.analysis.autoAnalyzeUpcoming();

      await this.writeState({
        syncDate,
        status: 'completed',
        currentStep: null,
        completedAt: new Date().toISOString(),
        message: force ? 'Sincronização manual concluída' : 'Sincronização diária concluída',
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

  private getFixtureDates(): string[] {
    const today = new Date();
    const dates: string[] = [];
    for (let offset = -7; offset <= 1; offset++) {
      dates.push(this.formatDate(this.addDays(today, offset)));
    }
    return dates;
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

  private toStatus(stored: StoredSyncState | null): SyncStatus {
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
    };
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

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
