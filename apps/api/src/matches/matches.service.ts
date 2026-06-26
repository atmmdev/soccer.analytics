import { Injectable } from '@nestjs/common';
import { Prisma, MatchStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MatchQueryDto } from './dto/match-query.dto';

const matchInclude = {
  homeTeam: true,
  awayTeam: true,
  competition: true,
  season: true,
  matchStatistics: true,
} satisfies Prisma.MatchInclude;

@Injectable()
export class MatchesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: MatchQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.MatchWhereInput = {
      externalId: { not: null },
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
      const start = new Date(`${query.date}T00:00:00.000Z`);
      const end = new Date(`${query.date}T23:59:59.999Z`);
      where.matchDate = { gte: start, lte: end };
    }

    const [data, total] = await Promise.all([
      this.prisma.match.findMany({
        where,
        include: matchInclude,
        orderBy: { matchDate: 'desc' },
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
    return this.prisma.competition.findMany({
      where: {
        matches: { some: { externalId: { not: null } } },
      },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            matches: { where: { externalId: { not: null } } },
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
      },
    });
  }
}
