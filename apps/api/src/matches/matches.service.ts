import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, MatchStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MatchQueryDto } from './dto/match-query.dto';
import {
  matchAllowlistFilter,
  readSyncLeagueIds,
} from '../sync/sync-config';

const matchInclude = {
  homeTeam: true,
  awayTeam: true,
  competition: true,
  season: true,
  matchStatistics: true,
} satisfies Prisma.MatchInclude;

@Injectable()
export class MatchesService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  private leagueIds() {
    return readSyncLeagueIds(this.config.get<string>('SYNC_LEAGUE_IDS'));
  }

  async findAll(query: MatchQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.MatchWhereInput = {
      externalId: { not: null },
      ...matchAllowlistFilter(this.leagueIds()),
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.competitionId) {
      where.competitionId = query.competitionId;
    }

    if (query.q) {
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
        {
          OR: [
            { homeTeam: { name: { contains: query.q, mode: 'insensitive' } } },
            { awayTeam: { name: { contains: query.q, mode: 'insensitive' } } },
            { competition: { name: { contains: query.q, mode: 'insensitive' } } },
          ],
        },
      ];
    }

    if (query.date) {
      const [y, m, d] = query.date.split('-').map(Number);
      const start = new Date(y, m - 1, d, 0, 0, 0, 0);
      const end = new Date(y, m - 1, d, 23, 59, 59, 999);
      where.matchDate = { gte: start, lte: end };
    } else if (query.dateFrom) {
      const [y, m, d] = query.dateFrom.split('-').map(Number);
      const start = new Date(y, m - 1, d, 0, 0, 0, 0);
      where.matchDate = { gte: start };
    }

    const orderBy: Prisma.MatchOrderByWithRelationInput = query.dateFrom
      ? { matchDate: 'asc' }
      : { matchDate: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.match.findMany({
        where,
        include: matchInclude,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.match.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    return this.prisma.match.findUniqueOrThrow({
      where: { id },
      include: {
        ...matchInclude,
        odds: { include: { market: true } },
      },
    });
  }

  async getCompetitions() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const leagueIds = this.leagueIds();

    const upcomingMatchFilter: Prisma.MatchWhereInput = {
      externalId: { not: null },
      matchDate: { gte: todayStart },
    };

    return this.prisma.competition.findMany({
      where: {
        externalId: { in: leagueIds },
        matches: { some: upcomingMatchFilter },
      },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            matches: { where: upcomingMatchFilter },
          },
        },
      },
    });
  }

  async getTodayCount() {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    return this.prisma.match.count({
      where: {
        matchDate: { gte: start, lte: end },
        status: { in: [MatchStatus.SCHEDULED, MatchStatus.LIVE] },
        ...matchAllowlistFilter(this.leagueIds()),
      },
    });
  }
}
