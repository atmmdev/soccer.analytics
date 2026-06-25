import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TicketStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BankrollEntryType, CreateBankrollEntryDto } from './dto/bankroll.dto';

const INITIAL_BANKROLL = 1000;

@Injectable()
export class BankrollService {
  constructor(private prisma: PrismaService) {}

  async ensureInitialDeposit() {
    const count = await this.prisma.bankrollEntry.count();
    if (count === 0) {
      await this.prisma.bankrollEntry.create({
        data: {
          amount: INITIAL_BANKROLL,
          type: BankrollEntryType.DEPOSIT,
          description: 'Depósito inicial',
        },
      });
    }
  }

  async getBalance(): Promise<number> {
    await this.ensureInitialDeposit();
    const agg = await this.prisma.bankrollEntry.aggregate({ _sum: { amount: true } });
    return round(agg._sum.amount ?? 0);
  }

  async getSummary() {
    await this.ensureInitialDeposit();

    const entries = await this.prisma.bankrollEntry.findMany({
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
      settled > 0 ? round((profit / settled / (totalStaked / settled || 1)) * 100, 2) : 0;

    const history = this.buildHistory(entries);
    const maxDrawdown = this.calculateMaxDrawdown(history);

    const tickets = await this.prisma.ticket.findMany({
      where: { status: { in: [TicketStatus.PLACED, TicketStatus.WON, TicketStatus.LOST] } },
    });

    return {
      balance: round(balance),
      initialDeposit: round(deposits),
      profit: round(profit),
      roi,
      yield: yieldPct,
      winRate,
      maxDrawdown,
      totalStaked: round(totalStaked),
      ticketsPlaced: tickets.filter((t) => t.status !== TicketStatus.DRAFT).length,
      ticketsWon: wins.length,
      ticketsLost: losses.length,
    };
  }

  async getHistory() {
    await this.ensureInitialDeposit();
    const entries = await this.prisma.bankrollEntry.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return this.buildHistory(entries);
  }

  async getEntries() {
    await this.ensureInitialDeposit();
    return this.prisma.bankrollEntry.findMany({
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

    const amount =
      dto.type === BankrollEntryType.WITHDRAWAL ? -Math.abs(dto.amount) : dto.amount;

    if (dto.type === BankrollEntryType.WITHDRAWAL) {
      const balance = await this.getBalance();
      if (balance + amount < 0) {
        throw new BadRequestException('Saldo insuficiente para saque');
      }
    }

    return this.prisma.bankrollEntry.create({
      data: {
        amount,
        type: dto.type,
        description: dto.description,
      },
    });
  }

  async placeTicket(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Bilhete não encontrado');
    if (ticket.status !== TicketStatus.DRAFT) {
      throw new BadRequestException('Bilhete já foi apostado ou liquidado');
    }
    if (!ticket.stake || ticket.stake <= 0) {
      throw new BadRequestException('Stake inválida');
    }

    const balance = await this.getBalance();
    if (balance < ticket.stake) {
      throw new BadRequestException('Saldo insuficiente na banca');
    }

    await this.prisma.$transaction([
      this.prisma.bankrollEntry.create({
        data: {
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
          include: { match: { include: { homeTeam: true, awayTeam: true } } },
        },
      },
    });
  }

  async settleTicket(ticketId: string, result: 'WON' | 'LOST' | 'VOID') {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Bilhete não encontrado');
    if (ticket.status !== TicketStatus.PLACED) {
      throw new BadRequestException('Bilhete precisa estar apostado para liquidar');
    }

    const stake = ticket.stake ?? 0;
    const returnAmount = ticket.potentialReturn ?? stake * (ticket.combinedOdd ?? 1);

    if (result === 'WON') {
      await this.prisma.$transaction([
        this.prisma.bankrollEntry.create({
          data: {
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
          include: { match: { include: { homeTeam: true, awayTeam: true } } },
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

  private calculateMaxDrawdown(
    history: { value: number }[],
  ): number {
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
