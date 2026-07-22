/**
 * Gera JSON de TODOS os PDFs Bet365 em docs/betting/data/bilhetes,
 * espelhando ano/mês em docs/betting/data/bilhetes/imported/.
 *
 * Uso (apps/api):
 *   pnpm exec ts-node prisma/export-all-study-tickets.ts
 *   pnpm exec ts-node prisma/export-all-study-tickets.ts --force   # sobrescreve curados
 */
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { parseBet365PdfText } from '../src/study-tickets/bet365-pdf.parser';

const BILHETES = resolve(__dirname, '../../../docs/betting/data/bilhetes');
const IMPORTED = resolve(BILHETES, 'imported');
const force = process.argv.includes('--force');

/** Arquivos já curados manualmente — não sobrescrever sem --force */
const CURATED = new Set([
  '2026/junho/01062026-101347hs.json',
]);

function extractPdf(abs: string): string {
  try {
    return execFileSync('pdftotext', ['-raw', '-enc', 'UTF-8', abs, '-'], {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch {
    return execFileSync('pdftotext', ['-raw', abs, '-'], {
      encoding: 'latin1',
      maxBuffer: 10 * 1024 * 1024,
    });
  }
}

function walkPdfs(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (name === 'imported') continue;
      out.push(...walkPdfs(full));
    } else if (name.toLowerCase().endsWith('.pdf')) {
      out.push(full);
    }
  }
  return out;
}

function pdfToJsonRel(pdfAbs: string): string {
  // 2026/junho/01062026-101347hs.pdf → 2026/junho/01062026-101347hs.json
  const rel = relative(BILHETES, pdfAbs).replace(/\\/g, '/');
  return rel.replace(/\.pdf$/i, '.json');
}

function main() {
  mkdirSync(IMPORTED, { recursive: true });
  const pdfs = walkPdfs(BILHETES).sort();
  console.log(`Encontrados ${pdfs.length} PDFs`);

  let ok = 0;
  let skipped = 0;
  let failed = 0;
  let withWarnings = 0;
  let oddSuspect = 0;
  const failures: { file: string; error: string }[] = [];
  const summaryByMonth: Record<string, number> = {};

  for (const pdfAbs of pdfs) {
    const jsonRel = pdfToJsonRel(pdfAbs);
    const jsonAbs = join(IMPORTED, jsonRel);
    const monthKey = dirname(jsonRel); // e.g. 2026/junho

    if (!force && CURATED.has(jsonRel) && existsSync(jsonAbs)) {
      console.log(`SKIP curated ${jsonRel}`);
      skipped++;
      summaryByMonth[monthKey] = (summaryByMonth[monthKey] ?? 0) + 1;
      continue;
    }

    // Preserve existing curated marker
    if (!force && existsSync(jsonAbs)) {
      try {
        const prev = JSON.parse(readFileSync(jsonAbs, 'utf8'));
        if (prev._curated === true) {
          console.log(`SKIP _curated ${jsonRel}`);
          skipped++;
          summaryByMonth[monthKey] = (summaryByMonth[monthKey] ?? 0) + 1;
          continue;
        }
      } catch {
        /* regenerate */
      }
    }

    try {
      const sourceFile = `docs/betting/data/bilhetes/${relative(BILHETES, pdfAbs).replace(/\\/g, '/')}`;
      const text = extractPdf(pdfAbs);
      const parsed = parseBet365PdfText(text, sourceFile);

      const out = {
        _meta: {
          exportedAt: new Date().toISOString(),
        parser: 'bet365-pdf.parser@2',
        sourcePdf: basename(pdfAbs),
        curated: false,
        needsReview: parsed.needsReview,
        },
        ...parsed,
        // rawLines pode ser grande; manter para IA / reprocessamento
      };

      mkdirSync(dirname(jsonAbs), { recursive: true });
      writeFileSync(jsonAbs, JSON.stringify(out, null, 2), 'utf8');

      const suspect =
        parsed.combinedOdd == null ||
        parsed.combinedOdd <= 1.01 ||
        parsed.legs.some((l) => (l.odd ?? 0) <= 1.01 && (l.boostedOdd ?? 0) <= 1.01);

      if (suspect) oddSuspect++;
      if (parsed.warnings.length) withWarnings++;

      ok++;
      summaryByMonth[monthKey] = (summaryByMonth[monthKey] ?? 0) + 1;

      if (ok % 50 === 0) {
        console.log(`… ${ok}/${pdfs.length}`);
      }
    } catch (e) {
      failed++;
      failures.push({
        file: jsonRel,
        error: e instanceof Error ? e.message : String(e),
      });
      console.error(`FAIL ${jsonRel}:`, e);
    }
  }

  const report = {
    exportedAt: new Date().toISOString(),
    totalPdfs: pdfs.length,
    ok,
    skipped,
    failed,
    withWarnings,
    oddSuspect,
    byMonth: summaryByMonth,
    failures,
    note:
      'Bilhetes com oddSuspect (odd ~1.00 ou ausente) devem ser revisados na UI antes de deletar o PDF.',
  };

  writeFileSync(
    join(IMPORTED, '_export-report.json'),
    JSON.stringify(report, null, 2),
    'utf8',
  );

  console.log('\n=== RESUMO ===');
  console.log(JSON.stringify(report, null, 2));
  console.log(`\nJSONs em: ${IMPORTED}`);
}

main();
