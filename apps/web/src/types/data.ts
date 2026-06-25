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
  matchesProcessed: number;
  oddsCreated: number;
  errors: string[];
}
