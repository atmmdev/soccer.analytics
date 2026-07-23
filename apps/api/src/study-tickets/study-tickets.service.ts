import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { StudyTicketStatus, Prisma } from '@prisma/client';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import {
  basename,
  dirname,
  isAbsolute,
  join,
  normalize,
  relative,
  resolve,
} from 'node:path';
import { PrismaService } from '../prisma/prisma.service';
import { BankrollService } from '../bankroll/bankroll.service';
import {
  parseBet365PdfText,
  type ParsedStudyTicket,
} from './bet365-pdf.parser';
import { UpdateStudyTicketDto } from './dto/study-ticket.dto';
import { studyTicketMonthFolder } from '../tickets/study-ticket-code';

const BILHETES_ROOT = resolve(
  process.cwd(),
  '../../docs/betting/data/bilhetes',
);
const REPO_ROOT = resolve(process.cwd(), '../..');

@Injectable()
export class StudyTicketsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => BankrollService))
    private bankroll: BankrollService,
  ) {}

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
    const existing = await this.findOne(id);

    const { legs, placedAt, cashOutAt, ...rest } = dto;

    const stake =
      rest.stake !== undefined ? rest.stake : existing.stake;
    const legsForCalc =
      legs ??
      existing.legs.map((l) => ({
        odd: l.odd,
        boostedOdd: l.boostedOdd,
        builderGroup: l.builderGroup,
      }));

    const derived = this.deriveTotalsFromLegs({
      legs: legsForCalc,
      stake,
      combinedOdd:
        rest.combinedOdd !== undefined
          ? rest.combinedOdd
          : existing.combinedOdd,
      potentialReturn:
        rest.potentialReturn !== undefined
          ? rest.potentialReturn
          : existing.potentialReturn,
      preferLegsProduct: rest.combinedOdd === undefined,
    });

    await this.prisma.$transaction(async (tx) => {
      await tx.studyTicket.update({
        where: { id },
        data: {
          ...rest,
          combinedOdd: derived.combinedOdd,
          potentialReturn: derived.potentialReturn,
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

    const ticket = await this.findOne(id);
    const jsonPath = await this.persistTicketJson(ticket);
    await this.bankroll.resyncStudyTicketLedger(id);
    const saved = await this.findOne(id);
    return { ...saved, jsonPath };
  }

  /**
   * Odd combinada e retorno potencial.
   * - 1 odd por builderGroup (Criar Aposta) + pernas avulsas
   * - Se o cliente enviou combinedOdd (>1.01), respeita
   * - Retorno potencial = stake × odd quando ausente ou ≤0
   */
  private deriveTotalsFromLegs(input: {
    legs: {
      odd?: number | null;
      boostedOdd?: number | null;
      builderGroup?: number | null;
    }[];
    stake: number;
    combinedOdd: number | null;
    potentialReturn: number | null;
    preferLegsProduct?: boolean;
  }): { combinedOdd: number | null; potentialReturn: number | null } {
    const byGroup = new Map<string, number | null>();
    input.legs.forEach((l, i) => {
      const key =
        l.builderGroup != null ? `g-${l.builderGroup}` : `solo-${i}`;
      const raw = l.boostedOdd ?? l.odd;
      const odd = raw != null && raw > 1.001 ? raw : null;
      const prev = byGroup.get(key) ?? null;
      if (odd != null && (prev == null || odd > prev)) {
        byGroup.set(key, odd);
      } else if (!byGroup.has(key)) {
        byGroup.set(key, null);
      }
    });

    const odds = [...byGroup.values()].filter((o): o is number => o != null);
    const fromLegs =
      odds.length > 0
        ? Number(odds.reduce((a, b) => a * b, 1).toFixed(4))
        : null;

    let combinedOdd = input.combinedOdd;
    if (fromLegs != null) {
      if (
        input.preferLegsProduct ||
        combinedOdd == null ||
        combinedOdd <= 1.01
      ) {
        combinedOdd = fromLegs;
      }
    }

    let potentialReturn = input.potentialReturn;
    if (
      (potentialReturn == null || potentialReturn <= 0) &&
      input.stake > 0 &&
      combinedOdd != null &&
      combinedOdd > 0
    ) {
      potentialReturn = Number((input.stake * combinedOdd).toFixed(2));
    }

    return { combinedOdd, potentialReturn };
  }

  /** Caminho do JSON curado espelhado em bilhetes/imported/... */
  private resolveTicketJsonAbs(sourceFile: string): string {
    if (sourceFile.toLowerCase().endsWith('.json')) {
      return resolve(REPO_ROOT, sourceFile);
    }

    const underRoot = sourceFile.replace(
      /^docs\/betting\/data\/bilhetes\/?/,
      '',
    );
    const jsonName = basename(underRoot).replace(/\.pdf$/i, '.json');
    const dir = dirname(underRoot);
    const importedAbs = resolve(
      BILHETES_ROOT,
      'imported',
      dir === '.' ? jsonName : join(dir, jsonName),
    );
    if (existsSync(importedAbs)) return importedAbs;

    const besidePdf = resolve(REPO_ROOT, sourceFile.replace(/\.pdf$/i, '.json'));
    if (existsSync(besidePdf)) return besidePdf;

    return importedAbs;
  }

  private relativeFromRepo(absPath: string): string {
    return relative(REPO_ROOT, absPath).replace(/\\/g, '/');
  }

  private buildCuratedWarnings(
    ticket: Awaited<ReturnType<StudyTicketsService['findOne']>>,
    prevWarnings: unknown,
  ): string[] {
    const kept: string[] = [];
    if (Array.isArray(prevWarnings)) {
      for (const w of prevWarnings) {
        if (typeof w !== 'string') continue;
        // Remove avisos de parse sobre odd 1 / parcial — agora o JSON é curado
        if (/odd 1 no PDF/i.test(w)) continue;
        if (/Odd combinada parcial/i.test(w)) continue;
        if (/provavelmente incorreta/i.test(w)) continue;
        kept.push(w);
      }
    }

    const missingOdd = ticket.legs.filter(
      (l) => (l.boostedOdd ?? l.odd) == null,
    ).length;
    if (missingOdd > 0) {
      kept.push(
        `${missingOdd}/${ticket.legs.length} pernas sem odd — preencher na edição`,
      );
    }
    if (ticket.combinedOdd == null || ticket.combinedOdd <= 1.01) {
      kept.push('Odd combinada ausente ou inválida — revisar');
    }
    return kept;
  }

  private buildTicketJsonPayload(
    ticket: Awaited<ReturnType<StudyTicketsService['findOne']>>,
    jsonRelPath: string,
  ) {
    const prev =
      ticket.rawExtract && typeof ticket.rawExtract === 'object'
        ? (ticket.rawExtract as Record<string, unknown>)
        : {};
    const prevMeta =
      prev._meta && typeof prev._meta === 'object'
        ? (prev._meta as Record<string, unknown>)
        : {};

    const legs = ticket.legs.map((leg) => ({
      sortOrder: leg.sortOrder,
      builderGroup: leg.builderGroup,
      matchLabel: leg.matchLabel,
      matchDate: leg.matchDate,
      market: leg.market,
      selection: leg.selection,
      period: leg.period,
      odd: leg.odd,
      boostedOdd: leg.boostedOdd,
      status: leg.status,
      progressValue: leg.progressValue,
      progressLine: leg.progressLine,
      meta: leg.meta ?? undefined,
    }));

    const warnings = this.buildCuratedWarnings(ticket, prev.warnings);
    const missingOdd = legs.filter(
      (l) => (l.boostedOdd ?? l.odd) == null,
    ).length;
    const needsReview =
      missingOdd > 0 ||
      ticket.combinedOdd == null ||
      ticket.combinedOdd <= 1.01;

    const revision =
      typeof prevMeta.revision === 'number' ? prevMeta.revision + 1 : 1;

    // Documento curado: estado atual do bilhete é a fonte da verdade
    return {
      sourceFile: ticket.sourceFile,
      bet365Ref: ticket.bet365Ref,
      placedAt: ticket.placedAt.toISOString(),
      betType: ticket.betType,
      betLabel: ticket.betLabel,
      status: ticket.status,
      stake: ticket.stake,
      unitStake: ticket.unitStake,
      numBets: ticket.numBets,
      combinedOdd: ticket.combinedOdd,
      potentialReturn: ticket.potentialReturn,
      actualReturn: ticket.actualReturn,
      cashOut:
        ticket.cashOutAt || ticket.cashOutValue != null
          ? {
              at: ticket.cashOutAt?.toISOString() ?? null,
              total: ticket.cashOutValue,
              value: ticket.cashOutValue,
            }
          : null,
      hasOddsBoost: ticket.hasOddsBoost,
      bankrollPeriodId: ticket.bankrollPeriodId,
      notes: ticket.notes,
      legs,
      warnings,
      needsReview,
      // Auditoria do PDF original (não reprocessar como verdade)
      rawLines: Array.isArray(prev.rawLines) ? prev.rawLines : undefined,
      _meta: {
        ...prevMeta,
        updatedAt: new Date().toISOString(),
        curated: true,
        source: 'study-ticket-update',
        revision,
        jsonPath: jsonRelPath,
      },
    };
  }

  /** Regrava o JSON em imported/ + rawExtract no DB. Retorna path relativo ao repo. */
  private async persistTicketJson(
    ticket: Awaited<ReturnType<StudyTicketsService['findOne']>>,
  ): Promise<string> {
    const abs = this.resolveTicketJsonAbs(ticket.sourceFile);
    const jsonRelPath = this.relativeFromRepo(abs);
    const payload = this.buildTicketJsonPayload(ticket, jsonRelPath);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

    await this.prisma.studyTicket.update({
      where: { id: ticket.id },
      data: { rawExtract: payload as unknown as Prisma.InputJsonValue },
    });

    return jsonRelPath;
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
    const ticket = await this.persistParsed(parsed, existing?.id);
    await this.persistTicketJson(ticket);
    return this.findOne(ticket.id);
  }

  /**
   * Upload pela UI: grava PDF em bilhetes/{ano}/{mês}/, parseia, salva no DB
   * e gera JSON em bilhetes/imported/...
   */
  async importFromUpload(
    file: { buffer: Buffer; originalname: string },
    opts?: { force?: boolean },
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('PDF vazio ou inválido');
    }
    const original = file.originalname || 'bilhete.pdf';
    if (!/\.pdf$/i.test(original)) {
      throw new BadRequestException('Envie um arquivo .pdf');
    }

    // Parse preliminar em temp para descobrir placedAt e organizar pastas
    const tmpDir = resolve(BILHETES_ROOT, '_uploads');
    mkdirSync(tmpDir, { recursive: true });
    const tmpName = `${Date.now()}-${basename(original).replace(/[^\w.\-]+/g, '_')}`;
    const tmpAbs = join(tmpDir, tmpName);
    writeFileSync(tmpAbs, file.buffer);

    let placedAt = new Date();
    try {
      const text = this.extractPdfText(tmpAbs);
      const preview = parseBet365PdfText(text, `tmp/${tmpName}`);
      if (preview.placedAt) placedAt = new Date(preview.placedAt);
    } catch {
      // mantém now — ainda tentamos importar pelo path final
    }

    const year = String(placedAt.getFullYear());
    const month = studyTicketMonthFolder(placedAt);
    const safeBase = basename(original).replace(/[^\w.\-]+/g, '_');
    const destRel = `${year}/${month}/${safeBase}`;
    const destAbs = resolve(BILHETES_ROOT, destRel);
    mkdirSync(dirname(destAbs), { recursive: true });
    writeFileSync(destAbs, file.buffer);

    try {
      if (existsSync(tmpAbs)) unlinkSync(tmpAbs);
    } catch {
      /* ignore */
    }

    return this.importFromPdf(destRel, { force: opts?.force ?? true });
  }

  async persistParsed(parsed: ParsedStudyTicket, replaceId?: string) {
    const ref = parsed.bet365Ref?.trim() || null;

    if (ref) {
      const existingByRef = await this.prisma.studyTicket.findFirst({
        where: { bet365Ref: ref },
      });
      if (
        existingByRef &&
        existingByRef.id !== replaceId &&
        existingByRef.sourceFile !== parsed.sourceFile
      ) {
        throw new BadRequestException(
          `Duplicado bet365Ref=${ref} já importado como ${existingByRef.sourceFile} (id=${existingByRef.id}).`,
        );
      }
    }

    const data = {
      sourceFile: parsed.sourceFile,
      bet365Ref: ref,
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
