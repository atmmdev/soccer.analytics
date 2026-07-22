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
  LinkBankrollTicketsDto,
  UpdateBankrollPeriodDto,
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

    const startsAt = dto.startsAt ? startOfLocalDay(dto.startsAt) : new Date();
    const endsAt = dto.endsAt ? endOfLocalDay(dto.endsAt) : null;

    if (endsAt && endsAt < startsAt) {
      throw new BadRequestException(
        'A data final do período deve ser posterior à inicial',
      );
    }

    const period = await this.prisma.bankrollPeriod.create({
      data: {
        name: dto.name.trim(),
        status: BankrollPeriodStatus.OPEN,
        startsAt,
        endsAt,
        initialAmount: dto.initialAmount,
        notes: dto.notes?.trim() || null,
        ...(dto.initialAmount > 0
          ? {
              entries: {
                create: {
                  amount: dto.initialAmount,
                  type: BankrollEntryType.DEPOSIT,
                  description: 'Depósito inicial da banca',
                },
              },
            }
          : {}),
      },
      include: { _count: { select: { entries: true } } },
    });

    return period;
  }

  async updatePeriod(periodId: string, dto: UpdateBankrollPeriodDto) {
    const period = await this.getPeriod(periodId);

    const startsAt = dto.startsAt
      ? startOfLocalDay(dto.startsAt)
      : period.startsAt;
    const endsAt =
      dto.endsAt === undefined
        ? period.endsAt
        : dto.endsAt === null || dto.endsAt === ''
          ? null
          : endOfLocalDay(dto.endsAt);

    if (endsAt && endsAt < startsAt) {
      throw new BadRequestException(
        'A data final do período deve ser posterior à inicial',
      );
    }

    const previousInitial = period.initialAmount;

    const updated = await this.prisma.bankrollPeriod.update({
      where: { id: periodId },
      data: {
        ...(dto.name != null ? { name: dto.name.trim() } : {}),
        ...(dto.initialAmount != null
          ? { initialAmount: dto.initialAmount }
          : {}),
        ...(dto.startsAt != null ? { startsAt } : {}),
        ...(dto.endsAt !== undefined ? { endsAt } : {}),
        ...(dto.notes !== undefined
          ? { notes: dto.notes?.trim() ? dto.notes.trim() : null }
          : {}),
      },
      include: { _count: { select: { entries: true } } },
    });

    if (
      dto.initialAmount != null &&
      dto.initialAmount !== previousInitial
    ) {
      await this.syncInitialDepositEntry(periodId, dto.initialAmount);
    }

    return updated;
  }

  /**
   * Mantém um único lançamento de depósito inicial alinhado ao valor da banca.
   * Remove duplicatas antigas ("Depósito inicial" / "Depósito inicial da banca").
   */
  private async syncInitialDepositEntry(periodId: string, amount: number) {
    const initials = await this.prisma.bankrollEntry.findMany({
      where: {
        periodId,
        type: BankrollEntryType.DEPOSIT,
        OR: [
          { description: 'Depósito inicial' },
          { description: 'Depósito inicial da banca' },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    if (amount <= 0) {
      if (initials.length > 0) {
        await this.prisma.bankrollEntry.deleteMany({
          where: { id: { in: initials.map((e) => e.id) } },
        });
      }
      return;
    }

    if (initials.length === 0) {
      await this.prisma.bankrollEntry.create({
        data: {
          periodId,
          amount,
          type: BankrollEntryType.DEPOSIT,
          description: 'Depósito inicial da banca',
        },
      });
      return;
    }

    const [keep, ...extras] = initials;
    await this.prisma.bankrollEntry.update({
      where: { id: keep.id },
      data: {
        amount,
        description: 'Depósito inicial da banca',
      },
    });

    if (extras.length > 0) {
      await this.prisma.bankrollEntry.deleteMany({
        where: { id: { in: extras.map((e) => e.id) } },
      });
    }
  }

  async closePeriod(periodId: string, dto: CloseBankrollPeriodDto = {}) {
    const period = await this.getPeriod(periodId);
    if (period.status !== BankrollPeriodStatus.OPEN) {
      throw new BadRequestException('Esta banca já está fechada');
    }

    const balance = await this.getBalance(periodId);
    const now = new Date();
    // Mantém o fim planejado se já estiver no passado; senão fecha agora.
    const endsAt =
      period.endsAt && period.endsAt.getTime() <= now.getTime()
        ? period.endsAt
        : now;

    return this.prisma.bankrollPeriod.update({
      where: { id: periodId },
      data: {
        status: BankrollPeriodStatus.CLOSED,
        endsAt,
        closingBalance: balance,
        notes: dto.notes?.trim()
          ? [period.notes, dto.notes.trim()].filter(Boolean).join('\n')
          : period.notes,
      },
      include: { _count: { select: { entries: true } } },
    });
  }

  /** Bilhetes vinculados + candidatos (estudo / sistema) no intervalo da banca. */
  async getCorrelatedTickets(periodId: string) {
    const period = await this.getPeriod(periodId);
    const from = period.startsAt;
    const to = period.endsAt ?? new Date();

    const [linkedStudy, candidateStudy, linkedSystem, candidateSystem] =
      await Promise.all([
        this.prisma.studyTicket.findMany({
          where: { bankrollPeriodId: periodId },
          orderBy: { placedAt: 'desc' },
          include: { legs: { orderBy: { sortOrder: 'asc' }, take: 3 } },
        }),
        this.prisma.studyTicket.findMany({
          where: {
            bankrollPeriodId: null,
            placedAt: { gte: from, lte: to },
          },
          orderBy: { placedAt: 'desc' },
          take: 100,
          include: { legs: { orderBy: { sortOrder: 'asc' }, take: 3 } },
        }),
        this.prisma.ticket.findMany({
          where: {
            bankrollPeriodId: periodId,
            status: { not: TicketStatus.DRAFT },
          },
          orderBy: { createdAt: 'desc' },
          include: {
            selections: {
              include: {
                match: { include: { homeTeam: true, awayTeam: true } },
              },
            },
          },
        }),
        this.prisma.ticket.findMany({
          where: {
            bankrollPeriodId: null,
            createdAt: { gte: from, lte: to },
            status: { not: TicketStatus.DRAFT },
          },
          orderBy: { createdAt: 'desc' },
          take: 100,
          include: {
            selections: {
              include: {
                match: { include: { homeTeam: true, awayTeam: true } },
              },
            },
          },
        }),
      ]);

    const mapStudy = (
      tickets: typeof linkedStudy,
      linked: boolean,
    ) => {
      const stake = tickets.reduce((s, t) => s + (t.stake ?? 0), 0);
      const actualReturn = tickets.reduce(
        (s, t) => s + (t.actualReturn ?? 0),
        0,
      );
      return {
        count: tickets.length,
        stake: round(stake),
        actualReturn: round(actualReturn),
        profit: round(actualReturn - stake),
        won: tickets.filter((t) => t.status === 'WON').length,
        lost: tickets.filter((t) => t.status === 'LOST').length,
        pending: tickets.filter((t) => t.status === 'PENDING').length,
        tickets: tickets.map((t) => ({
          id: t.id,
          sourceFile: t.sourceFile,
          placedAt: t.placedAt,
          betType: t.betType,
          betLabel: t.betLabel,
          status: t.status,
          stake: t.stake,
          combinedOdd: t.combinedOdd,
          actualReturn: t.actualReturn,
          legsPreview: t.legs.map((l) => l.matchLabel).slice(0, 2),
          linked,
        })),
      };
    };

    const mapSystem = (
      tickets: typeof linkedSystem,
      linked: boolean,
    ) => ({
      count: tickets.length,
      stake: round(tickets.reduce((s, t) => s + (t.stake ?? 0), 0)),
      won: tickets.filter((t) => t.status === TicketStatus.WON).length,
      lost: tickets.filter((t) => t.status === TicketStatus.LOST).length,
      tickets: tickets.map((t) => ({
        id: t.id,
        name: t.name,
        status: t.status,
        createdAt: t.createdAt,
        stake: t.stake,
        combinedOdd: t.combinedOdd,
        actualReturn: t.actualReturn,
        selections: t.selections.length,
        linked,
      })),
    });

    return {
      period: {
        id: period.id,
        name: period.name,
        status: period.status,
        startsAt: period.startsAt,
        endsAt: period.endsAt,
      },
      range: { from, to },
      study: mapStudy(linkedStudy, true),
      system: mapSystem(linkedSystem, true),
      candidates: {
        study: mapStudy(candidateStudy, false),
        system: mapSystem(candidateSystem, false),
      },
    };
  }

  async linkTickets(periodId: string, dto: LinkBankrollTicketsDto) {
    const period = await this.getPeriod(periodId);
    if (period.status !== BankrollPeriodStatus.OPEN) {
      throw new BadRequestException(
        'Só é possível vincular bilhetes a uma banca aberta',
      );
    }

    const studyTicketIds = [...new Set(dto.studyTicketIds ?? [])];
    const ticketIds = [...new Set(dto.ticketIds ?? [])];

    if (!studyTicketIds.length && !ticketIds.length) {
      throw new BadRequestException('Selecione ao menos um bilhete');
    }

    await this.prisma.$transaction([
      ...(studyTicketIds.length
        ? [
            this.prisma.studyTicket.updateMany({
              where: { id: { in: studyTicketIds } },
              data: { bankrollPeriodId: periodId },
            }),
          ]
        : []),
      ...(ticketIds.length
        ? [
            this.prisma.ticket.updateMany({
              where: {
                id: { in: ticketIds },
                status: { not: TicketStatus.DRAFT },
              },
              data: { bankrollPeriodId: periodId },
            }),
          ]
        : []),
    ]);

    return this.getCorrelatedTickets(periodId);
  }

  async unlinkTickets(periodId: string, dto: LinkBankrollTicketsDto) {
    await this.getPeriod(periodId);

    const studyTicketIds = [...new Set(dto.studyTicketIds ?? [])];
    const ticketIds = [...new Set(dto.ticketIds ?? [])];

    if (!studyTicketIds.length && !ticketIds.length) {
      throw new BadRequestException('Selecione ao menos um bilhete');
    }

    await this.prisma.$transaction([
      ...(studyTicketIds.length
        ? [
            this.prisma.studyTicket.updateMany({
              where: {
                id: { in: studyTicketIds },
                bankrollPeriodId: periodId,
              },
              data: { bankrollPeriodId: null },
            }),
          ]
        : []),
      ...(ticketIds.length
        ? [
            this.prisma.ticket.updateMany({
              where: {
                id: { in: ticketIds },
                bankrollPeriodId: periodId,
              },
              data: { bankrollPeriodId: null },
            }),
          ]
        : []),
    ]);

    return this.getCorrelatedTickets(periodId);
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
      initialDeposit: round(period.initialAmount),
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

  async updateEntry(
    entryId: string,
    dto: { amount?: number; description?: string | null },
  ) {
    const entry = await this.prisma.bankrollEntry.findUnique({
      where: { id: entryId },
    });
    if (!entry) throw new NotFoundException('Lançamento não encontrado');
    if (
      entry.type !== BankrollEntryType.DEPOSIT &&
      entry.type !== BankrollEntryType.WITHDRAWAL
    ) {
      throw new BadRequestException(
        'Só é possível editar depósito ou saque manual',
      );
    }
    if (!entry.periodId) {
      throw new BadRequestException('Lançamento sem banca vinculada');
    }

    const period = await this.getPeriod(entry.periodId);
    if (period.status !== BankrollPeriodStatus.OPEN) {
      throw new BadRequestException(
        'Não é possível editar lançamentos de uma banca fechada',
      );
    }

    const nextAmountAbs =
      dto.amount != null ? Math.abs(dto.amount) : Math.abs(entry.amount);
    const signedAmount =
      entry.type === BankrollEntryType.WITHDRAWAL
        ? -nextAmountAbs
        : nextAmountAbs;

    if (entry.type === BankrollEntryType.WITHDRAWAL) {
      const balance = await this.getBalance(entry.periodId);
      const projected = balance - entry.amount + signedAmount;
      if (projected < 0) {
        throw new BadRequestException('Saldo insuficiente para este saque');
      }
    }

    const description =
      dto.description === undefined
        ? entry.description
        : dto.description?.trim()
          ? dto.description.trim()
          : null;

    const updated = await this.prisma.bankrollEntry.update({
      where: { id: entryId },
      data: {
        amount: signedAmount,
        ...(dto.description !== undefined ? { description } : {}),
      },
    });

    if (
      entry.type === BankrollEntryType.DEPOSIT &&
      this.isInitialDepositDescription(entry.description)
    ) {
      await this.prisma.bankrollPeriod.update({
        where: { id: entry.periodId },
        data: { initialAmount: nextAmountAbs },
      });
    }

    return updated;
  }

  async deleteEntry(entryId: string) {
    const entry = await this.prisma.bankrollEntry.findUnique({
      where: { id: entryId },
    });
    if (!entry) throw new NotFoundException('Lançamento não encontrado');
    if (
      entry.type !== BankrollEntryType.DEPOSIT &&
      entry.type !== BankrollEntryType.WITHDRAWAL
    ) {
      throw new BadRequestException(
        'Só é possível remover depósito ou saque manual',
      );
    }
    if (!entry.periodId) {
      throw new BadRequestException('Lançamento sem banca vinculada');
    }

    const period = await this.getPeriod(entry.periodId);
    if (period.status !== BankrollPeriodStatus.OPEN) {
      throw new BadRequestException(
        'Não é possível remover lançamentos de uma banca fechada',
      );
    }

    await this.prisma.bankrollEntry.delete({ where: { id: entryId } });

    if (
      entry.type === BankrollEntryType.DEPOSIT &&
      this.isInitialDepositDescription(entry.description)
    ) {
      await this.prisma.bankrollPeriod.update({
        where: { id: entry.periodId },
        data: { initialAmount: 0 },
      });
    }

    return { ok: true, id: entryId };
  }

  private isInitialDepositDescription(description?: string | null) {
    return (
      description === 'Depósito inicial' ||
      description === 'Depósito inicial da banca'
    );
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

/** Interpreta YYYY-MM-DD (ou ISO) como início do dia local. */
function startOfLocalDay(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00`);
  }
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Interpreta YYYY-MM-DD (ou ISO) como fim do dia local. */
function endOfLocalDay(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T23:59:59.999`);
  }
  const d = new Date(value);
  d.setHours(23, 59, 59, 999);
  return d;
}
