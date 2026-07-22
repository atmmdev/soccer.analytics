import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BankrollPeriodStatus, TicketStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  BankrollEntryType,
  CloseBankrollPeriodDto,
  CreateBankrollEntryDto,
  CreateBankrollPeriodDto,
} from './dto/bankroll.dto';

@Injectable()
export class BankrollService {
  constructor(private prisma: PrismaService) {}

  /** Garante ao menos uma banca aberta e migra entries órfãs. */
  async ensureActivePeriod() {
    let open = await this.prisma.bankrollPeriod.findFirst({
      where: { status: BankrollPeriodStatus.OPEN },
      orderBy: { startsAt: 'desc' },
    });

    if (!open) {
      const orphanSum = await this.prisma.bankrollEntry.aggregate({
        where: { periodId: null },
        _sum: { amount: true },
      });
      const orphanBalance = orphanSum._sum.amount ?? 0;
      const initialAmount = orphanBalance > 0 ? orphanBalance : 1000;

      open = await this.prisma.bankrollPeriod.create({
        data: {
          name: `Banca ${new Date().toLocaleDateString('pt-BR', {
            month: 'long',
            year: 'numeric',
          })}`,
          status: BankrollPeriodStatus.OPEN,
          startsAt: new Date(),
          initialAmount,
        },
      });

      const orphanCount = await this.prisma.bankrollEntry.count({
        where: { periodId: null },
      });

      if (orphanCount > 0) {
        await this.prisma.bankrollEntry.updateMany({
          where: { periodId: null },
          data: { periodId: open.id },
        });
      } else {
        await this.prisma.bankrollEntry.create({
          data: {
            periodId: open.id,
            amount: initialAmount,
            type: BankrollEntryType.DEPOSIT,
            description: 'Depósito inicial da banca',
          },
        });
      }
    } else {
      await this.prisma.bankrollEntry.updateMany({
        where: { periodId: null },
        data: { periodId: open.id },
      });
    }

    return open;
  }

  async listPeriods() {
    await this.ensureActivePeriod();
    return this.prisma.bankrollPeriod.findMany({
      orderBy: [{ startsAt: 'desc' }],
      include: {
        _count: { select: { entries: true } },
      },
    });
  }

  async getPeriod(periodId: string) {
    const period = await this.prisma.bankrollPeriod.findUnique({
      where: { id: periodId },
      include: { _count: { select: { entries: true } } },
    });
    if (!period) throw new NotFoundException('Banca não encontrada');
    return period;
  }

  async createPeriod(dto: CreateBankrollPeriodDto) {
    const existingOpen = await this.prisma.bankrollPeriod.findFirst({
      where: { status: BankrollPeriodStatus.OPEN },
    });
    if (existingOpen) {
      throw new BadRequestException(
        'Já existe uma banca aberta. Feche-a antes de criar outra.',
      );
    }

    const startsAt = dto.startsAt ? new Date(dto.startsAt) : new Date();

    const period = await this.prisma.bankrollPeriod.create({
      data: {
        name: dto.name.trim(),
        status: BankrollPeriodStatus.OPEN,
        startsAt,
        initialAmount: dto.initialAmount,
        notes: dto.notes?.trim() || null,
        entries: {
          create: {
            amount: dto.initialAmount,
            type: BankrollEntryType.DEPOSIT,
            description: 'Depósito inicial da banca',
          },
        },
      },
      include: { _count: { select: { entries: true } } },
    });

    return period;
  }

  async closePeriod(periodId: string, dto: CloseBankrollPeriodDto = {}) {
    const period = await this.getPeriod(periodId);
    if (period.status !== BankrollPeriodStatus.OPEN) {
      throw new BadRequestException('Esta banca já está fechada');
    }

    const balance = await this.getBalance(periodId);

    return this.prisma.bankrollPeriod.update({
      where: { id: periodId },
      data: {
        status: BankrollPeriodStatus.CLOSED,
        endsAt: new Date(),
        closingBalance: balance,
        notes: dto.notes?.trim()
          ? [period.notes, dto.notes.trim()].filter(Boolean).join('\n')
          : period.notes,
      },
      include: { _count: { select: { entries: true } } },
    });
  }

  private async resolvePeriodId(periodId?: string) {
    if (periodId) {
      await this.getPeriod(periodId);
      return periodId;
    }
    const open = await this.ensureActivePeriod();
    return open.id;
  }

  async getBalance(periodId?: string): Promise<number> {
    const id = await this.resolvePeriodId(periodId);
    const agg = await this.prisma.bankrollEntry.aggregate({
      where: { periodId: id },
      _sum: { amount: true },
    });
    return round(agg._sum.amount ?? 0);
  }

  async getSummary(periodId?: string) {
    const id = await this.resolvePeriodId(periodId);
    const period = await this.getPeriod(id);

    const entries = await this.prisma.bankrollEntry.findMany({
      where: { periodId: id },
      orderBy: { createdAt: 'asc' },
    });

    const balance = entries.reduce((sum, e) => sum + e.amount, 0);
    const deposits = entries
      .filter((e) => e.type === BankrollEntryType.DEPOSIT)
      .reduce((sum, e) => sum + e.amount, 0);
    const totalStaked = entries
      .filter((e) => e.type === BankrollEntryType.STAKE)
      .reduce((sum, e) => sum + Math.abs(e.amount), 0);
    const wins = entries.filter((e) => e.type === BankrollEntryType.WIN);
    const losses = entries.filter((e) => e.type === BankrollEntryType.LOSS);

    const profit = balance - deposits;
    const roi = totalStaked > 0 ? round((profit / totalStaked) * 100, 2) : 0;
    const settled = wins.length + losses.length;
    const winRate = settled > 0 ? round((wins.length / settled) * 100, 1) : 0;
    const yieldPct =
      settled > 0
        ? round((profit / settled / (totalStaked / settled || 1)) * 100, 2)
        : 0;

    const history = this.buildHistory(entries);
    const maxDrawdown = this.calculateMaxDrawdown(history);

    const ticketIds = [
      ...new Set(
        entries.map((e) => e.ticketId).filter((tid): tid is string => !!tid),
      ),
    ];
    const tickets = ticketIds.length
      ? await this.prisma.ticket.findMany({
          where: {
            id: { in: ticketIds },
            status: {
              in: [TicketStatus.PLACED, TicketStatus.WON, TicketStatus.LOST],
            },
          },
        })
      : [];

    return {
      period,
      balance: round(balance),
      initialDeposit: round(deposits),
      profit: round(profit),
      roi,
      yield: yieldPct,
      winRate,
      maxDrawdown,
      totalStaked: round(totalStaked),
      ticketsPlaced: tickets.length,
      ticketsWon: wins.length,
      ticketsLost: losses.length,
    };
  }

  async getHistory(periodId?: string) {
    const id = await this.resolvePeriodId(periodId);
    const entries = await this.prisma.bankrollEntry.findMany({
      where: { periodId: id },
      orderBy: { createdAt: 'asc' },
    });
    return this.buildHistory(entries);
  }

  async getEntries(periodId?: string) {
    const id = await this.resolvePeriodId(periodId);
    return this.prisma.bankrollEntry.findMany({
      where: { periodId: id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async createEntry(dto: CreateBankrollEntryDto) {
    if (
      dto.type !== BankrollEntryType.DEPOSIT &&
      dto.type !== BankrollEntryType.WITHDRAWAL
    ) {
      throw new BadRequestException('Apenas depósito ou saque manual permitido');
    }

    const periodId = await this.resolvePeriodId(dto.periodId);
    const period = await this.getPeriod(periodId);
    if (period.status !== BankrollPeriodStatus.OPEN) {
      throw new BadRequestException(
        'Não é possível movimentar uma banca fechada',
      );
    }

    const amount =
      dto.type === BankrollEntryType.WITHDRAWAL
        ? -Math.abs(dto.amount)
        : dto.amount;

    if (dto.type === BankrollEntryType.WITHDRAWAL) {
      const balance = await this.getBalance(periodId);
      if (balance + amount < 0) {
        throw new BadRequestException('Saldo insuficiente para saque');
      }
    }

    return this.prisma.bankrollEntry.create({
      data: {
        periodId,
        amount,
        type: dto.type,
        description: dto.description,
      },
    });
  }

  async placeTicket(ticketId: string) {
    const period = await this.ensureActivePeriod();
    if (period.status !== BankrollPeriodStatus.OPEN) {
      throw new BadRequestException('Nenhuma banca aberta para apostar');
    }

    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) throw new NotFoundException('Bilhete não encontrado');
    if (ticket.status !== TicketStatus.DRAFT) {
      throw new BadRequestException('Bilhete já foi apostado ou liquidado');
    }
    if (!ticket.stake || ticket.stake <= 0) {
      throw new BadRequestException('Stake inválida');
    }

    const balance = await this.getBalance(period.id);
    if (balance < ticket.stake) {
      throw new BadRequestException('Saldo insuficiente na banca');
    }

    await this.prisma.$transaction([
      this.prisma.bankrollEntry.create({
        data: {
          periodId: period.id,
          amount: -ticket.stake,
          type: BankrollEntryType.STAKE,
          description: `Aposta: ${ticket.name ?? ticketId}`,
          ticketId,
        },
      }),
      this.prisma.ticket.update({
        where: { id: ticketId },
        data: { status: TicketStatus.PLACED },
      }),
    ]);

    return this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        selections: {
          include: {
            match: { include: { homeTeam: true, awayTeam: true } },
          },
        },
      },
    });
  }

  async settleTicket(ticketId: string, result: 'WON' | 'LOST' | 'VOID') {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) throw new NotFoundException('Bilhete não encontrado');
    if (ticket.status !== TicketStatus.PLACED) {
      throw new BadRequestException(
        'Bilhete precisa estar apostado para liquidar',
      );
    }

    const stakeEntry = await this.prisma.bankrollEntry.findFirst({
      where: { ticketId, type: BankrollEntryType.STAKE },
      orderBy: { createdAt: 'desc' },
    });
    const periodId =
      stakeEntry?.periodId ?? (await this.ensureActivePeriod()).id;

    const stake = ticket.stake ?? 0;
    const returnAmount =
      ticket.potentialReturn ?? stake * (ticket.combinedOdd ?? 1);

    if (result === 'WON') {
      await this.prisma.$transaction([
        this.prisma.bankrollEntry.create({
          data: {
            periodId,
            amount: returnAmount,
            type: BankrollEntryType.WIN,
            description: `Green: ${ticket.name ?? ticketId}`,
            ticketId,
          },
        }),
        this.prisma.ticket.update({
          where: { id: ticketId },
          data: { status: TicketStatus.WON, actualReturn: returnAmount },
        }),
      ]);
    } else if (result === 'LOST') {
      await this.prisma.$transaction([
        this.prisma.bankrollEntry.create({
          data: {
            periodId,
            amount: 0,
            type: BankrollEntryType.LOSS,
            description: `Red: ${ticket.name ?? ticketId}`,
            ticketId,
          },
        }),
        this.prisma.ticket.update({
          where: { id: ticketId },
          data: { status: TicketStatus.LOST, actualReturn: 0 },
        }),
      ]);
    } else {
      await this.prisma.$transaction([
        this.prisma.bankrollEntry.create({
          data: {
            periodId,
            amount: stake,
            type: BankrollEntryType.REFUND,
            description: `Anulado: ${ticket.name ?? ticketId}`,
            ticketId,
          },
        }),
        this.prisma.ticket.update({
          where: { id: ticketId },
          data: { status: TicketStatus.VOID, actualReturn: stake },
        }),
      ]);
    }

    return this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        selections: {
          include: {
            match: { include: { homeTeam: true, awayTeam: true } },
          },
        },
      },
    });
  }

  private buildHistory(entries: { amount: number; createdAt: Date }[]) {
    let running = 0;
    return entries.map((e) => {
      running += e.amount;
      return {
        date: e.createdAt.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        }),
        value: round(running),
        fullDate: e.createdAt.toISOString(),
      };
    });
  }

  private calculateMaxDrawdown(history: { value: number }[]): number {
    let peak = 0;
    let maxDd = 0;
    for (const point of history) {
      if (point.value > peak) peak = point.value;
      const dd = peak > 0 ? ((peak - point.value) / peak) * 100 : 0;
      if (dd > maxDd) maxDd = dd;
    }
    return round(maxDd, 1);
  }
}

function round(n: number, decimals = 2) {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}
