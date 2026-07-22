/**
 * Importa TODOS os JSONs de docs/betting/data/bilhetes/imported/ no PostgreSQL.
 *
 * Uso (apps/api):
 *   pnpm db:import-tickets-all
 *   pnpm exec ts-node prisma/import-all-study-tickets.ts
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { Prisma, PrismaClient, StudyTicketStatus } from '@prisma/client';

const prisma = new PrismaClient();
const IMPORTED = resolve(
  __dirname,
  '../../../docs/betting/data/bilhetes/imported',
);

const VALID_STATUS = new Set(Object.values(StudyTicketStatus));

function walkJson(dir: string): string[] {
  const out: string[] = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name.startsWith('_')) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walkJson(full));
    else if (name.endsWith('.json')) out.push(full);
  }
  return out;
}

function asStatus(v: unknown): StudyTicketStatus {
  if (typeof v === 'string' && VALID_STATUS.has(v as StudyTicketStatus)) {
    return v as StudyTicketStatus;
  }
  return StudyTicketStatus.UNKNOWN;
}

function asLegStatus(v: unknown): StudyTicketStatus | null {
  if (v == null) return null;
  if (typeof v === 'string' && VALID_STATUS.has(v as StudyTicketStatus)) {
    return v as StudyTicketStatus;
  }
  return null;
}

type JsonTicket = {
  sourceFile: string;
  bet365Ref?: string | null;
  placedAt: string;
  betType?: string | null;
  betLabel?: string | null;
  status?: string;
  stake?: number;
  unitStake?: number | null;
  numBets?: number | null;
  combinedOdd?: number | null;
  potentialReturn?: number | null;
  actualReturn?: number | null;
  cashOut?: {
    at?: string | null;
    value?: number | null;
    total?: number | null;
  } | null;
  cashOutAt?: string | null;
  cashOutValue?: number | null;
  hasOddsBoost?: boolean;
  notes?: string | null;
  warnings?: string[];
  legs?: Array<{
    sortOrder?: number;
    builderGroup?: number | null;
    matchLabel?: string;
    matchDate?: string | null;
    market?: string;
    selection?: string;
    period?: string | null;
    odd?: number | null;
    boostedOdd?: number | null;
    status?: string | null;
    progressValue?: number | null;
    progressLine?: number | null;
    meta?: Record<string, unknown>;
  }>;
  _meta?: unknown;
  _curated?: boolean;
  rawLines?: string[];
};

async function persist(raw: JsonTicket) {
  if (!raw.sourceFile || !raw.placedAt) {
    throw new Error('JSON inválido: falta sourceFile ou placedAt');
  }

  const warnings = Array.isArray(raw.warnings) ? raw.warnings : [];
  const notes =
    raw.notes ??
    (warnings.length ? warnings.join('\n') : null) ??
    (raw._curated ? 'Curado manualmente' : null);

  const cashOutAt =
    raw.cashOut?.at ?? raw.cashOutAt ?? null;
  const cashOutValue =
    raw.cashOut?.total ??
    raw.cashOut?.value ??
    raw.cashOutValue ??
    null;

  const existing = await prisma.studyTicket.findUnique({
    where: { sourceFile: raw.sourceFile },
  });
  if (existing) {
    await prisma.studyTicketLeg.deleteMany({ where: { ticketId: existing.id } });
    await prisma.studyTicket.delete({ where: { id: existing.id } });
  }

  const legs = raw.legs ?? [];

  return prisma.studyTicket.create({
    data: {
      sourceFile: raw.sourceFile,
      bet365Ref: raw.bet365Ref ?? null,
      placedAt: new Date(raw.placedAt),
      betType: raw.betType ?? null,
      betLabel: raw.betLabel ?? null,
      status: asStatus(raw.status),
      stake: Number(raw.stake ?? 0),
      unitStake: raw.unitStake ?? null,
      numBets: raw.numBets ?? null,
      combinedOdd: raw.combinedOdd ?? null,
      potentialReturn: raw.potentialReturn ?? null,
      actualReturn: raw.actualReturn ?? null,
      cashOutAt: cashOutAt ? new Date(cashOutAt) : null,
      cashOutValue,
      hasOddsBoost: Boolean(raw.hasOddsBoost),
      notes,
      rawExtract: raw as unknown as Prisma.InputJsonValue,
      legs: {
        create: legs.map((leg, idx) => ({
          sortOrder: leg.sortOrder ?? idx,
          builderGroup: leg.builderGroup ?? null,
          matchLabel: leg.matchLabel ?? '—',
          matchDate: leg.matchDate ?? null,
          market: leg.market ?? '—',
          selection: leg.selection ?? '—',
          period: leg.period ?? null,
          odd: leg.odd ?? null,
          boostedOdd: leg.boostedOdd ?? null,
          status: asLegStatus(leg.status),
          progressValue: leg.progressValue ?? null,
          progressLine: leg.progressLine ?? null,
          meta: leg.meta
            ? (leg.meta as Prisma.InputJsonValue)
            : undefined,
        })),
      },
    },
  });
}

async function main() {
  const files = walkJson(IMPORTED).sort();
  console.log(`Importando ${files.length} JSONs → study_tickets`);

  let ok = 0;
  let failed = 0;
  const failures: { file: string; error: string }[] = [];

  for (const file of files) {
    const rel = relative(IMPORTED, file).replace(/\\/g, '/');
    try {
      const raw = JSON.parse(readFileSync(file, 'utf8')) as JsonTicket;
      await persist(raw);
      ok++;
      if (ok % 50 === 0) console.log(`… ${ok}/${files.length}`);
    } catch (e) {
      failed++;
      const msg = e instanceof Error ? e.message : String(e);
      failures.push({ file: rel, error: msg });
      console.error(`FAIL ${rel}: ${msg}`);
    }
  }

  const total = await prisma.studyTicket.count();
  const report = {
    importedAt: new Date().toISOString(),
    files: files.length,
    ok,
    failed,
    dbCount: total,
    failures,
  };

  mkdirSync(IMPORTED, { recursive: true });
  writeFileSync(
    join(IMPORTED, '_import-report.json'),
    JSON.stringify(report, null, 2),
    'utf8',
  );

  console.log('\n=== RESUMO ===');
  console.log(JSON.stringify(report, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
