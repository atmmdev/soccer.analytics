import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TicketStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TicketEngineService } from '../engines/ticket-engine/ticket-engine.service';
import { CalculateTicketDto, CreateTicketDto } from './dto/ticket.dto';

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

    const stake = dto.stake && dto.stake > 0 ? dto.stake : calc.suggestedStake;

    const ticket = await this.prisma.ticket.create({
      data: {
        name: dto.name ?? `Bilhete ${new Date().toLocaleDateString('pt-BR')}`,
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

    return { ...ticket, calculation: calc };
  }

  async findAll() {
    return this.prisma.ticket.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        selections: {
          include: {
            match: {
              include: { homeTeam: true, awayTeam: true },
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

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.ticket.delete({ where: { id } });
    return { deleted: true };
  }
}
