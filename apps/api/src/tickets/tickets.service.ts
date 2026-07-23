import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TicketStatus } from '@prisma/client';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { PrismaService } from '../prisma/prisma.service';
import { TicketEngineService } from '../engines/ticket-engine/ticket-engine.service';
import { CalculateTicketDto, CreateTicketDto, UpdateTicketDto } from './dto/ticket.dto';
import {
  betTypeFromLegs,
  formatStudyTicketCode,
  studyTicketMonthFolder,
} from './study-ticket-code';

const BILHETES_APP_ROOT = resolve(
  process.cwd(),
  '../../docs/betting/data/bilhetes/app',
);

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private ticketEngine: TicketEngineService,
  ) {}

  calculate(dto: CalculateTicketDto) {
    if (!dto.selections.length) {
      throw new BadRequestException('Adicione ao menos uma seleção');
    }

    return this.ticketEngine.calculate(
      dto.selections,
      dto.stake,
      dto.bankroll,
    );
  }

  async create(dto: CreateTicketDto) {
    const calc = this.calculate(dto);
    if (!calc.valid) {
      throw new BadRequestException({
        message: 'Bilhete inválido por correlação entre mercados',
        warnings: calc.warnings,
      });
    }

    const now = new Date();
    const code =
      dto.name?.match(/^\d{8}-\d{6}hs$/) != null
        ? dto.name
        : formatStudyTicketCode(now);
    const stake = dto.stake && dto.stake > 0 ? dto.stake : calc.suggestedStake;

    const ticket = await this.prisma.ticket.create({
      data: {
        name: code,
        status: TicketStatus.DRAFT,
        combinedOdd: calc.combinedOdd,
        stake,
        potentialReturn: calc.potentialReturn,
        overallEV: calc.overallEV,
        selections: {
          create: dto.selections.map((s) => ({
            matchId: s.matchId,
            marketType: s.marketType,
            selection: s.selection,
            odd: s.odd,
            probability: s.probability,
            ev: s.ev,
            confidence: s.confidence,
          })),
        },
      },
      include: {
        selections: {
          include: {
            match: {
              include: { homeTeam: true, awayTeam: true, competition: true },
            },
          },
        },
      },
    });

    const studyJson = this.buildStudyJson(ticket, calc, code, now);
    const jsonPath = this.writeStudyJson(studyJson, code, now);

    return {
      ...ticket,
      calculation: calc,
      studyJson,
      studyJsonPath: jsonPath,
    };
  }

  private buildStudyJson(
    ticket: {
      id: string;
      stake: number | null;
      combinedOdd: number | null;
      potentialReturn: number | null;
      overallEV: number | null;
      selections: Array<{
        matchId: string;
        marketType: string;
        selection: string;
        odd: number;
        probability: number | null;
        ev: number | null;
        confidence: number | null;
        match: {
          homeTeam: { name: string };
          awayTeam: { name: string };
          competition?: { name: string } | null;
        };
      }>;
    },
    calc: {
      combinedOdd: number;
      combinedProbability: number | null;
      overallEV: number | null;
      potentialReturn: number | null;
      valid: boolean;
      warnings: unknown[];
    },
    code: string,
    placedAt: Date,
  ) {
    const year = placedAt.getFullYear();
    const month = studyTicketMonthFolder(placedAt);
    const relativePath = `docs/betting/data/bilhetes/app/${year}/${month}/${code}.json`;

    return {
      _meta: {
        exportedAt: new Date().toISOString(),
        source: 'ticket-builder',
        ticketId: ticket.id,
        curated: true,
        needsReview: false,
      },
      sourceFile: relativePath,
      bet365Ref: null,
      placedAt: placedAt.toISOString(),
      betType: betTypeFromLegs(ticket.selections.length),
      betLabel: 'App — Montar bilhete',
      status: 'PENDING',
      stake: ticket.stake ?? 0,
      unitStake: ticket.stake ?? 0,
      numBets: 1,
      combinedOdd: ticket.combinedOdd,
      potentialReturn: ticket.potentialReturn,
      actualReturn: null,
      cashOut: null,
      hasOddsBoost: false,
      overallEV: ticket.overallEV,
      needsReview: false,
      legs: ticket.selections.map((s, index) => {
        const matchLabel = `${s.match.homeTeam.name} vs ${s.match.awayTeam.name}`;
        return {
          sortOrder: index,
          builderGroup: null,
          matchId: s.matchId,
          matchLabel,
          matchDate: null,
          competition: s.match.competition?.name ?? null,
          market: s.marketType,
          selection: s.selection,
          period: null,
          odd: s.odd,
          boostedOdd: null,
          status: null,
          probability: s.probability,
          ev: s.ev,
          confidence: s.confidence,
          meta: {
            source: 'ticket-builder',
          },
        };
      }),
      calculation: {
        combinedOdd: calc.combinedOdd,
        combinedProbability: calc.combinedProbability,
        overallEV: calc.overallEV,
        potentialReturn: calc.potentialReturn,
        valid: calc.valid,
        warnings: calc.warnings,
      },
    };
  }

  private writeStudyJson(
    studyJson: Record<string, unknown>,
    code: string,
    placedAt: Date,
  ): string {
    const year = placedAt.getFullYear();
    const month = studyTicketMonthFolder(placedAt);
    const absPath = resolve(BILHETES_APP_ROOT, String(year), month, `${code}.json`);
    mkdirSync(dirname(absPath), { recursive: true });
    writeFileSync(absPath, JSON.stringify(studyJson, null, 2), 'utf8');
    return absPath;
  }

  async findAll() {
    return this.prisma.ticket.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        selections: {
          include: {
            match: {
              include: { homeTeam: true, awayTeam: true, competition: true },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        selections: {
          include: {
            match: {
              include: { homeTeam: true, awayTeam: true, competition: true },
            },
          },
        },
      },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async update(id: string, dto: UpdateTicketDto) {
    const existing = await this.findOne(id);

    if (dto.selections?.length) {
      for (const sel of dto.selections) {
        const owned = existing.selections.some((s) => s.id === sel.id);
        if (!owned) {
          throw new BadRequestException(
            `Seleção ${sel.id} não pertence a este bilhete`,
          );
        }
        await this.prisma.ticketSelection.update({
          where: { id: sel.id },
          data: {
            ...(sel.odd != null ? { odd: sel.odd } : {}),
            ...(sel.probability != null
              ? { probability: sel.probability }
              : {}),
            ...(sel.ev != null ? { ev: sel.ev } : {}),
            ...(sel.confidence != null ? { confidence: sel.confidence } : {}),
          },
        });
      }
    }

    const refreshed = await this.findOne(id);
    const stake =
      dto.stake != null && dto.stake >= 0
        ? dto.stake
        : (refreshed.stake ?? 0);

    let calc: {
      combinedOdd: number;
      combinedProbability: number | null;
      overallEV: number | null;
      potentialReturn: number | null;
      valid: boolean;
      warnings: unknown[];
      suggestedStake: number;
    } | null = null;

    if (refreshed.selections.length > 0) {
      calc = this.ticketEngine.calculate(
        refreshed.selections.map((s) => ({
          matchId: s.matchId,
          marketType: s.marketType,
          selection: s.selection,
          odd: s.odd,
          probability: s.probability ?? undefined,
          ev: s.ev ?? undefined,
          confidence: s.confidence ?? undefined,
        })),
        stake,
      );
    }

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: {
        ...(dto.name != null ? { name: dto.name } : {}),
        ...(dto.status != null ? { status: dto.status } : {}),
        stake,
        ...(dto.actualReturn !== undefined
          ? { actualReturn: dto.actualReturn }
          : {}),
        ...(calc
          ? {
              combinedOdd: calc.combinedOdd,
              potentialReturn: calc.potentialReturn,
              overallEV: calc.overallEV,
            }
          : {}),
      },
      include: {
        selections: {
          include: {
            match: {
              include: { homeTeam: true, awayTeam: true, competition: true },
            },
          },
        },
      },
    });

    const code = updated.name;
    if (code && /^\d{8}-\d{6}hs$/.test(code) && calc) {
      const studyJson = this.buildStudyJson(
        updated,
        calc,
        code,
        updated.createdAt,
      );
      this.writeStudyJson(studyJson, code, updated.createdAt);
    }

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.ticket.delete({ where: { id } });
    return { deleted: true };
  }
}
