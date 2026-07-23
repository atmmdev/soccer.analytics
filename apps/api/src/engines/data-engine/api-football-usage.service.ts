import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

const USAGE_STATE_KEY = 'api_football_usage';
const DEFAULT_DAILY_LIMIT = 7500;
const DEFAULT_MINUTE_LIMIT = 300;

export interface ApiFootballUsage {
  /** Dia local (YYYY-MM-DD) do contador */
  date: string;
  /** Requests feitas por este app no dia */
  used: number;
  /** Limite diário configurado (plano) */
  dailyLimit: number;
  /** Limite por minuto configurado (plano) */
  minuteLimit: number;
  /** Restante estimado pelo contador local */
  remaining: number;
  /** Percentual usado (0–100) */
  percentUsed: number;
  /** Valor restante reportado pelo header da API, se houver */
  remainingFromApi: number | null;
  /** Limite reportado pelo header da API, se houver */
  limitFromApi: number | null;
  lastRequestAt: string | null;
  lastPath: string | null;
}

interface StoredUsage {
  date: string;
  count: number;
  lastRequestAt?: string | null;
  lastPath?: string | null;
  remainingFromApi?: number | null;
  limitFromApi?: number | null;
}

@Injectable()
export class ApiFootballUsageService implements OnModuleDestroy {
  private readonly logger = new Logger(ApiFootballUsageService.name);
  private memory: StoredUsage | null = null;
  private dirty = false;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  onModuleDestroy() {
    if (this.flushTimer) clearTimeout(this.flushTimer);
    void this.flush(true);
  }

  async getUsage(): Promise<ApiFootballUsage> {
    const today = this.today();
    await this.ensureLoaded(today);
    return this.toPublic(this.memory!);
  }

  /**
   * Conta 1 request. Headers da API-Sports (quando presentes) atualizam o restante oficial.
   */
  async recordRequest(path: string, response: Response): Promise<void> {
    const today = this.today();
    await this.ensureLoaded(today);

    this.memory!.count += 1;
    this.memory!.lastRequestAt = new Date().toISOString();
    this.memory!.lastPath = path;

    const limitFromApi = this.readHeaderInt(response.headers, [
      'x-ratelimit-requests-limit',
      'x-ratelimit-limit',
    ]);
    const remainingFromApi = this.readHeaderInt(response.headers, [
      'x-ratelimit-requests-remaining',
      'x-ratelimit-remaining',
    ]);

    if (limitFromApi != null) this.memory!.limitFromApi = limitFromApi;
    if (remainingFromApi != null) this.memory!.remainingFromApi = remainingFromApi;

    this.dirty = true;
    this.scheduleFlush();
  }

  private async ensureLoaded(today: string): Promise<void> {
    if (this.memory?.date === today) return;

    if (this.dirty && this.memory) {
      await this.flush(true);
    }

    const row = await this.prisma.appState.findUnique({
      where: { key: USAGE_STATE_KEY },
    });
    const stored = row?.value as StoredUsage | undefined;

    if (stored?.date === today) {
      this.memory = {
        date: today,
        count: Number(stored.count) || 0,
        lastRequestAt: stored.lastRequestAt ?? null,
        lastPath: stored.lastPath ?? null,
        remainingFromApi: stored.remainingFromApi ?? null,
        limitFromApi: stored.limitFromApi ?? null,
      };
    } else {
      this.memory = {
        date: today,
        count: 0,
        lastRequestAt: null,
        lastPath: null,
        remainingFromApi: null,
        limitFromApi: null,
      };
      this.dirty = true;
      this.scheduleFlush();
    }
  }

  private scheduleFlush() {
    if (this.flushTimer) return;
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      void this.flush(false);
    }, 2000);
  }

  private async flush(force: boolean) {
    if (!this.dirty || !this.memory) return;
    if (!force && this.flushTimer) return;

    const snapshot = { ...this.memory };
    try {
      await this.prisma.appState.upsert({
        where: { key: USAGE_STATE_KEY },
        create: { key: USAGE_STATE_KEY, value: snapshot as object },
        update: { value: snapshot as object },
      });
      this.dirty = false;
    } catch (err) {
      this.logger.warn(
        `Falha ao persistir contador API-Football: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }

  private toPublic(stored: StoredUsage): ApiFootballUsage {
    const dailyLimit = this.readLimit('API_FOOTBALL_DAILY_LIMIT', DEFAULT_DAILY_LIMIT);
    const minuteLimit = this.readLimit(
      'API_FOOTBALL_MINUTE_LIMIT',
      DEFAULT_MINUTE_LIMIT,
    );
    const used = stored.count;
    const remaining = Math.max(0, dailyLimit - used);

    return {
      date: stored.date,
      used,
      dailyLimit,
      minuteLimit,
      remaining,
      percentUsed: dailyLimit > 0 ? Math.min(100, Math.round((used / dailyLimit) * 1000) / 10) : 0,
      remainingFromApi: stored.remainingFromApi ?? null,
      limitFromApi: stored.limitFromApi ?? null,
      lastRequestAt: stored.lastRequestAt ?? null,
      lastPath: stored.lastPath ?? null,
    };
  }

  private readLimit(envKey: string, fallback: number): number {
    const raw = this.config.get<string | number>(envKey);
    const n = typeof raw === 'number' ? raw : Number(raw);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  }

  private readHeaderInt(headers: Headers, names: string[]): number | null {
    for (const name of names) {
      const value = headers.get(name);
      if (value == null || value === '') continue;
      const n = Number(value);
      if (Number.isFinite(n)) return n;
    }
    return null;
  }

  private today(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
