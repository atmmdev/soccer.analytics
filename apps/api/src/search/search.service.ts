import { Injectable } from '@nestjs/common';
import { MatchStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AnalysisService } from '../analysis/analysis.service';

export interface SearchMatchResult {
  id: string;
  label: string;
  competition: string;
  matchDate: string;
  status: MatchStatus;
}

export interface SearchTeamResult {
  id: string;
  name: string;
  country: string | null;
}

export interface SearchMarketResult {
  matchId: string;
  matchLabel: string;
  market: string;
  ev: number;
  recommendation: string;
}

export interface SearchResponse {
  query: string;
  matches: SearchMatchResult[];
  teams: SearchTeamResult[];
  markets: SearchMarketResult[];
}

@Injectable()
export class SearchService {
  constructor(
    private prisma: PrismaService,
    private analysis: AnalysisService,
  ) {}

  async search(rawQuery: string): Promise<SearchResponse> {
    const query = rawQuery.trim();
    if (query.length < 2) {
      return { query, matches: [], teams: [], markets: [] };
    }

    const [matches, teams, markets] = await Promise.all([
      this.searchMatches(query),
      this.searchTeams(query),
      this.searchMarkets(query),
    ]);

    return { query, matches, teams, markets };
  }

  private async searchMatches(query: string): Promise<SearchMatchResult[]> {
    const rows = await this.prisma.match.findMany({
      where: {
        externalId: { not: null },
        OR: [
          { homeTeam: { name: { contains: query, mode: 'insensitive' } } },
          { awayTeam: { name: { contains: query, mode: 'insensitive' } } },
          { competition: { name: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: { homeTeam: true, awayTeam: true, competition: true },
      orderBy: { matchDate: 'desc' },
      take: 8,
    });

    return rows.map((m) => ({
      id: m.id,
      label: `${m.homeTeam.name} vs ${m.awayTeam.name}`,
      competition: m.competition.name,
      matchDate: m.matchDate.toISOString(),
      status: m.status,
    }));
  }

  private async searchTeams(query: string): Promise<SearchTeamResult[]> {
    const rows = await this.prisma.team.findMany({
      where: {
        externalId: { not: null },
        name: { contains: query, mode: 'insensitive' },
      },
      orderBy: { name: 'asc' },
      take: 6,
    });

    return rows.map((t) => ({
      id: t.id,
      name: t.name,
      country: t.country,
    }));
  }

  private async searchMarkets(query: string): Promise<SearchMarketResult[]> {
    const q = query.toLowerCase();
    const all = await this.analysis.getAnalyzedMarkets('all');

    return all
      .filter(
        (m) =>
          m.matchLabel.toLowerCase().includes(q) ||
          m.market.toLowerCase().includes(q) ||
          m.competition.toLowerCase().includes(q),
      )
      .slice(0, 8)
      .map((m) => ({
        matchId: m.matchId,
        matchLabel: m.matchLabel,
        market: m.market,
        ev: Math.round(m.ev * 1000) / 10,
        recommendation: m.recommendation,
      }));
  }
}
