import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MarketType, MatchStatus } from '@prisma/client';
import {
  DataProvider,
  DataProviderStatus,
  ImportedFixture,
  ImportedLineupPlayer,
  ImportedMatchStatistics,
  ImportedOdd,
  ImportedPlayerPerformance,
} from './data-provider.interface';
import { ApiFootballUsageService } from './api-football-usage.service';

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

  constructor(
    private config: ConfigService,
    private usage: ApiFootballUsageService,
  ) {}

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

  async fetchFixtureStatistics(
    fixtureExternalId: string,
    homeTeamExternalId: string,
  ): Promise<ImportedMatchStatistics | null> {
    const data = await this.request<{ response: ApiTeamStatistics[] }>(
      '/fixtures/statistics',
      { fixture: fixtureExternalId },
    );

    if (!data.response?.length) return null;

    const homeEntry =
      data.response.find((t) => String(t.team.id) === homeTeamExternalId) ??
      data.response[0];
    const awayEntry =
      data.response.find((t) => String(t.team.id) !== String(homeEntry.team.id)) ??
      data.response[1];

    if (!awayEntry) return null;

    const home = this.parseTeamStatistics(homeEntry.statistics);
    const away = this.parseTeamStatistics(awayEntry.statistics);

    return {
      homePossession: home.possession,
      awayPossession: away.possession,
      homeShots: home.shots,
      awayShots: away.shots,
      homeShotsOnTarget: home.shotsOnTarget,
      awayShotsOnTarget: away.shotsOnTarget,
      homeCorners: home.corners,
      awayCorners: away.corners,
      homeYellowCards: home.yellowCards,
      awayYellowCards: away.yellowCards,
      homeRedCards: home.redCards,
      awayRedCards: away.redCards,
      homeXG: home.xg,
      awayXG: away.xg,
    };
  }

  async fetchFixturePlayers(fixtureExternalId: string): Promise<ImportedPlayerPerformance[]> {
    const data = await this.request<{ response: ApiFixturePlayersTeam[] }>(
      '/fixtures/players',
      { fixture: fixtureExternalId },
    );

    if (!data.response?.length) return [];

    const performances: ImportedPlayerPerformance[] = [];

    for (const teamEntry of data.response) {
      const teamExternalId = String(teamEntry.team.id);

      for (const entry of teamEntry.players ?? []) {
        const stat = entry.statistics?.[0];
        if (!stat) continue;

        const minutes = parseStat(stat.games?.minutes) ?? 0;
        if (minutes <= 0) continue;

        performances.push({
          playerExternalId: String(entry.player.id),
          playerName: entry.player.name,
          teamExternalId,
          position: stat.games?.position ?? undefined,
          minutes,
          goals: parseStat(stat.goals?.total) ?? 0,
          assists: parseStat(stat.goals?.assists) ?? 0,
          shots: parseStat(stat.shots?.total) ?? 0,
          shotsOnTarget: parseStat(stat.shots?.on) ?? 0,
          wasStarter: stat.games?.substitute === false,
        });
      }
    }

    return performances;
  }

  async fetchFixtureLineups(fixtureExternalId: string): Promise<ImportedLineupPlayer[]> {
    const data = await this.request<{ response: ApiFixtureLineup[] }>(
      '/fixtures/lineups',
      { fixture: fixtureExternalId },
    );

    if (!data.response?.length) return [];

    const lineup: ImportedLineupPlayer[] = [];

    for (const teamEntry of data.response) {
      const teamExternalId = String(teamEntry.team.id);

      for (const row of teamEntry.startXI ?? []) {
        lineup.push({
          playerExternalId: String(row.player.id),
          playerName: row.player.name,
          teamExternalId,
          isStarter: true,
        });
      }

      for (const row of teamEntry.substitutes ?? []) {
        lineup.push({
          playerExternalId: String(row.player.id),
          playerName: row.player.name,
          teamExternalId,
          isStarter: false,
        });
      }
    }

    return lineup;
  }

  /**
   * Confrontos diretos (API-Football) — placares no ponto de vista do mandante atual.
   */
  async fetchHeadToHead(
    homeTeamExternalId: string,
    awayTeamExternalId: string,
    last = 10,
  ): Promise<
    Array<{
      homeGoals: number;
      awayGoals: number;
      date: string;
      homeName: string;
      awayName: string;
      scoreAsPlayed: string;
      competition?: string | null;
    }>
  > {
    const data = await this.request<{ response: ApiFixture[] }>(
      '/fixtures/headtohead',
      {
        h2h: `${homeTeamExternalId}-${awayTeamExternalId}`,
        last: String(last),
      },
    );

    const out: Array<{
      homeGoals: number;
      awayGoals: number;
      date: string;
      homeName: string;
      awayName: string;
      scoreAsPlayed: string;
      competition?: string | null;
    }> = [];

    for (const item of data.response ?? []) {
      if (item.fixture.status.short !== 'FT' && item.fixture.status.short !== 'AET') {
        continue;
      }
      const hs = item.goals.home;
      const as = item.goals.away;
      if (hs == null || as == null) continue;

      const homeWasHome = String(item.teams.home.id) === homeTeamExternalId;
      out.push({
        homeGoals: homeWasHome ? hs : as,
        awayGoals: homeWasHome ? as : hs,
        date: item.fixture.date,
        homeName: item.teams.home.name,
        awayName: item.teams.away.name,
        scoreAsPlayed: `${hs}-${as}`,
        competition: item.league?.name ?? null,
      });
    }
    return out.slice(0, last);
  }

  /**
   * Últimos jogos finalizados de um time — gols marcados/sofridos na perspectiva do time.
   * Preferência: parâmetro `last` (planos pagos). Fallback: busca por temporada.
   */
  async fetchTeamRecentResults(
    teamExternalId: string,
    last = 10,
  ): Promise<Array<{ scored: number; conceded: number; isHome: boolean }>> {
    try {
      const data = await this.request<{ response: ApiFixture[] }>('/fixtures', {
        team: teamExternalId,
        last: String(last),
        status: 'FT',
      });
      const mapped = this.mapTeamResults(data.response ?? [], teamExternalId);
      if (mapped.length) return mapped.slice(0, last);
    } catch {
      /* fallback por temporada */
    }

    const year = new Date().getFullYear();
    const seasons = [year, year - 1, year - 2];
    let items: ApiFixture[] = [];

    for (const season of seasons) {
      try {
        const data = await this.request<{ response: ApiFixture[] }>('/fixtures', {
          team: teamExternalId,
          season: String(season),
          status: 'FT',
        });
        items = data.response ?? [];
        if (items.length) break;
      } catch {
        /* tenta temporada seguinte */
      }
    }

    return this.mapTeamResults(items, teamExternalId).slice(-last);
  }

  private mapTeamResults(
    items: ApiFixture[],
    teamExternalId: string,
  ): Array<{ scored: number; conceded: number; isHome: boolean }> {
    const out: Array<{ scored: number; conceded: number; isHome: boolean }> = [];
    for (const item of items) {
      const hs = item.goals.home;
      const as = item.goals.away;
      if (hs == null || as == null) continue;
      const isHome = String(item.teams.home.id) === teamExternalId;
      out.push({
        scored: isHome ? hs : as,
        conceded: isHome ? as : hs,
        isHome,
      });
    }
    return out;
  }

  private parseTeamStatistics(
    statistics: Array<{ type: string; value: string | number | null }>,
  ) {
    const map = new Map(
      statistics.map((s) => [s.type.toLowerCase(), s.value]),
    );

    return {
      possession: parseStat(map.get('ball possession')),
      shots: parseStat(map.get('total shots')),
      shotsOnTarget: parseStat(map.get('shots on goal')),
      corners: parseStat(map.get('corner kicks')),
      yellowCards: parseStat(map.get('yellow cards')),
      redCards: parseStat(map.get('red cards')),
      xg: parseStat(map.get('expected goals') ?? map.get('expected_goals')),
    };
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

    await this.usage.recordRequest(path, response);

    if (response.status === 429) {
      throw new Error(
        'Limite de requisições da API-Football atingido. Aguarde e tente novamente.',
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
    values: Array<{ value: unknown; odd: string }>,
    bookmaker: string,
  ): ImportedOdd[] {
    const normalized = betName.toLowerCase().trim();

    if (normalized.includes('match winner') || normalized === '1x2') {
      return this.mapSimpleSelections(values, bookmaker, MarketType.MATCH_RESULT, {
        Home: 'Casa',
        Draw: 'Empate',
        Away: 'Fora',
      });
    }

    if (
      normalized.includes('double chance') ||
      normalized === '1x2 double chance'
    ) {
      return this.mapSimpleSelections(values, bookmaker, MarketType.DOUBLE_CHANCE, {
        'Home/Draw': 'Casa ou Empate',
        'Draw/Away': 'Empate ou Fora',
        'Home/Away': 'Casa ou Fora',
        '1X': 'Casa ou Empate',
        X2: 'Empate ou Fora',
        '12': 'Casa ou Fora',
      });
    }

    if (
      (normalized.includes('exact score') ||
        normalized.includes('correct score')) &&
      !normalized.includes('half')
    ) {
      return this.mapExactScoreLines(values, bookmaker);
    }

    if (
      normalized.includes('ht/ft') ||
      normalized.includes('half time/full time') ||
      normalized.includes('halftime/fulltime') ||
      normalized.includes('ht/ft double')
    ) {
      return this.mapHtFtLines(values, bookmaker);
    }

    if (normalized.includes('winning margin') || normalized.includes('win margin')) {
      return this.mapWinningMarginLines(values, bookmaker);
    }

    if (
      (normalized.includes('goals over/under') ||
        normalized.includes('over/under') ||
        normalized.includes('total goals') ||
        normalized.includes('alternative total goals')) &&
      !normalized.includes('half') &&
      !normalized.includes('corner') &&
      !normalized.includes('card') &&
      !normalized.includes('shot') &&
      !normalized.includes('team')
    ) {
      return this.mapOverUnderLines(values, bookmaker, MarketType.OVER_UNDER);
    }

    if (
      (normalized.includes('both teams score') || normalized.includes('btts')) &&
      !normalized.includes('half')
    ) {
      return this.mapSimpleSelections(values, bookmaker, MarketType.BTTS, {
        Yes: 'BTTS Sim',
        No: 'BTTS Não',
      });
    }

    if (normalized.includes('corner')) {
      if (
        normalized.includes('1x2') ||
        normalized.includes('most') ||
        normalized.includes('highest number')
      ) {
        return this.mapTeamMostLines(values, bookmaker, 'Escanteios');
      }
      return this.mapOverUnderLines(values, bookmaker, MarketType.CORNERS);
    }

    if (
      (normalized.includes('total cards') ||
        (normalized.includes('cards') && normalized.includes('over'))) &&
      !normalized.includes('player') &&
      !normalized.includes('red')
    ) {
      return this.mapOverUnderLines(values, bookmaker, MarketType.CARDS);
    }

    if (
      normalized.includes('cards 1x2') ||
      normalized.includes('most cards') ||
      normalized.includes('highest number of cards')
    ) {
      return this.mapTeamMostLines(values, bookmaker, 'Cartões');
    }

    if (normalized.includes('card') && !normalized.includes('corner') && !normalized.includes('player') && !normalized.includes('red')) {
      return this.mapOverUnderLines(values, bookmaker, MarketType.CARDS);
    }

    if (
      normalized.includes('asian handicap') ||
      (normalized.includes('handicap') &&
        !normalized.includes('corner') &&
        !normalized.includes('card'))
    ) {
      return this.mapHandicapLines(values, bookmaker);
    }

    if (
      normalized.includes('goal scorer') ||
      normalized.includes('goalscorer') ||
      normalized.includes('anytime scorer')
    ) {
      return this.mapGoalScorerLines(values, bookmaker);
    }

    // ── Fase 2: chutes / cartões especiais ──
    if (
      (normalized.includes('total shots on target') ||
        normalized.includes('shots on goal') ||
        normalized.includes('shots on target')) &&
      !normalized.includes('player')
    ) {
      return this.mapOverUnderLines(values, bookmaker, MarketType.SHOTS_ON_TARGET);
    }

    if (
      (normalized.includes('total shots') ||
        normalized === 'shots' ||
        normalized.includes('shots over/under')) &&
      !normalized.includes('on target') &&
      !normalized.includes('player') &&
      !normalized.includes('corner')
    ) {
      return this.mapOverUnderLines(values, bookmaker, MarketType.SHOTS);
    }

    if (
      normalized.includes('goalkeeper saves') ||
      normalized.includes('keeper saves') ||
      normalized.includes('total saves')
    ) {
      return this.mapOverUnderLines(values, bookmaker, MarketType.GOALKEEPER_SAVES);
    }

    if (
      normalized.includes('red card') ||
      normalized.includes('to be sent off') ||
      normalized === 'sending off'
    ) {
      return this.mapYesNo(values, bookmaker, MarketType.RED_CARD);
    }

    if (
      normalized.includes('both teams to receive a card') ||
      normalized.includes('both teams receive a card') ||
      normalized.includes('both teams cards')
    ) {
      return this.mapYesNo(values, bookmaker, MarketType.BOTH_TEAMS_CARDS);
    }

    // ── Fase 3: props de jogador ──
    if (
      normalized.includes('to score or assist') ||
      normalized.includes('score or assist') ||
      normalized.includes('goal or assist')
    ) {
      return this.mapPlayerNamedLines(
        values,
        bookmaker,
        MarketType.PLAYER_ASSIST_OR_GOAL,
      );
    }

    if (
      normalized.includes('player shots on target') ||
      (normalized.includes('shots on target') && normalized.includes('player'))
    ) {
      return this.mapPlayerPropLines(
        values,
        bookmaker,
        MarketType.PLAYER_SHOTS_ON_TARGET,
      );
    }

    if (normalized.includes('player shots') || normalized === 'player shot') {
      return this.mapPlayerPropLines(values, bookmaker, MarketType.PLAYER_SHOTS);
    }

    if (
      normalized.includes('player to be booked') ||
      normalized.includes('player card') ||
      normalized.includes('to receive a card')
    ) {
      return this.mapPlayerNamedLines(values, bookmaker, MarketType.PLAYER_CARDS);
    }

    if (normalized.includes('player fouls') || normalized.includes('fouls committed')) {
      return this.mapPlayerPropLines(values, bookmaker, MarketType.PLAYER_FOULS);
    }

    if (
      normalized.includes('player tackles') ||
      (normalized.includes('tackles') && normalized.includes('player'))
    ) {
      return this.mapPlayerPropLines(values, bookmaker, MarketType.PLAYER_TACKLES);
    }

    // ── Mercados restantes do print Bet365 ──
    if (
      normalized.includes('exact goals number') ||
      normalized.includes('goals range') ||
      normalized.includes('goal range') ||
      normalized === 'exact goals' ||
      normalized.includes('number of goals')
    ) {
      return this.mapGoalBandLines(values, bookmaker);
    }

    if (
      normalized.includes('any player to score') ||
      normalized.includes('a player to score') ||
      normalized === 'player to score'
    ) {
      return this.mapYesNo(values, bookmaker, MarketType.ANY_PLAYER_SCORE);
    }

    if (
      normalized.includes('any player to be booked') ||
      normalized.includes('any player card') ||
      normalized.includes('a player to be booked')
    ) {
      return this.mapYesNo(values, bookmaker, MarketType.ANY_PLAYER_CARD);
    }

    if (
      normalized.includes('highest scoring half') ||
      normalized.includes('which half will have more goals')
    ) {
      return this.mapHighestScoringHalfLines(values, bookmaker);
    }

    if (
      normalized.includes('corners 1x2') ||
      normalized.includes('corner 1x2') ||
      normalized.includes('most corners') ||
      normalized.includes('highest number of corners')
    ) {
      return this.mapTeamMostLines(values, bookmaker, 'Escanteios');
    }

    if (
      normalized.includes('cards 1x2') ||
      normalized.includes('most cards')
    ) {
      return this.mapTeamMostLines(values, bookmaker, 'Cartões');
    }

    if (
      (normalized.includes('home team to score') ||
        normalized.includes('away team to score') ||
        normalized.includes('team to score') ||
        normalized.includes('teams to score') ||
        normalized.includes('home exact goals') ||
        normalized.includes('away exact goals') ||
        normalized.includes('exact goals home') ||
        normalized.includes('exact goals away')) &&
      !normalized.includes('both teams')
    ) {
      return this.mapTeamToScoreLines(values, bookmaker, betName);
    }

    if (
      normalized.includes('win to nil') ||
      normalized.includes('clean sheet') ||
      normalized.includes('to score in both halves') ||
      normalized.includes('win both halves') ||
      normalized.includes('team special')
    ) {
      return this.mapTeamSpecialLines(values, bookmaker, betName);
    }

    return [];
  }

  private mapGoalBandLines(
    values: Array<{ value: unknown; odd: string }>,
    bookmaker: string,
  ): ImportedOdd[] {
    return values
      .map((v) => {
        const raw = oddSelectionText(v.value);
        const odd = parseFloat(v.odd);
        if (!Number.isFinite(odd) || odd <= 1) return null;

        // "0", "1", "2", "3", "4", "5", "6+" / "6 or more"
        const exact = raw.match(/^(\d+)\+?$/);
        if (exact) {
          const n = exact[1];
          const plus = raw.endsWith('+') || /or more/i.test(raw);
          return {
            marketType: MarketType.GOAL_BANDS,
            selection: plus ? `${n}+` : n,
            value: odd,
            bookmaker,
          };
        }

        const orMore = raw.match(/^(\d+)\s*or\s*more$/i);
        if (orMore) {
          return {
            marketType: MarketType.GOAL_BANDS,
            selection: `${orMore[1]}+`,
            value: odd,
            bookmaker,
          };
        }

        // "0-1", "2-3", "4-5", "4-6"
        const range = raw.match(/^(\d+)\s*[-–]\s*(\d+)$/);
        if (range) {
          return {
            marketType: MarketType.GOAL_BANDS,
            selection: `${range[1]}-${range[2]}`,
            value: odd,
            bookmaker,
          };
        }

        return null;
      })
      .filter(Boolean) as ImportedOdd[];
  }

  private mapHighestScoringHalfLines(
    values: Array<{ value: unknown; odd: string }>,
    bookmaker: string,
  ): ImportedOdd[] {
    return values
      .map((v) => {
        const lower = oddSelectionText(v.value).toLowerCase();
        const odd = parseFloat(v.odd);
        if (!Number.isFinite(odd) || odd <= 1) return null;

        let selection: string | null = null;
        if (
          lower.includes('1st') ||
          lower.includes('first') ||
          lower === '1' ||
          lower.includes('primeiro')
        ) {
          selection = '1º Tempo';
        } else if (
          lower.includes('2nd') ||
          lower.includes('second') ||
          lower === '2' ||
          lower.includes('segundo')
        ) {
          selection = '2º Tempo';
        } else if (
          lower.includes('draw') ||
          lower.includes('equal') ||
          lower.includes('x') ||
          lower.includes('empate')
        ) {
          selection = 'Empate';
        }

        if (!selection) return null;
        return {
          marketType: MarketType.HIGHEST_SCORING_HALF,
          selection,
          value: odd,
          bookmaker,
        };
      })
      .filter(Boolean) as ImportedOdd[];
  }

  private mapTeamMostLines(
    values: Array<{ value: unknown; odd: string }>,
    bookmaker: string,
    kind: string,
  ): ImportedOdd[] {
    return values
      .map((v) => {
        const lower = oddSelectionText(v.value).toLowerCase();
        const odd = parseFloat(v.odd);
        if (!Number.isFinite(odd) || odd <= 1) return null;

        let side: string | null = null;
        if (lower === 'home' || lower.includes('home')) side = 'Casa';
        else if (lower === 'away' || lower.includes('away')) side = 'Fora';
        else if (lower === 'draw' || lower.includes('draw')) side = 'Empate';

        if (!side) return null;
        return {
          marketType: MarketType.TEAM_MOST,
          selection: `${side} — ${kind}`,
          value: odd,
          bookmaker,
        };
      })
      .filter(Boolean) as ImportedOdd[];
  }

  private mapTeamToScoreLines(
    values: Array<{ value: unknown; odd: string }>,
    bookmaker: string,
    betName: string,
  ): ImportedOdd[] {
    const bet = betName.toLowerCase();
    const homeFocus = bet.includes('home');
    const awayFocus = bet.includes('away');

    return values
      .map((v) => {
        const raw = oddSelectionText(v.value);
        const lower = raw.toLowerCase();
        const odd = parseFloat(v.odd);
        if (!Number.isFinite(odd) || odd <= 1) return null;

        if (/^\d+\+?$/.test(raw) || /^\d+\s*or\s*more$/i.test(raw)) {
          const n = raw.match(/(\d+)/)?.[1] ?? raw;
          const plus = raw.includes('+') || /or more/i.test(raw);
          const team = homeFocus ? 'Casa' : awayFocus ? 'Fora' : 'Time';
          return {
            marketType: MarketType.TEAM_TO_SCORE,
            selection: `${team} exatamente ${n}${plus ? '+' : ''} gols`,
            value: odd,
            bookmaker,
          };
        }

        let selection: string | null = null;
        if (lower === 'yes') {
          selection = homeFocus
            ? 'Casa marca'
            : awayFocus
              ? 'Fora marca'
              : 'Time marca';
        } else if (lower === 'no') {
          selection = homeFocus
            ? 'Casa não marca'
            : awayFocus
              ? 'Fora não marca'
              : 'Time não marca';
        } else if (lower === 'home') {
          selection = 'Casa marca';
        } else if (lower === 'away') {
          selection = 'Fora marca';
        } else if (lower === 'both') {
          selection = 'Ambos marcam';
        } else if (lower === 'neither' || lower === 'no one') {
          selection = 'Nenhum marca';
        }

        if (!selection) return null;
        return {
          marketType: MarketType.TEAM_TO_SCORE,
          selection,
          value: odd,
          bookmaker,
        };
      })
      .filter(Boolean) as ImportedOdd[];
  }

  private mapTeamSpecialLines(
    values: Array<{ value: unknown; odd: string }>,
    bookmaker: string,
    betName: string,
  ): ImportedOdd[] {
    const prefix = this.translateTeamSpecialBetName(betName.trim());
    return values
      .map((v) => {
        const odd = parseFloat(v.odd);
        if (!Number.isFinite(odd) || odd <= 1) return null;
        const outcome = this.translateTeamSpecialOutcome(
          oddSelectionText(v.value),
        );
        if (!outcome) return null;
        return {
          marketType: MarketType.TEAM_SPECIAL,
          selection: `${prefix}: ${outcome}`,
          value: odd,
          bookmaker,
        };
      })
      .filter(Boolean) as ImportedOdd[];
  }

  private translateTeamSpecialBetName(name: string): string {
    let s = name;
    s = s.replace(/to score in both halves/gi, 'Marcar nos dois tempos');
    s = s.replace(/win both halves/gi, 'Vencer ambos os tempos');
    s = s.replace(/win\s*to\s*nil/gi, 'Vencer sem sofrer');
    s = s.replace(/clean\s*sheet/gi, 'Sem sofrer gols');
    s = s.replace(/\bHome\b/g, 'Casa').replace(/\bAway\b/g, 'Fora');
    return s.trim() || name;
  }

  private translateTeamSpecialOutcome(raw: string): string {
    const lower = raw.trim().toLowerCase();
    if (lower === 'yes' || lower === 'sim') return 'Sim';
    if (lower === 'no' || lower === 'não' || lower === 'nao') return 'Não';
    if (lower === 'home' || lower === 'casa') return 'Casa';
    if (lower === 'away' || lower === 'fora') return 'Fora';
    return this.translateTeamSpecialBetName(raw);
  }

  private mapYesNo(
    values: Array<{ value: unknown; odd: string }>,
    bookmaker: string,
    marketType: MarketType,
  ): ImportedOdd[] {
    return this.mapSimpleSelections(values, bookmaker, marketType, {
      Yes: 'Sim',
      No: 'Não',
    });
  }

  /** Seleção = nome do jogador (mercados Sim/Anytime-like). */
  private mapPlayerNamedLines(
    values: Array<{ value: unknown; odd: string }>,
    bookmaker: string,
    marketType: MarketType,
  ): ImportedOdd[] {
    return values
      .map((v) => {
        const name = oddSelectionText(v.value);
        if (!name || /^(yes|no|over|under)/i.test(name)) return null;
        const odd = parseFloat(v.odd);
        if (!Number.isFinite(odd) || odd <= 1) return null;
        return { marketType, selection: name, value: odd, bookmaker };
      })
      .filter(Boolean) as ImportedOdd[];
  }

  /** Props O/U: "Name - Over 1.5" / "Name Over 0.5". */
  private mapPlayerPropLines(
    values: Array<{ value: unknown; odd: string }>,
    bookmaker: string,
    marketType: MarketType,
  ): ImportedOdd[] {
    return values
      .map((v) => {
        const raw = oddSelectionText(v.value);
        const match = raw.match(
          /^(.+?)\s*[-–]?\s*(Over|Under)\s+([\d.]+)$/i,
        );
        if (!match) {
          // Só nome = Over 0.5 implícito (ex.: to be booked variants)
          if (raw && !/^(over|under|yes|no)$/i.test(raw)) {
            const odd = parseFloat(v.odd);
            if (!Number.isFinite(odd) || odd <= 1) return null;
            return {
              marketType,
              selection: `${raw} Over 0.5`,
              value: odd,
              bookmaker,
            };
          }
          return null;
        }
        const name = match[1].replace(/[-–]\s*$/, '').trim();
        const side =
          match[2].charAt(0).toUpperCase() + match[2].slice(1).toLowerCase();
        const odd = parseFloat(v.odd);
        if (!name || !Number.isFinite(odd) || odd <= 1) return null;
        return {
          marketType,
          selection: `${name} ${side} ${match[3]}`,
          value: odd,
          bookmaker,
        };
      })
      .filter(Boolean) as ImportedOdd[];
  }

  private mapSimpleSelections(
    values: Array<{ value: unknown; odd: string }>,
    bookmaker: string,
    marketType: MarketType,
    mapping: Record<string, string>,
  ): ImportedOdd[] {
    return values
      .map((v) => {
        const key = oddSelectionText(v.value);
        const selection = mapping[key];
        if (!selection) return null;
        const odd = parseFloat(v.odd);
        if (!Number.isFinite(odd) || odd <= 1) return null;
        return { marketType, selection, value: odd, bookmaker };
      })
      .filter(Boolean) as ImportedOdd[];
  }

  private mapExactScoreLines(
    values: Array<{ value: unknown; odd: string }>,
    bookmaker: string,
  ): ImportedOdd[] {
    return values
      .map((v) => {
        const raw = oddSelectionText(v.value);
        const match = raw.match(/^(\d+)\s*[:\-]\s*(\d+)$/);
        if (!match) return null;
        const odd = parseFloat(v.odd);
        if (!Number.isFinite(odd) || odd <= 1) return null;
        return {
          marketType: MarketType.EXACT_SCORE,
          selection: `${match[1]}-${match[2]}`,
          value: odd,
          bookmaker,
        };
      })
      .filter(Boolean) as ImportedOdd[];
  }

  private mapHtFtLines(
    values: Array<{ value: unknown; odd: string }>,
    bookmaker: string,
  ): ImportedOdd[] {
    const side = (token: string): string | null => {
      const t = token.trim().toLowerCase();
      if (t === 'home' || t === '1') return 'Casa';
      if (t === 'draw' || t === 'x') return 'Empate';
      if (t === 'away' || t === '2') return 'Fora';
      return null;
    };

    return values
      .map((v) => {
        const parts = oddSelectionText(v.value).split(/[\/\-]/);
        if (parts.length !== 2) return null;
        const ht = side(parts[0]);
        const ft = side(parts[1]);
        if (!ht || !ft) return null;
        const odd = parseFloat(v.odd);
        if (!Number.isFinite(odd) || odd <= 1) return null;
        return {
          marketType: MarketType.HT_FT,
          selection: `${ht}/${ft}`,
          value: odd,
          bookmaker,
        };
      })
      .filter(Boolean) as ImportedOdd[];
  }

  private mapWinningMarginLines(
    values: Array<{ value: unknown; odd: string }>,
    bookmaker: string,
  ): ImportedOdd[] {
    return values
      .map((v) => {
        const raw = oddSelectionText(v.value);
        const lower = raw.toLowerCase();
        const odd = parseFloat(v.odd);
        if (!Number.isFinite(odd) || odd <= 1) return null;

        let selection: string | null = null;

        const byGoals = lower.match(
          /^(home|away)\s*(?:to\s*win\s*)?by\s*(\d+)\s*(?:\+|or\s*more|goals?)?$/i,
        );
        if (byGoals) {
          const team = byGoals[1].toLowerCase() === 'home' ? 'Casa' : 'Fora';
          const n = byGoals[2];
          const plus =
            lower.includes('+') ||
            lower.includes('or more') ||
            lower.includes('more');
          selection = `${team} por ${n}${plus ? '+' : ''}`;
        }

        const short = lower.match(/^(home|away)\s+(\d+)(\+)?$/i);
        if (!selection && short) {
          const team = short[1].toLowerCase() === 'home' ? 'Casa' : 'Fora';
          selection = `${team} por ${short[2]}${short[3] ? '+' : ''}`;
        }

        if (!selection && /draw|empate|score draw/i.test(lower)) {
          selection = 'Empate';
        }

        if (!selection) return null;
        return {
          marketType: MarketType.WINNING_MARGIN,
          selection,
          value: odd,
          bookmaker,
        };
      })
      .filter(Boolean) as ImportedOdd[];
  }

  private mapHandicapLines(
    values: Array<{ value: unknown; odd: string }>,
    bookmaker: string,
  ): ImportedOdd[] {
    return values
      .map((v) => {
        const match = oddSelectionText(v.value).match(
          /^(Home|Away)\s*([+-][\d.]+)$/i,
        );
        if (!match) return null;

        const side = match[1].toLowerCase() === 'home' ? 'Casa' : 'Fora';
        const line = match[2];
        const odd = parseFloat(v.odd);
        if (!Number.isFinite(odd) || odd <= 1) return null;

        return {
          marketType: MarketType.HANDICAP,
          selection: `${side} ${line}`,
          value: odd,
          bookmaker,
        };
      })
      .filter(Boolean) as ImportedOdd[];
  }

  private mapGoalScorerLines(
    values: Array<{ value: unknown; odd: string }>,
    bookmaker: string,
  ): ImportedOdd[] {
    return values
      .map((v) => {
        const name = oddSelectionText(v.value);
        if (!name || name.toLowerCase() === 'no goalscorer') return null;
        const odd = parseFloat(v.odd);
        if (!Number.isFinite(odd) || odd <= 1) return null;

        return {
          marketType: MarketType.PLAYER,
          selection: name,
          value: odd,
          bookmaker,
        };
      })
      .filter(Boolean) as ImportedOdd[];
  }

  private mapOverUnderLines(
    values: Array<{ value: unknown; odd: string }>,
    bookmaker: string,
    marketType: MarketType,
  ): ImportedOdd[] {
    return values
      .map((v) => {
        const match = oddSelectionText(v.value).match(
          /^(Over|Under)\s+([\d.]+)$/i,
        );
        if (!match) return null;
        const side =
          match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
        const odd = parseFloat(v.odd);
        if (!Number.isFinite(odd) || odd <= 1) return null;
        return {
          marketType,
          selection: `${side} ${match[2]}`,
          value: odd,
          bookmaker,
        };
      })
      .filter(Boolean) as ImportedOdd[];
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
      values: Array<{ value: unknown; odd: string }>;
    }>;
  }>;
}

interface ApiTeamStatistics {
  team: { id: number; name: string };
  statistics: Array<{ type: string; value: string | number | null }>;
}

interface ApiFixturePlayersTeam {
  team: { id: number; name: string };
  players: Array<{
    player: { id: number; name: string };
    statistics: Array<{
      games?: { minutes?: number | null; position?: string; substitute?: boolean };
      goals?: { total?: number | null; assists?: number | null };
      shots?: { total?: number | null; on?: number | null };
    }>;
  }>;
}

interface ApiFixtureLineup {
  team: { id: number; name: string };
  startXI?: Array<{ player: { id: number; name: string } }>;
  substitutes?: Array<{ player: { id: number; name: string } }>;
}

function parseStat(value: string | number | null | undefined): number | undefined {
  if (value === null || value === undefined) return undefined;
  const n = parseFloat(String(value).replace('%', '').trim());
  return Number.isNaN(n) ? undefined : n;
}

/** API-Football às vezes manda value como number/object — nunca chamar .trim() direto. */
function oddSelectionText(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim();
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if ('value' in obj) return oddSelectionText(obj.value);
    if ('name' in obj) return oddSelectionText(obj.name);
  }
  return String(value).trim();
}
