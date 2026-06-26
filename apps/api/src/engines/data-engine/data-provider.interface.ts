import { MarketType, MatchStatus } from '@prisma/client';

export interface ImportedCompetition {
  externalId: string;
  name: string;
  country?: string;
  logoUrl?: string;
}

export interface ImportedTeam {
  externalId: string;
  name: string;
  shortName?: string;
  logoUrl?: string;
  country?: string;
}

export interface ImportedFixture {
  externalId: string;
  matchDate: Date;
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
  round?: string;
  venue?: string;
  competition: ImportedCompetition;
  homeTeam: ImportedTeam;
  awayTeam: ImportedTeam;
}

export interface ImportedOdd {
  marketType: MarketType;
  selection: string;
  value: number;
  bookmaker?: string;
}

export interface DataProviderStatus {
  name: string;
  configured: boolean;
  message: string;
}

export interface ImportedMatchStatistics {
  homePossession?: number;
  awayPossession?: number;
  homeShots?: number;
  awayShots?: number;
  homeShotsOnTarget?: number;
  awayShotsOnTarget?: number;
  homeCorners?: number;
  awayCorners?: number;
  homeYellowCards?: number;
  awayYellowCards?: number;
  homeRedCards?: number;
  awayRedCards?: number;
  homeXG?: number;
  awayXG?: number;
}

export interface ImportedPlayerPerformance {
  playerExternalId: string;
  playerName: string;
  teamExternalId: string;
  position?: string;
  minutes: number;
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  wasStarter: boolean;
}

export interface ImportedLineupPlayer {
  playerExternalId: string;
  playerName: string;
  teamExternalId: string;
  isStarter: boolean;
}

export interface DataProvider {
  readonly name: string;
  getStatus(): DataProviderStatus;
  fetchFixtures(date: string): Promise<ImportedFixture[]>;
  fetchOdds(fixtureExternalId: string): Promise<ImportedOdd[]>;
  fetchOddsByDate(date: string): Promise<Map<string, ImportedOdd[]>>;
  fetchFixtureStatistics(
    fixtureExternalId: string,
    homeTeamExternalId: string,
  ): Promise<ImportedMatchStatistics | null>;
  fetchFixturePlayers(fixtureExternalId: string): Promise<ImportedPlayerPerformance[]>;
  fetchFixtureLineups(fixtureExternalId: string): Promise<ImportedLineupPlayer[]>;
}
