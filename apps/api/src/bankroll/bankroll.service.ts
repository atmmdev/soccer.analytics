import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BankrollPeriodStatus, StudyTicketStatus, TicketStatus } from '@prisma/client';
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

  /**
   * Fecha bancas abertas cujo período já acabou e autoClose está ativo.
   * Migrates orphan entries to the most recent open period when one exists.
   */
  async closeExpiredPeriods() {
    const now = new Date();
    const expired = await this.prisma.bankrollPeriod.findMany({
      where: {
        status: BankrollPeriodStatus.OPEN,
        autoClose: true,
        endsAt: { not: null, lte: now },
      },
    });

    for (const period of expired) {
      const agg = await this.prisma.bankrollEntry.aggregate({
        where: { periodId: period.id },
        _sum: { amount: true },
      });
      await this.prisma.bankrollPeriod.update({
        where: { id: period.id },
        data: {
          status: BankrollPeriodStatus.CLOSED,
          closingBalance: round(agg._sum.amount ?? 0),
        },
      });
    }

    return expired.length;
  }

  /** Preferência: banca aberta mais recente (não cria automaticamente). */
  async findPreferredOpenPeriod() {
    await this.closeExpiredPeriods();
    const open = await this.prisma.bankrollPeriod.findFirst({
      where: { status: BankrollPeriodStatus.OPEN },
      orderBy: [{ startsAt: 'desc' }, { createdAt: 'desc' }],
    });

    if (open) {
      await this.prisma.bankrollEntry.updateMany({
        where: { periodId: null },
        data: { periodId: open.id },
      });
    }

    return open;
  }

  /** Exige uma banca aberta (para apostas sem periodId explícito). */
  async ensureActivePeriod() {
    const open = await this.findPreferredOpenPeriod();
    if (!open) {
      throw new BadRequestException(
        'Nenhuma banca aberta. Crie ou reabra um período para continuar.',
      );
    }
    return open;
  }

  async listPeriods() {
    await this.closeExpiredPeriods();
    await this.findPreferredOpenPeriod();
    return this.prisma.bankrollPeriod.findMany({
      orderBy: [{ startsAt: 'desc' }, { createdAt: 'desc' }],
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
    const startsAt = dto.startsAt ? startOfLocalDay(dto.startsAt) : new Date();
    const endsAt = dto.endsAt ? endOfLocalDay(dto.endsAt) : null;
    const autoClose = dto.autoClose ?? true;

    if (endsAt && endsAt < startsAt) {
      throw new BadRequestException(
        'A data final do período deve ser posterior à inicial',
      );
    }

    if (autoClose && !endsAt) {
      throw new BadRequestException(
        'Informe o fim do período para fechamento automático, ou desative o fechamento automático',
      );
    }

    const period = await this.prisma.bankrollPeriod.create({
      data: {
        name: dto.name.trim(),
        status: BankrollPeriodStatus.OPEN,
        startsAt,
        endsAt,
        autoClose,
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

    const studyTicketIds = [...new Set(dto.studyTicketIds ?? [])];
    const ticketIds = [...new Set(dto.ticketIds ?? [])];
    if (studyTicketIds.length || ticketIds.length) {
      await this.assignExclusiveTickets(period.id, studyTicketIds, ticketIds);
    }

    return this.getPeriod(period.id);
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
    const autoClose =
      dto.autoClose !== undefined ? dto.autoClose : period.autoClose;

    if (endsAt && endsAt < startsAt) {
      throw new BadRequestException(
        'A data final do período deve ser posterior à inicial',
      );
    }

    if (autoClose && !endsAt) {
      throw new BadRequestException(
        'Informe o fim do período para fechamento automático, ou desative o fechamento automático',
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
        ...(dto.autoClose !== undefined ? { autoClose: dto.autoClose } : {}),
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
    const endsAt = period.endsAt ?? now;

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

  async reopenPeriod(periodId: string) {
    const period = await this.getPeriod(periodId);
    if (period.status !== BankrollPeriodStatus.CLOSED) {
      throw new BadRequestException('Esta banca já está aberta');
    }

    // Desativa autoClose: se endsAt já passou, closeExpiredPeriods fecharia de novo.
    return this.prisma.bankrollPeriod.update({
      where: { id: periodId },
      data: {
        status: BankrollPeriodStatus.OPEN,
        closingBalance: null,
        autoClose: false,
      },
      include: { _count: { select: { entries: true } } },
    });
  }

  async deletePeriod(periodId: string) {
    const period = await this.getPeriod(periodId);
    await this.prisma.bankrollPeriod.delete({ where: { id: periodId } });
    return { ok: true, id: periodId, name: period.name };
  }

  /** Bilhetes livres (sem banca) — todos do sistema, opcionalmente no intervalo. */
  async getAvailableTickets(startsAt?: string, endsAt?: string) {
    const from = startsAt ? startOfLocalDay(startsAt) : null;
    const to = endsAt
      ? endOfLocalDay(endsAt)
      : startsAt
        ? endOfLocalDay(startsAt)
        : null;

    if (from && to && to < from) {
      throw new BadRequestException(
        'A data final do período deve ser posterior à inicial',
      );
    }

    const studyDate =
      from && to ? { placedAt: { gte: from, lte: to } } : {};
    const systemDate =
      from && to ? { createdAt: { gte: from, lte: to } } : {};

    const [candidateStudy, candidateSystem] = await Promise.all([
      this.prisma.studyTicket.findMany({
        where: {
          bankrollPeriodId: null,
          ...studyDate,
        },
        orderBy: { placedAt: 'desc' },
        include: { legs: { orderBy: { sortOrder: 'asc' }, take: 3 } },
      }),
      this.prisma.ticket.findMany({
        where: {
          bankrollPeriodId: null,
          status: { not: TicketStatus.DRAFT },
          ...systemDate,
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
    ]);

    return {
      range: {
        from: from ?? null,
        to: to ?? null,
      },
      study: this.mapStudyTickets(candidateStudy, false),
      system: this.mapSystemTickets(candidateSystem, false),
    };
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

    return {
      period: {
        id: period.id,
        name: period.name,
        status: period.status,
        startsAt: period.startsAt,
        endsAt: period.endsAt,
      },
      range: { from, to },
      study: this.mapStudyTickets(linkedStudy, true),
      system: this.mapSystemTickets(linkedSystem, true),
      candidates: {
        study: this.mapStudyTickets(candidateStudy, false),
        system: this.mapSystemTickets(candidateSystem, false),
      },
    };
  }

  private mapStudyTickets(
    tickets: Array<{
      id: string;
      sourceFile: string;
      placedAt: Date;
      betType: string | null;
      betLabel: string | null;
      status: string;
      stake: number;
      combinedOdd: number | null;
      actualReturn: number | null;
      legs: Array<{ matchLabel: string }>;
    }>,
    linked: boolean,
  ) {
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
  }

  private mapSystemTickets(
    tickets: Array<{
      id: string;
      name: string | null;
      status: TicketStatus;
      createdAt: Date;
      stake: number | null;
      combinedOdd: number | null;
      actualReturn: number | null;
      selections: unknown[];
    }>,
    linked: boolean,
  ) {
    return {
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
    };
  }

  /**
   * Vincula bilhetes exclusivamente a uma banca.
   * Só aceita bilhetes sem vínculo; para transferir, remova da banca atual antes.
   */
  private async assignExclusiveTickets(
    periodId: string,
    studyTicketIds: string[],
    ticketIds: string[],
  ) {
    if (studyTicketIds.length) {
      const study = await this.prisma.studyTicket.findMany({
        where: { id: { in: studyTicketIds } },
        select: {
          id: true,
          bankrollPeriodId: true,
          betLabel: true,
          bankrollPeriod: { select: { name: true } },
        },
      });
      const missing = studyTicketIds.filter(
        (id) => !study.some((t) => t.id === id),
      );
      if (missing.length) {
        throw new BadRequestException(
          `Bilhete(s) de estudo não encontrado(s): ${missing.join(', ')}`,
        );
      }
      const busy = study.filter(
        (t) => t.bankrollPeriodId != null && t.bankrollPeriodId !== periodId,
      );
      if (busy.length) {
        throw new BadRequestException(
          `Bilhete(s) Bet365 já vinculados a outra banca (${busy
            .map((t) => t.bankrollPeriod?.name ?? t.bankrollPeriodId)
            .join(', ')}). Remova o vínculo antes de transferir.`,
        );
      }
    }

    if (ticketIds.length) {
      const system = await this.prisma.ticket.findMany({
        where: { id: { in: ticketIds } },
        select: {
          id: true,
          name: true,
          status: true,
          bankrollPeriodId: true,
          bankrollPeriod: { select: { name: true } },
        },
      });
      const missing = ticketIds.filter(
        (id) => !system.some((t) => t.id === id),
      );
      if (missing.length) {
        throw new BadRequestException(
          `Bilhete(s) do sistema não encontrado(s): ${missing.join(', ')}`,
        );
      }
      const drafts = system.filter((t) => t.status === TicketStatus.DRAFT);
      if (drafts.length) {
        throw new BadRequestException(
          'Não é possível vincular bilhetes em rascunho',
        );
      }
      const busy = system.filter(
        (t) => t.bankrollPeriodId != null && t.bankrollPeriodId !== periodId,
      );
      if (busy.length) {
        throw new BadRequestException(
          `Bilhete(s) do sistema já vinculados a outra banca (${busy
            .map((t) => t.bankrollPeriod?.name ?? t.bankrollPeriodId)
            .join(', ')}). Remova o vínculo antes de transferir.`,
        );
      }
    }

    await this.prisma.$transaction([
      ...(studyTicketIds.length
        ? [
            this.prisma.studyTicket.updateMany({
              where: {
                id: { in: studyTicketIds },
                OR: [
                  { bankrollPeriodId: null },
                  { bankrollPeriodId: periodId },
                ],
              },
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
                OR: [
                  { bankrollPeriodId: null },
                  { bankrollPeriodId: periodId },
                ],
              },
              data: { bankrollPeriodId: periodId },
            }),
          ]
        : []),
    ]);

    await this.syncLinkedTicketsToLedger(periodId, studyTicketIds, ticketIds);
  }

  /**
   * Cria lançamentos STAKE/WIN/LOSS/REFUND a partir dos bilhetes vinculados,
   * para saldo, ROI e win rate refletirem as apostas.
   */
  private async syncLinkedTicketsToLedger(
    periodId: string,
    studyTicketIds: string[],
    ticketIds: string[],
  ) {
    if (studyTicketIds.length) {
      const studyTickets = await this.prisma.studyTicket.findMany({
        where: { id: { in: studyTicketIds }, bankrollPeriodId: periodId },
      });
      for (const ticket of studyTickets) {
        const existing = await this.prisma.bankrollEntry.count({
          where: { periodId, studyTicketId: ticket.id },
        });
        if (existing > 0) continue;

        const label =
          ticket.betLabel ?? ticket.betType ?? ticket.bet365Ref ?? ticket.id;
        const stake = Math.abs(ticket.stake);
        const at = ticket.placedAt;

        await this.prisma.bankrollEntry.create({
          data: {
            periodId,
            amount: -stake,
            type: BankrollEntryType.STAKE,
            description: `Aposta: ${label}`,
            studyTicketId: ticket.id,
            createdAt: at,
          },
        });

        if (ticket.status === StudyTicketStatus.WON) {
          const winAmount =
            ticket.actualReturn ??
            ticket.potentialReturn ??
            (ticket.combinedOdd != null ? stake * ticket.combinedOdd : stake);
          await this.prisma.bankrollEntry.create({
            data: {
              periodId,
              amount: winAmount,
              type: BankrollEntryType.WIN,
              description: `Green: ${label}`,
              studyTicketId: ticket.id,
              createdAt: new Date(at.getTime() + 1000),
            },
          });
        } else if (ticket.status === StudyTicketStatus.LOST) {
          await this.prisma.bankrollEntry.create({
            data: {
              periodId,
              amount: 0,
              type: BankrollEntryType.LOSS,
              description: `Red: ${label}`,
              studyTicketId: ticket.id,
              createdAt: new Date(at.getTime() + 1000),
            },
          });
        } else if (ticket.status === StudyTicketStatus.VOID) {
          await this.prisma.bankrollEntry.create({
            data: {
              periodId,
              amount: stake,
              type: BankrollEntryType.REFUND,
              description: `Anulado: ${label}`,
              studyTicketId: ticket.id,
              createdAt: new Date(at.getTime() + 1000),
            },
          });
        } else if (ticket.status === StudyTicketStatus.CASHED_OUT) {
          const cash =
            ticket.cashOutValue ?? ticket.actualReturn ?? stake;
          await this.prisma.bankrollEntry.create({
            data: {
              periodId,
              amount: cash,
              type: BankrollEntryType.WIN,
              description: `Cash out: ${label}`,
              studyTicketId: ticket.id,
              createdAt: new Date(at.getTime() + 1000),
            },
          });
        }
      }
    }

    if (ticketIds.length) {
      const systemTickets = await this.prisma.ticket.findMany({
        where: { id: { in: ticketIds }, bankrollPeriodId: periodId },
      });
      for (const ticket of systemTickets) {
        const existing = await this.prisma.bankrollEntry.count({
          where: { periodId, ticketId: ticket.id },
        });
        if (existing > 0) continue;

        const stake = Math.abs(ticket.stake ?? 0);
        if (stake <= 0) continue;
        const label = ticket.name ?? ticket.id;
        const at = ticket.createdAt;

        await this.prisma.bankrollEntry.create({
          data: {
            periodId,
            amount: -stake,
            type: BankrollEntryType.STAKE,
            description: `Aposta: ${label}`,
            ticketId: ticket.id,
            createdAt: at,
          },
        });

        if (ticket.status === TicketStatus.WON) {
          const winAmount =
            ticket.actualReturn ??
            ticket.potentialReturn ??
            (ticket.combinedOdd != null ? stake * ticket.combinedOdd : stake);
          await this.prisma.bankrollEntry.create({
            data: {
              periodId,
              amount: winAmount,
              type: BankrollEntryType.WIN,
              description: `Green: ${label}`,
              ticketId: ticket.id,
              createdAt: new Date(at.getTime() + 1000),
            },
          });
        } else if (ticket.status === TicketStatus.LOST) {
          await this.prisma.bankrollEntry.create({
            data: {
              periodId,
              amount: 0,
              type: BankrollEntryType.LOSS,
              description: `Red: ${label}`,
              ticketId: ticket.id,
              createdAt: new Date(at.getTime() + 1000),
            },
          });
        } else if (ticket.status === TicketStatus.VOID) {
          await this.prisma.bankrollEntry.create({
            data: {
              periodId,
              amount: stake,
              type: BankrollEntryType.REFUND,
              description: `Anulado: ${label}`,
              ticketId: ticket.id,
              createdAt: new Date(at.getTime() + 1000),
            },
          });
        } else if (ticket.status === TicketStatus.CASHED_OUT) {
          const cash = ticket.actualReturn ?? stake;
          await this.prisma.bankrollEntry.create({
            data: {
              periodId,
              amount: cash,
              type: BankrollEntryType.WIN,
              description: `Cash out: ${label}`,
              ticketId: ticket.id,
              createdAt: new Date(at.getTime() + 1000),
            },
          });
        }
      }
    }
  }

  private async removeLinkedTicketsFromLedger(
    periodId: string,
    studyTicketIds: string[],
    ticketIds: string[],
  ) {
    if (studyTicketIds.length) {
      await this.prisma.bankrollEntry.deleteMany({
        where: { periodId, studyTicketId: { in: studyTicketIds } },
      });
    }
    if (ticketIds.length) {
      await this.prisma.bankrollEntry.deleteMany({
        where: { periodId, ticketId: { in: ticketIds } },
      });
    }
  }

  /**
   * Recria lançamentos de um bilhete de estudo após edição (status/stake/retorno).
   * Sem efeito se o bilhete não estiver vinculado a uma banca.
   */
  async resyncStudyTicketLedger(studyTicketId: string) {
    const ticket = await this.prisma.studyTicket.findUnique({
      where: { id: studyTicketId },
      select: { id: true, bankrollPeriodId: true },
    });
    if (!ticket?.bankrollPeriodId) return null;

    const periodId = ticket.bankrollPeriodId;
    await this.removeLinkedTicketsFromLedger(periodId, [studyTicketId], []);
    await this.syncLinkedTicketsToLedger(periodId, [studyTicketId], []);
    return this.getSummary(periodId);
  }

  /**
   * Recria lançamentos de um bilhete do sistema após liquidação/edição.
   */
  async resyncSystemTicketLedger(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true, bankrollPeriodId: true },
    });
    if (!ticket?.bankrollPeriodId) return null;

    const periodId = ticket.bankrollPeriodId;
    await this.removeLinkedTicketsFromLedger(periodId, [], [ticketId]);
    await this.syncLinkedTicketsToLedger(periodId, [], [ticketId]);
    return this.getSummary(periodId);
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

    await this.assignExclusiveTickets(periodId, studyTicketIds, ticketIds);
    return this.getCorrelatedTickets(periodId);
  }

  async unlinkTickets(periodId: string, dto: LinkBankrollTicketsDto) {
    await this.getPeriod(periodId);

    const studyTicketIds = [...new Set(dto.studyTicketIds ?? [])];
    const ticketIds = [...new Set(dto.ticketIds ?? [])];

    if (!studyTicketIds.length && !ticketIds.length) {
      throw new BadRequestException('Selecione ao menos um bilhete');
    }

    await this.removeLinkedTicketsFromLedger(
      periodId,
      studyTicketIds,
      ticketIds,
    );

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
    await this.closeExpiredPeriods();
    if (periodId) {
      await this.getPeriod(periodId);
      return periodId;
    }
    const open = await this.findPreferredOpenPeriod();
    if (!open) {
      throw new BadRequestException(
        'Nenhuma banca aberta. Crie ou reabra um período para continuar.',
      );
    }
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

    // Garante lançamentos para bilhetes já vinculados (ex.: vínculo antigo).
    const [linkedStudy, linkedSystem] = await Promise.all([
      this.prisma.studyTicket.findMany({
        where: { bankrollPeriodId: id },
        select: { id: true },
      }),
      this.prisma.ticket.findMany({
        where: { bankrollPeriodId: id },
        select: { id: true },
      }),
    ]);
    await this.syncLinkedTicketsToLedger(
      id,
      linkedStudy.map((t) => t.id),
      linkedSystem.map((t) => t.id),
    );

    const entries = await this.prisma.bankrollEntry.findMany({
      where: { periodId: id },
      orderBy: { createdAt: 'asc' },
    });

    const balance = entries.reduce((sum, e) => sum + e.amount, 0);
    const deposits = entries
      .filter((e) => e.type === BankrollEntryType.DEPOSIT)
      .reduce((sum, e) => sum + e.amount, 0);
    const withdrawals = entries
      .filter((e) => e.type === BankrollEntryType.WITHDRAWAL)
      .reduce((sum, e) => sum + Math.abs(e.amount), 0);
    const totalStaked = entries
      .filter((e) => e.type === BankrollEntryType.STAKE)
      .reduce((sum, e) => sum + Math.abs(e.amount), 0);
    const wins = entries.filter((e) => e.type === BankrollEntryType.WIN);
    const losses = entries.filter((e) => e.type === BankrollEntryType.LOSS);

    // Lucro = saldo − dinheiro líquido colocado (depósitos − saques)
    const netCashIn = deposits - withdrawals;
    const profit = balance - netCashIn;
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
    const studyTicketIds = [
      ...new Set(
        entries
          .map((e) => e.studyTicketId)
          .filter((tid): tid is string => !!tid),
      ),
    ];
    const systemTickets = ticketIds.length
      ? await this.prisma.ticket.findMany({
          where: {
            id: { in: ticketIds },
            status: {
              in: [
                TicketStatus.PLACED,
                TicketStatus.WON,
                TicketStatus.LOST,
                TicketStatus.VOID,
                TicketStatus.CASHED_OUT,
              ],
            },
          },
        })
      : [];
    const studyTickets = studyTicketIds.length
      ? await this.prisma.studyTicket.findMany({
          where: { id: { in: studyTicketIds } },
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
      totalDeposited: round(deposits),
      totalWithdrawn: round(withdrawals),
      ticketsPlaced: systemTickets.length + studyTickets.length,
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

    const period =
      ticket.bankrollPeriodId != null
        ? await this.getPeriod(ticket.bankrollPeriodId)
        : await this.ensureActivePeriod();

    if (period.status !== BankrollPeriodStatus.OPEN) {
      throw new BadRequestException(
        'A banca vinculada está fechada. Reabra-a ou vincule outra banca aberta.',
      );
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
        data: {
          status: TicketStatus.PLACED,
          bankrollPeriodId: period.id,
        },
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
