import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { StudyTicketStatus, Prisma } from '@prisma/client';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { basename, isAbsolute, join, normalize, relative, resolve } from 'node:path';
import { PrismaService } from '../prisma/prisma.service';
import {
  parseBet365PdfText,
  type ParsedStudyTicket,
} from './bet365-pdf.parser';
import { UpdateStudyTicketDto } from './dto/study-ticket.dto';

const BILHETES_ROOT = resolve(
  process.cwd(),
  '../../docs/betting/data/bilhetes',
);

@Injectable()
export class StudyTicketsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params?: { year?: number; month?: number; status?: StudyTicketStatus }) {
    const where: Prisma.StudyTicketWhereInput = {};
    if (params?.status) where.status = params.status;

    const tickets = await this.prisma.studyTicket.findMany({
      where,
      orderBy: { placedAt: 'desc' },
      include: { legs: { orderBy: { sortOrder: 'asc' } } },
    });

    if (params?.year == null && params?.month == null) return tickets;

    return tickets.filter((t) => {
      const d = new Date(t.placedAt);
      if (params.year != null && d.getUTCFullYear() !== params.year) return false;
      if (params.month != null && d.getUTCMonth() + 1 !== params.month) return false;
      return true;
    });
  }

  /** Agrupa por ano → mês → dia para a UI */
  async findGrouped() {
    const tickets = await this.findAll();
    const groups: Record<
      string,
      Record<string, Record<string, typeof tickets>>
    > = {};

    for (const t of tickets) {
      const d = new Date(t.placedAt);
      const year = String(d.getUTCFullYear());
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      groups[year] ??= {};
      groups[year][month] ??= {};
      groups[year][month][day] ??= [];
      groups[year][month][day].push(t);
    }

    return groups;
  }

  async findOne(id: string) {
    const ticket = await this.prisma.studyTicket.findUnique({
      where: { id },
      include: { legs: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!ticket) throw new NotFoundException('Bilhete de estudo não encontrado');
    return ticket;
  }

  async update(id: string, dto: UpdateStudyTicketDto) {
    await this.findOne(id);

    const { legs, placedAt, cashOutAt, ...rest } = dto;

    await this.prisma.$transaction(async (tx) => {
      await tx.studyTicket.update({
        where: { id },
        data: {
          ...rest,
          ...(placedAt ? { placedAt: new Date(placedAt) } : {}),
          ...(cashOutAt !== undefined
            ? { cashOutAt: cashOutAt ? new Date(cashOutAt) : null }
            : {}),
        },
      });

      if (legs) {
        await tx.studyTicketLeg.deleteMany({ where: { ticketId: id } });
        if (legs.length) {
          await tx.studyTicketLeg.createMany({
            data: legs.map((leg, idx) => ({
              ticketId: id,
              sortOrder: leg.sortOrder ?? idx,
              builderGroup: leg.builderGroup ?? null,
              matchLabel: leg.matchLabel ?? '—',
              matchDate: leg.matchDate ?? null,
              market: leg.market ?? '—',
              selection: leg.selection ?? '—',
              period: leg.period ?? null,
              odd: leg.odd ?? null,
              boostedOdd: leg.boostedOdd ?? null,
              status: leg.status ?? null,
              progressValue: leg.progressValue ?? null,
              progressLine: leg.progressLine ?? null,
            })),
          });
        }
      }
    });

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.studyTicket.delete({ where: { id } });
    return { ok: true };
  }

  resolvePdfPath(filePath: string): string {
    const abs = isAbsolute(filePath)
      ? normalize(filePath)
      : resolve(BILHETES_ROOT, filePath.replace(/^docs\/betting\/data\/bilhetes\/?/, ''));

    const root = resolve(BILHETES_ROOT);
    if (!abs.startsWith(root)) {
      throw new BadRequestException('Arquivo fora da pasta bilhetes');
    }
    if (!existsSync(abs)) {
      throw new BadRequestException(`PDF não encontrado: ${abs}`);
    }
    return abs;
  }

  extractPdfText(absPath: string): string {
    try {
      return execFileSync('pdftotext', ['-raw', '-enc', 'UTF-8', absPath, '-'], {
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024,
      });
    } catch {
      // fallback sem -enc
      return execFileSync('pdftotext', ['-raw', absPath, '-'], {
        encoding: 'latin1',
        maxBuffer: 10 * 1024 * 1024,
      });
    }
  }

  async importFromPdf(filePath: string, opts?: { force?: boolean }) {
    const abs = this.resolvePdfPath(filePath);
    const rel = relative(resolve(BILHETES_ROOT, '../..'), abs).replace(/\\/g, '/');
    // store as docs/betting/data/bilhetes/...
    const sourceFile = rel.startsWith('docs/')
      ? rel
      : `docs/betting/data/bilhetes/${relative(BILHETES_ROOT, abs).replace(/\\/g, '/')}`;

    const existing = await this.prisma.studyTicket.findUnique({
      where: { sourceFile },
    });
    if (existing && !opts?.force) {
      throw new BadRequestException(
        `Já importado: ${sourceFile} (id=${existing.id}). Use force=true para reimportar.`,
      );
    }

    const text = this.extractPdfText(abs);
    const parsed = parseBet365PdfText(text, sourceFile);
    return this.persistParsed(parsed, existing?.id);
  }

  async persistParsed(parsed: ParsedStudyTicket, replaceId?: string) {
    const data = {
      sourceFile: parsed.sourceFile,
      bet365Ref: parsed.bet365Ref,
      placedAt: new Date(parsed.placedAt),
      betType: parsed.betType,
      betLabel: parsed.betLabel,
      status: parsed.status as StudyTicketStatus,
      stake: parsed.stake,
      unitStake: parsed.unitStake,
      numBets: parsed.numBets,
      combinedOdd: parsed.combinedOdd,
      potentialReturn: parsed.potentialReturn,
      actualReturn: parsed.actualReturn,
      cashOutAt: parsed.cashOut?.at ? new Date(parsed.cashOut.at) : null,
      cashOutValue: parsed.cashOut?.total ?? parsed.cashOut?.value ?? null,
      hasOddsBoost: parsed.hasOddsBoost,
      notes: parsed.warnings.length
        ? `Import warnings: ${parsed.warnings.join('; ')}`
        : null,
      rawExtract: parsed as unknown as Prisma.InputJsonValue,
      legs: {
        create: parsed.legs.map((leg) => ({
          sortOrder: leg.sortOrder,
          builderGroup: leg.builderGroup,
          matchLabel: leg.matchLabel,
          matchDate: leg.matchDate,
          market: leg.market,
          selection: leg.selection,
          period: leg.period,
          odd: leg.odd,
          boostedOdd: leg.boostedOdd,
          status: (leg.status as StudyTicketStatus | null) ?? null,
          meta: leg.meta ? (leg.meta as Prisma.InputJsonValue) : undefined,
        })),
      },
    };

    if (replaceId) {
      await this.prisma.studyTicketLeg.deleteMany({ where: { ticketId: replaceId } });
      await this.prisma.studyTicket.delete({ where: { id: replaceId } });
    }

    return this.prisma.studyTicket.create({
      data,
      include: { legs: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  /** Importa a partir de JSON já curado (quando o PDF precisa de correção manual) */
  async importFromJsonFile(jsonPath: string) {
    const abs = isAbsolute(jsonPath) ? jsonPath : resolve(process.cwd(), jsonPath);
    if (!existsSync(abs)) {
      throw new BadRequestException(`JSON não encontrado: ${abs}`);
    }
    const parsed = JSON.parse(readFileSync(abs, 'utf8')) as ParsedStudyTicket;
    const existing = await this.prisma.studyTicket.findUnique({
      where: { sourceFile: parsed.sourceFile },
    });
    return this.persistParsed(parsed, existing?.id);
  }

  previewParse(filePath: string) {
    const abs = this.resolvePdfPath(filePath);
    const rel = `docs/betting/data/bilhetes/${relative(BILHETES_ROOT, abs).replace(/\\/g, '/')}`;
    const text = this.extractPdfText(abs);
    return parseBet365PdfText(text, rel);
  }
}
