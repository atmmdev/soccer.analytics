import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MarketType, MatchStatus } from '@prisma/client';
import {
  DataProvider,
  DataProviderStatus,
  ImportedFixture,
  ImportedOdd,
} from './data-provider.interface';

const BASE_URL = 'https://v3.football.api-sports.io';

const STATUS_MAP: Record<string, MatchStatus> = {
  NS: MatchStatus.SCHEDULED,
  TBD: MatchStatus.SCHEDULED,
  '1H': MatchStatus.LIVE,
  HT: MatchStatus.LIVE,
  '2H': MatchStatus.LIVE,
  ET: MatchStatus.LIVE,
  BT: MatchStatus.LIVE,
  P: MatchStatus.LIVE,
  LIVE: MatchStatus.LIVE,
  FT: MatchStatus.FINISHED,
  AET: MatchStatus.FINISHED,
  PEN: MatchStatus.FINISHED,
  PST: MatchStatus.POSTPONED,
  CANC: MatchStatus.CANCELLED,
  ABD: MatchStatus.CANCELLED,
};

@Injectable()
export class ApiFootballProvider implements DataProvider {
  readonly name = 'api-football';

  constructor(private config: ConfigService) {}

  getStatus(): DataProviderStatus {
    const key = this.getApiKey();
    return {
      name: this.name,
      configured: Boolean(key),
      message: key
        ? 'API-Football configurada — pronta para importar'
        : 'Defina API_FOOTBALL_KEY no .env para importar dados reais',
    };
  }

  async fetchFixtures(date: string): Promise<ImportedFixture[]> {
    const data = await this.request<{ response: ApiFixture[] }>('/fixtures', { date });
    return data.response.map((item) => this.mapFixture(item));
  }

  async fetchOdds(fixtureExternalId: string): Promise<ImportedOdd[]> {
    const data = await this.request<{ response: ApiOddsEntry[] }>('/odds', {
      fixture: fixtureExternalId,
    });
    return this.extractOddsFromEntries(data.response);
  }

  async fetchOddsByDate(date: string): Promise<Map<string, ImportedOdd[]>> {
    const map = new Map<string, ImportedOdd[]>();
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      const data = await this.request<{
        response: ApiOddsEntry[];
        paging?: { current: number; total: number };
      }>('/odds', { date, page: String(page) });

      totalPages = data.paging?.total ?? 1;

      for (const entry of data.response) {
        const fixtureId = String(entry.fixture.id);
        const odds = this.extractOddsFromEntry(entry);
        if (odds.length > 0) {
          map.set(fixtureId, odds);
        }
      }

      page++;
    }

    return map;
  }

  private extractOddsFromEntries(entries: ApiOddsEntry[]): ImportedOdd[] {
    return entries.flatMap((entry) => this.extractOddsFromEntry(entry));
  }

  private extractOddsFromEntry(entry: ApiOddsEntry): ImportedOdd[] {
    const bookmaker = entry.bookmakers[0];
    if (!bookmaker) return [];

    const odds: ImportedOdd[] = [];
    for (const bet of bookmaker.bets) {
      odds.push(...this.mapBet(bet.name, bet.values, bookmaker.name));
    }
    return odds;
  }

  private getApiKey(): string | undefined {
    const raw = this.config.get<string>('API_FOOTBALL_KEY');
    return raw?.replace(/^["']|["']$/g, '') || undefined;
  }

  private async request<T>(path: string, params: Record<string, string>): Promise<T> {
    const key = this.getApiKey();
    if (!key) {
      throw new Error('API_FOOTBALL_KEY não configurada');
    }

    const url = new URL(`${BASE_URL}${path}`);
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }

    const response = await fetch(url, {
      headers: {
        'x-apisports-key': key,
      },
    });

    if (response.status === 429) {
      throw new Error(
        'Limite de requisições da API-Football atingido (10/min no plano free). Aguarde 1 minuto e tente novamente.',
      );
    }

    if (!response.ok) {
      throw new Error(`API-Football HTTP ${response.status}`);
    }

    const body = (await response.json()) as T & {
      errors?: Record<string, string> | string[];
      message?: string;
    };

    if (body.errors) {
      const msg = Array.isArray(body.errors)
        ? body.errors.join('; ')
        : Object.values(body.errors).join('; ');
      if (msg) throw new Error(msg);
    }

    return body;
  }

  private mapFixture(item: ApiFixture): ImportedFixture {
    const status = STATUS_MAP[item.fixture.status.short] ?? MatchStatus.SCHEDULED;
    const homeScore = item.goals.home ?? undefined;
    const awayScore = item.goals.away ?? undefined;

    return {
      externalId: String(item.fixture.id),
      matchDate: new Date(item.fixture.date),
      status,
      homeScore,
      awayScore,
      round: item.league.round ?? undefined,
      venue: item.fixture.venue?.name ?? undefined,
      competition: {
        externalId: String(item.league.id),
        name: item.league.name,
        country: item.league.country,
        logoUrl: item.league.logo ?? undefined,
      },
      homeTeam: {
        externalId: String(item.teams.home.id),
        name: item.teams.home.name,
        logoUrl: item.teams.home.logo ?? undefined,
      },
      awayTeam: {
        externalId: String(item.teams.away.id),
        name: item.teams.away.name,
        logoUrl: item.teams.away.logo ?? undefined,
      },
    };
  }

  private mapBet(
    betName: string,
    values: Array<{ value: string; odd: string }>,
    bookmaker: string,
  ): ImportedOdd[] {
    const normalized = betName.toLowerCase();

    if (normalized.includes('match winner') || normalized === '1x2') {
      return values
        .map((v) => {
          const selection =
            v.value === 'Home'
              ? 'Casa'
              : v.value === 'Draw'
                ? 'Empate'
                : v.value === 'Away'
                  ? 'Fora'
                  : null;
          if (!selection) return null;
          return {
            marketType: MarketType.MATCH_RESULT,
            selection,
            value: parseFloat(v.odd),
            bookmaker,
          };
        })
        .filter(Boolean) as ImportedOdd[];
    }

    if (
      normalized.includes('over/under') &&
      !normalized.includes('half') &&
      !normalized.includes('corner') &&
      !normalized.includes('card')
    ) {
      return values
        .map((v) => {
          const selection =
            v.value === 'Over 2.5'
              ? 'Over 2.5'
              : v.value === 'Under 2.5'
                ? 'Under 2.5'
                : null;
          if (!selection) return null;
          return {
            marketType: MarketType.OVER_UNDER,
            selection,
            value: parseFloat(v.odd),
            bookmaker,
          };
        })
        .filter(Boolean) as ImportedOdd[];
    }

    if (normalized.includes('both teams score') || normalized.includes('btts')) {
      return values
        .map((v) => {
          const selection =
            v.value === 'Yes' ? 'BTTS Sim' : v.value === 'No' ? 'BTTS Não' : null;
          if (!selection) return null;
          return {
            marketType: MarketType.BTTS,
            selection,
            value: parseFloat(v.odd),
            bookmaker,
          };
        })
        .filter(Boolean) as ImportedOdd[];
    }

    return [];
  }
}

interface ApiFixture {
  fixture: {
    id: number;
    date: string;
    status: { short: string };
    venue?: { name?: string };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo?: string;
    round?: string;
  };
  teams: {
    home: { id: number; name: string; logo?: string };
    away: { id: number; name: string; logo?: string };
  };
  goals: { home: number | null; away: number | null };
}

interface ApiOddsEntry {
  fixture: { id: number };
  bookmakers: Array<{
    name: string;
    bets: Array<{
      name: string;
      values: Array<{ value: string; odd: string }>;
    }>;
  }>;
}
