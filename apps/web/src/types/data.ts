export interface DataProviderStatus {
  name: string;
  configured: boolean;
  message: string;
}

export interface DataStatus {
  providers: DataProviderStatus[];
}

export interface ImportFixturesResult {
  provider: string;
  date: string;
  fixturesFound: number;
  fixturesCreated: number;
  fixturesUpdated: number;
  errors: string[];
}

export interface ImportOddsResult {
  provider: string;
  date: string;
  fixturesWithOdds: number;
  matchesProcessed: number;
  oddsCreated: number;
  skippedNoOdds: number;
  errors: string[];
}

export interface ImportStatisticsResult {
  provider: string;
  date: string;
  matchesProcessed: number;
  statisticsCreated: number;
  statisticsUpdated: number;
  remainingWithoutStats: number;
  errors: string[];
}
