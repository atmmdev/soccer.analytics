import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MarketType, TicketStatus } from '@prisma/client';
import { mkdirSync, unlinkSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { PrismaService } from '../prisma/prisma.service';
import { TicketEngineService } from '../engines/ticket-engine/ticket-engine.service';
import { StudyTicketsService } from '../study-tickets/study-tickets.service';
import {
  parseBet365PdfText,
  type ParsedStudyLeg,
} from '../study-tickets/bet365-pdf.parser';
import {
  CalculateTicketDto,
  CreateTicketDto,
  UpdateTicketDto,
} from './dto/ticket.dto';
import {
  betTypeFromLegs,
  formatStudyTicketCode,
  studyTicketMonthFolder,
} from './study-ticket-code';

const BILHETES_APP_ROOT = resolve(
  process.cwd(),
  '../../docs/betting/data/bilhetes/app',
);

function normalizeName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\b(fc|ec|sc|ac|cf|club|clube|de|da|do|dos|das)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function parseMatchTeams(label: string): { a: string; b: string } | null {
  const parts = label
    .split(/\s+(?:v\.?s?\.?|x|-)\s+/i)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length < 2) return null;
  return { a: parts[0]!, b: parts[1]! };
}

function mapMarketType(market: string, selection: string): MarketType {
  const m = `${market} ${selection}`.toLowerCase();
  if (/escanteio|corner/.test(m)) return MarketType.CORNERS;
  if (/cart[aã]o|card|amarelo|vermelho/.test(m)) return MarketType.CARDS;
  if (
    /handicap|asi[aá]tico/.test(m) ||
    /^(casa|fora|home|away)\s*[+-]/i.test(selection.trim())
  ) {
    return MarketType.HANDICAP;
  }
  if (/ambas|btts|both teams/.test(m)) return MarketType.BTTS;
  if (/chance dupla|double chance/.test(m)) return MarketType.DOUBLE_CHANCE;
  if (/placar|exact score|resultado exato/.test(m)) {
    return MarketType.EXACT_SCORE;
  }
  if (/intervalo.?final|ht\/ft/.test(m)) return MarketType.HT_FT;
  if (/over|under|total de gols|mais de|menos de/.test(m)) {
    return MarketType.OVER_UNDER;
  }
  if (/1x2|resultado|tempo regulamentar|vencedor/.test(m)) {
    return MarketType.MATCH_RESULT;
  }
  if (/^casa$|^fora$|^empate$/i.test(selection.trim())) {
    return MarketType.MATCH_RESULT;
  }
  if (/^(over|under)\s+/i.test(selection.trim())) {
    return MarketType.OVER_UNDER;
  }
  return MarketType.MATCH_RESULT;
}

function mapTicketStatus(
  status: string | null | undefined,
): TicketStatus | null {
  switch (status) {
    case 'WON':
      return TicketStatus.WON;
    case 'LOST':
      return TicketStatus.LOST;
    case 'VOID':
      return TicketStatus.VOID;
    case 'CASHED_OUT':
      return TicketStatus.CASHED_OUT;
    case 'PENDING':
      return TicketStatus.PLACED;
    default:
      return null;
  }
}

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private ticketEngine: TicketEngineService,
    private studyTickets: StudyTicketsService,
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
    const absPath = resolve(
      BILHETES_APP_ROOT,
      String(year),
      month,
      `${code}.json`,
    );
    mkdirSync(dirname(absPath), { recursive: true });
    writeFileSync(absPath, `${JSON.stringify(studyJson, null, 2)}\n`, 'utf8');
    return absPath;
  }

  /** Sempre persiste o JSON do bilhete do sistema (fonte de verdade). */
  private persistAppTicketJson(
    ticket: Awaited<ReturnType<TicketsService['findOne']>>,
    calc?: {
      combinedOdd: number;
      combinedProbability: number | null;
      overallEV: number | null;
      potentialReturn: number | null;
      valid: boolean;
      warnings: unknown[];
    } | null,
  ): string | null {
    const code = ticket.name;
    if (!code || !/^\d{8}-\d{6}hs$/.test(code)) return null;

    const fallbackCalc = {
      combinedOdd: ticket.combinedOdd ?? 0,
      combinedProbability: null as number | null,
      overallEV: ticket.overallEV,
      potentialReturn: ticket.potentialReturn,
      valid: true,
      warnings: [] as unknown[],
    };

    return this.writeStudyJson(
      this.buildStudyJson(ticket, calc ?? fallbackCalc, code, ticket.createdAt),
      code,
      ticket.createdAt,
    );
  }

  private discardTempPdf(absPath: string) {
    try {
      if (existsSync(absPath)) unlinkSync(absPath);
    } catch {
      /* ignore */
    }
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
    if (code && /^\d{8}-\d{6}hs$/.test(code)) {
      this.persistAppTicketJson(updated, calc);
    }

    return updated;
  }

  /**
   * Atualiza bilhete do sistema a partir de PDF Bet365.
   * PDF é temporário (descartado após parse). JSON em bilhetes/app é a fonte de verdade.
   */
  async importFromPdf(
    id: string,
    file: { buffer: Buffer; originalname: string },
  ) {
    await this.findOne(id);

    if (!file?.buffer?.length) {
      throw new BadRequestException('PDF vazio ou inválido');
    }
    if (!/\.pdf$/i.test(file.originalname || '')) {
      throw new BadRequestException('Envie um arquivo .pdf');
    }

    const tmpDir = resolve(
      process.cwd(),
      '../../docs/betting/data/bilhetes/_uploads',
    );
    mkdirSync(tmpDir, { recursive: true });
    const tmpAbs = resolve(tmpDir, `ticket-${id}-${Date.now()}.pdf`);
    writeFileSync(tmpAbs, file.buffer);

    let parsed;
    try {
      try {
        const text = this.studyTickets.extractPdfText(tmpAbs);
        parsed = parseBet365PdfText(
          text,
          `docs/betting/data/bilhetes/app/${id}.json`,
        );
      } catch (err) {
        throw new BadRequestException(
          `Falha ao ler PDF: ${err instanceof Error ? err.message : String(err)}`,
        );
      }

      const warnings = [...(parsed.warnings ?? [])];
      const resolved: Array<{
        matchId: string;
        marketType: MarketType;
        selection: string;
        odd: number;
        matchLabel: string;
        createdStub: boolean;
      }> = [];

      for (const leg of parsed.legs) {
        const mapped = await this.resolveLegToSelection(leg);
        if (!mapped) {
          warnings.push(
            `Não foi possível gravar a perna: "${leg.matchLabel}" · ${leg.market} · ${leg.selection}`,
          );
          continue;
        }
        if (mapped.odd < 1.01) {
          warnings.push(
            `Odd inválida em "${leg.matchLabel}" (${leg.selection}) — ajuste manualmente`,
          );
          continue;
        }
        if (mapped.createdStub) {
          warnings.push(
            `Jogo fora da base (registrado via PDF): "${leg.matchLabel}" · seleção "${leg.selection}"`,
          );
        }
        resolved.push(mapped);
      }

      await this.prisma.ticketSelection.deleteMany({ where: { ticketId: id } });

      if (resolved.length) {
        await this.prisma.ticketSelection.createMany({
          data: resolved.map((s) => ({
            ticketId: id,
            matchId: s.matchId,
            marketType: s.marketType,
            selection: s.selection,
            odd: s.odd,
          })),
        });
      }

      const stake = parsed.stake > 0 ? parsed.stake : undefined;
      const mappedStatus = mapTicketStatus(parsed.status);
      const actualReturn =
        parsed.actualReturn != null
          ? parsed.actualReturn
          : parsed.cashOut?.total != null
            ? parsed.cashOut.total
            : undefined;

      const refreshed = await this.findOne(id);
      let calc: {
        combinedOdd: number;
        combinedProbability: number | null;
        overallEV: number | null;
        potentialReturn: number | null;
        valid: boolean;
        warnings: unknown[];
        suggestedStake: number;
      } | null = null;

      const nextStake = stake ?? refreshed.stake ?? 0;
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
          nextStake,
        );
      }

      const updated = await this.prisma.ticket.update({
        where: { id },
        data: {
          stake: nextStake,
          ...(mappedStatus ? { status: mappedStatus } : {}),
          ...(actualReturn !== undefined ? { actualReturn } : {}),
          combinedOdd:
            calc?.combinedOdd ?? parsed.combinedOdd ?? refreshed.combinedOdd,
          potentialReturn:
            calc?.potentialReturn ??
            parsed.potentialReturn ??
            refreshed.potentialReturn,
          overallEV: calc?.overallEV ?? refreshed.overallEV,
        },
        include: {
          selections: {
            include: {
              match: {
                include: {
                  homeTeam: true,
                  awayTeam: true,
                  competition: true,
                },
              },
            },
          },
        },
      });

      const jsonPath = this.persistAppTicketJson(updated, calc);
      if (!jsonPath) {
        warnings.push(
          'Bilhete sem código DDMMYYYY-HHmmsshs — JSON em bilhetes/app não foi gerado',
        );
      }

      if (!resolved.length) {
        warnings.unshift(
          'Nenhuma perna foi gravada. Ajuste stake/status e tente outro PDF, ou edite manualmente.',
        );
      }

      return {
        ticket: updated,
        warnings,
        parsedLegs: parsed.legs.length,
        linkedLegs: resolved.length,
        jsonPath,
      };
    } finally {
      this.discardTempPdf(tmpAbs);
    }
  }

  private async resolveLegToSelection(leg: ParsedStudyLeg): Promise<{
    matchId: string;
    marketType: MarketType;
    selection: string;
    odd: number;
    matchLabel: string;
    createdStub: boolean;
  } | null> {
    const teams = parseMatchTeams(leg.matchLabel);
    if (!teams) return null;

    const a = normalizeName(teams.a);
    const b = normalizeName(teams.b);
    if (!a || !b) return null;

    const odd = leg.boostedOdd ?? leg.odd;
    if (odd == null || !Number.isFinite(odd)) return null;

    const aToken = teams.a.split(/\s+/).find((t) => t.length >= 3) ?? teams.a;
    const bToken = teams.b.split(/\s+/).find((t) => t.length >= 3) ?? teams.b;

    const candidates = await this.prisma.match.findMany({
      where: {
        OR: [
          {
            AND: [
              {
                homeTeam: {
                  name: { contains: aToken, mode: 'insensitive' },
                },
              },
              {
                awayTeam: {
                  name: { contains: bToken, mode: 'insensitive' },
                },
              },
            ],
          },
          {
            AND: [
              {
                homeTeam: {
                  name: { contains: bToken, mode: 'insensitive' },
                },
              },
              {
                awayTeam: {
                  name: { contains: aToken, mode: 'insensitive' },
                },
              },
            ],
          },
        ],
      },
      include: { homeTeam: true, awayTeam: true },
      orderBy: { matchDate: 'desc' },
      take: 40,
    });

    const scored = candidates
      .map((m) => {
        const home = normalizeName(m.homeTeam.name);
        const away = normalizeName(m.awayTeam.name);
        const direct =
          (home.includes(a) || a.includes(home)) &&
          (away.includes(b) || b.includes(away));
        const swapped =
          (home.includes(b) || b.includes(home)) &&
          (away.includes(a) || a.includes(away));
        if (!direct && !swapped) return null;
        return { match: m, score: direct ? 2 : 1 };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x))
      .sort((x, y) => y.score - x.score);

    const best = scored[0]?.match;
    if (best) {
      return {
        matchId: best.id,
        marketType: mapMarketType(leg.market, leg.selection),
        selection: leg.selection,
        odd,
        matchLabel: leg.matchLabel,
        createdStub: false,
      };
    }

    // Jogo não está na allowlist/sync — cria stub para permitir gravar o bilhete
    const stubMatchId = await this.ensureStubMatch(
      teams.a,
      teams.b,
      leg.matchDate,
    );

    return {
      matchId: stubMatchId,
      marketType: mapMarketType(leg.market, leg.selection),
      selection: leg.selection,
      odd,
      matchLabel: leg.matchLabel,
      createdStub: true,
    };
  }

  private async ensureStubMatch(
    homeName: string,
    awayName: string,
    matchDateRaw: string | null,
  ): Promise<string> {
    const competition = await this.prisma.competition.upsert({
      where: { externalId: 'pdf-import' },
      create: {
        name: 'Importado PDF',
        country: 'BR',
        externalId: 'pdf-import',
      },
      update: {},
    });

    const homeTeam = await this.ensureStubTeam(homeName);
    const awayTeam = await this.ensureStubTeam(awayName);

    let matchDate = new Date();
    if (matchDateRaw) {
      const parsedDate = new Date(matchDateRaw);
      if (!Number.isNaN(parsedDate.getTime())) matchDate = parsedDate;
    }

    const existing = await this.prisma.match.findFirst({
      where: {
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        competitionId: competition.id,
        matchDate: {
          gte: new Date(matchDate.getTime() - 36 * 60 * 60 * 1000),
          lte: new Date(matchDate.getTime() + 36 * 60 * 60 * 1000),
        },
      },
    });
    if (existing) return existing.id;

    const created = await this.prisma.match.create({
      data: {
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        competitionId: competition.id,
        matchDate,
        status: 'FINISHED',
        externalId: `pdf:${normalizeName(homeName)}-${normalizeName(awayName)}:${matchDate.toISOString().slice(0, 10)}`,
      },
    });
    return created.id;
  }

  private async ensureStubTeam(name: string) {
    const externalId = `pdf-team:${normalizeName(name)}`;
    return this.prisma.team.upsert({
      where: { externalId },
      create: {
        name: name.trim(),
        shortName: name.trim().slice(0, 12),
        country: 'BR',
        externalId,
      },
      update: { name: name.trim() },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.ticket.delete({ where: { id } });
    return { deleted: true };
  }
}
