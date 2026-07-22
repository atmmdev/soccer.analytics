/**
 * Importa 1 bilhete Bet365 (JSON curado ou PDF).
 *
 * Uso (a partir de apps/api):
 *   pnpm exec ts-node prisma/import-study-ticket.ts --json ../../docs/betting/data/bilhetes/imported/01062026-101347hs.json
 *   pnpm exec ts-node prisma/import-study-ticket.ts --pdf 2026/junho/01062026-101347hs.pdf
 *   pnpm exec ts-node prisma/import-study-ticket.ts --preview 2026/junho/01062026-101347hs.pdf
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaClient, StudyTicketStatus, Prisma } from '@prisma/client';
import { parseBet365PdfText } from '../src/study-tickets/bet365-pdf.parser';
import { execFileSync } from 'node:child_process';

const prisma = new PrismaClient();
const BILHETES = resolve(__dirname, '../../../docs/betting/data/bilhetes');

function extractPdf(abs: string): string {
  try {
    return execFileSync('pdftotext', ['-raw', '-enc', 'UTF-8', abs, '-'], {
      encoding: 'utf8',
    });
  } catch {
    return execFileSync('pdftotext', ['-raw', abs, '-'], { encoding: 'latin1' });
  }
}

async function persist(parsed: ReturnType<typeof parseBet365PdfText>) {
  const ref = parsed.bet365Ref?.trim() || null;

  const existingBySource = await prisma.studyTicket.findUnique({
    where: { sourceFile: parsed.sourceFile },
  });

  if (ref) {
    const existingByRef = await prisma.studyTicket.findFirst({
      where: { bet365Ref: ref },
    });
    if (
      existingByRef &&
      existingByRef.sourceFile !== parsed.sourceFile &&
      existingBySource?.id !== existingByRef.id
    ) {
      throw new Error(
        `Duplicado bet365Ref=${ref} já importado como ${existingByRef.sourceFile}`,
      );
    }
  }

  if (existingBySource) {
    await prisma.studyTicketLeg.deleteMany({ where: { ticketId: existingBySource.id } });
    await prisma.studyTicket.delete({ where: { id: existingBySource.id } });
  }

  const ticket = await prisma.studyTicket.create({
    data: {
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
        ? parsed.warnings.join('\n')
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
    },
    include: { legs: true },
  });

  console.log(JSON.stringify({
    id: ticket.id,
    sourceFile: ticket.sourceFile,
    status: ticket.status,
    stake: ticket.stake,
    combinedOdd: ticket.combinedOdd,
    actualReturn: ticket.actualReturn,
    cashOutValue: ticket.cashOutValue,
    legs: ticket.legs.length,
  }, null, 2));
}

async function main() {
  const args = process.argv.slice(2);
  const mode = args[0];
  const target = args[1];

  if (!mode || !target) {
    console.error('Uso: --json <path> | --pdf <rel> | --preview <rel>');
    process.exit(1);
  }

  if (mode === '--json') {
    const parsed = JSON.parse(readFileSync(resolve(target), 'utf8'));
    await persist(parsed);
    return;
  }

  const abs = resolve(BILHETES, target);
  const sourceFile = `docs/betting/data/bilhetes/${target.replace(/\\/g, '/')}`;
  const text = extractPdf(abs);
  const parsed = parseBet365PdfText(text, sourceFile);

  if (mode === '--preview') {
    console.log(JSON.stringify(parsed, null, 2));
    return;
  }

  if (mode === '--pdf') {
    await persist(parsed);
    return;
  }

  console.error('Modo inválido');
  process.exit(1);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
