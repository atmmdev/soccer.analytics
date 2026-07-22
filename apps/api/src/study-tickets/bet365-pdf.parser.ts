/**
 * Parser Bet365 v2 — histórico resolvido (PDF).
 * Suporta: Criar Aposta, múltiplas clássicas, placar, boost, cash out.
 */

export type ParsedLegStatus = 'WON' | 'LOST' | 'VOID' | 'PENDING' | 'UNKNOWN';

export interface ParsedStudyLeg {
  sortOrder: number;
  builderGroup: number | null;
  matchLabel: string;
  matchDate: string | null;
  market: string;
  selection: string;
  period: string | null;
  odd: number | null;
  boostedOdd: number | null;
  status: ParsedLegStatus | null;
  meta?: Record<string, unknown>;
}

export interface ParsedCashOut {
  at: string | null;
  value: number | null;
  usedStake: number | null;
  originalStake: number | null;
  total: number | null;
}

export interface ParsedStudyTicket {
  sourceFile: string;
  bet365Ref: string | null;
  placedAt: string;
  betType: string | null;
  betLabel: string | null;
  status: 'WON' | 'LOST' | 'VOID' | 'CASHED_OUT' | 'PENDING' | 'UNKNOWN';
  stake: number;
  unitStake: number | null;
  numBets: number | null;
  combinedOdd: number | null;
  potentialReturn: number | null;
  actualReturn: number | null;
  cashOut: ParsedCashOut | null;
  hasOddsBoost: boolean;
  needsReview: boolean;
  legs: ParsedStudyLeg[];
  rawLines: string[];
  warnings: string[];
}

const SIDEBAR_NOISE = new Set([
  'apostas esportivas resolvidas',
  'voltar',
  'histórico',
  'historico',
  'apostas resolvidas',
  'apostas pendentes',
  'depósitos',
  'depositos',
  'saques',
  'ajustes',
  'depósitos líquidos',
  'depositos liquidos',
  'ganhos/perdas',
  'declaração de rendimentos',
  'declaracao de rendimentos',
  'pessoais',
  'substituição+',
  'substituicao+',
  'p inclui prorrogação',
  'p inclui prorrogacao',
]);

const PII_PATTERNS = [
  /^ANDERSON\b/i,
  /^Rua\b/i,
  /^\d{11}$/,
  /CNPJ/i,
  /HS do Brasil/i,
  /Secretaria de Prêmios/i,
  /Termos e Condições/i,
  /Local da aposta:/i,
  /^Nilópolis/i,
  /^Duque de Caxias/i,
  /^Google Chrome/i,
  /^Google\s*Ch/i,
  /^[0-9A-F]{8}-[0-9A-F]{4}-/i,
  /^https?:\/\//i,
  /Sede registrada/i,
  /bet365/i,
  /^\d{1,2}\/\d{1,2}\/\d{2,4},?\s+\d/i, // "7/7/26, 8:45 PM"
  /Ministério da Fazenda/i,
  /Portaria SPA/i,
];

const FOOTER_START =
  /^(Tipo de Aposta:|N[ºo°]\s*de Apostas|Aposta Unit|Total da Aposta|Retorno\b|Encerrar Aposta|Pagamento Antecipado)/i;

function normalizeLine(line: string): string {
  return line.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

function parsePtNumber(raw: string): number | null {
  const cleaned = raw
    .replace(/R\$\s*/i, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function parsePtDateTime(date: string, time: string): string {
  const [d, m, y] = date.split('/').map(Number);
  const [hh, mm, ss] = time.split(':').map(Number);
  // PDF timestamps are local BR (UTC-3)
  return new Date(Date.UTC(y, m - 1, d, hh + 3, mm, ss || 0)).toISOString();
}

function mapStatus(token: string | undefined | null): ParsedLegStatus | null {
  if (!token) return null;
  const t = token.toLowerCase();
  if (t.includes('ganhou')) return 'WON';
  if (t.includes('perdeu')) return 'LOST';
  if (t.includes('anulado') || t.includes('void')) return 'VOID';
  if (t.includes('pendente')) return 'PENDING';
  return null;
}

function isNoise(line: string): boolean {
  if (!line) return true;
  const lower = line.toLowerCase();
  if (SIDEBAR_NOISE.has(lower)) return true;
  if (PII_PATTERNS.some((re) => re.test(line))) return true;
  if (/^Todas as apostas/i.test(line)) return true;
  return false;
}

function isPeriod(line: string): boolean {
  return /^90.?\+?\s*Acr/i.test(line) || /^45.?\+?\s*Acr/i.test(line);
}

function isMatchOnly(line: string): boolean {
  // "Inglaterra v Argentina" without trailing date
  return /\sv\s/.test(line) && !/\d{2}\/\d{2}\/\d{4}/.test(line);
}

function isMatchWithDate(line: string): boolean {
  return /\sv\s/.test(line) && /\d{2}\/\d{2}\/\d{4}/.test(line);
}

function splitMatchLabel(line: string): {
  matchLabel: string;
  matchDate: string | null;
} {
  const m = line.match(/^(.*?)\s+(\d{2}\/\d{2}\/\d{4})\s*$/);
  if (m) return { matchLabel: m[1].trim(), matchDate: m[2] };
  return { matchLabel: line, matchDate: null };
}

function stripTrailingStatus(line: string): {
  text: string;
  status: ParsedLegStatus | null;
} {
  const m = line.match(/^(.*?)\s+(Ganhou|Perdeu|Anulado|Pendente)\s*$/i);
  if (m) return { text: m[1].trim(), status: mapStatus(m[2]) };
  return { text: line, status: null };
}

function looksLikeMarket(line: string): boolean {
  const t = stripTrailingStatus(line).text;
  if (isPeriod(t) || isMatchOnly(t) || isMatchWithDate(t)) return false;
  if (/^Criar Aposta/i.test(t)) return false;
  if (/^Aposta Aumentada/i.test(t)) return false;
  if (FOOTER_START.test(t)) return false;
  // Markets often contain separators or known keywords
  return (
    /[-–—]|Resultado|Gols|Escanteios|Cartão|Cartões|Chutes|Defesas|Ambos|Jogador|Time|Intervalo|Final|Handicap|Placar|Total|Comparativa|Opções|Opcoes|Marcam|Pênalti|Penalti/i.test(
      t,
    ) || t.length < 60
  );
}

/** selection + 1–2 odds at end */
function parseSelectionWithOdds(line: string): {
  selection: string;
  odd: number | null;
  boostedOdd: number | null;
} | null {
  const m = line.match(/^(.*?)\s+(\d+[.,]\d{2})(?:\s+(\d+[.,]\d{2}))?\s*$/);
  if (!m) return null;
  const sel = m[1].trim();
  if (/^(criar aposta|simples|múltipla|multipla|aposta aumentada)/i.test(sel)) {
    return null;
  }
  if (isMatchWithDate(sel) || isMatchOnly(sel)) return null;
  return {
    selection: sel,
    odd: parsePtNumber(m[2]),
    boostedOdd: m[3] ? parsePtNumber(m[3]) : null,
  };
}

/** "Espanha 2-0 6,50" */
function parseScoreSelection(line: string): {
  selection: string;
  odd: number | null;
} | null {
  const m = line.match(/^(.+?)\s+(\d+\s*[-–]\s*\d+)\s+(\d+[.,]\d{2})\s*$/);
  if (!m) return null;
  return {
    selection: `${m[1].trim()} ${m[2].replace(/\s/g, '')}`,
    odd: parsePtNumber(m[3]),
  };
}

/** "Chapecoense 3,00" (team + single odd) */
function parseTeamOdd(line: string): {
  selection: string;
  odd: number | null;
} | null {
  const m = line.match(/^(.+?)\s+(\d+[.,]\d{2})\s*$/);
  if (!m) return null;
  const sel = m[1].trim();
  if (/criar aposta|aposta aumentada|total da|retorno|tipo de/i.test(sel)) {
    return null;
  }
  if (isMatchOnly(sel) || isMatchWithDate(sel)) return null;
  if (parseSelectionWithOdds(line)?.boostedOdd) return null;
  return { selection: sel, odd: parsePtNumber(m[2]) };
}

function parseCriarApostaHeader(line: string): {
  odd: number | null;
  boostedOdd: number | null;
} | null {
  const m = line.match(
    /^Criar Aposta(?:\s*\+)?\s+(\d+[.,]\d{2})(?:\s+(\d+[.,]\d{2}))?\s*$/i,
  );
  if (!m) return null;
  return {
    odd: parsePtNumber(m[1]),
    boostedOdd: m[2] ? parsePtNumber(m[2]) : null,
  };
}

function extractFooter(lines: string[]) {
  let betType: string | null = null;
  let numBets: number | null = null;
  let unitStake: number | null = null;
  let stake = 0;
  let actualReturn: number | null = null;
  let cashOut: ParsedCashOut | null = null;

  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    const tipo = line.match(/^Tipo de Aposta:\s*(.+)$/i);
    if (tipo) betType = tipo[1].trim();

    const nb = line.match(/^N[ºo°]\s*de Apostas\s+(\d+)/i);
    if (nb) numBets = Number(nb[1]);
    if (/^N[ºo°]\s*de Apostas$/i.test(line) && li + 1 < lines.length) {
      const v = Number(lines[li + 1]);
      if (Number.isFinite(v)) numBets = v;
    }

    const unit = line.match(/^Aposta Unit[áa]ria\s+R\$\s*([\d.,]+)/i);
    if (unit) unitStake = parsePtNumber(unit[1]);
    if (/^Aposta Unit/i.test(line) && !unit && li + 1 < lines.length) {
      const v = parsePtNumber(lines[li + 1].replace(/^R\$\s*/, ''));
      if (v != null) unitStake = v;
    }

    const total = line.match(/^Total da Aposta\s+R\$\s*([\d.,]+)/i);
    if (total) stake = parsePtNumber(total[1]) ?? stake;
    if (/^Total da Aposta$/i.test(line) && li + 1 < lines.length) {
      const v = parsePtNumber(lines[li + 1].replace(/^R\$\s*/, ''));
      if (v != null) stake = v;
    }

    const ret = line.match(/^Retorno\s+R\$\s*([\d.,]+)/i);
    if (ret) actualReturn = parsePtNumber(ret[1]);

    if (/^Encerrar Aposta/i.test(line)) {
      cashOut = cashOut ?? {
        at: null,
        value: null,
        usedStake: null,
        originalStake: null,
        total: null,
      };
      const valor = line.match(/Valor\s+R\$\s*([\d.,]+)/i);
      if (valor) cashOut.value = parsePtNumber(valor[1]);
      const tot = line.match(/Total\s+R\$\s*([\d.,]+)/i);
      if (tot) cashOut.total = parsePtNumber(tot[1]);
    }

    const dh = line.match(
      /^Data\/Hora\s+(\d{2}\/\d{2}\/\d{4})\s+(\d{2}:\d{2}:\d{2})/,
    );
    if (dh && cashOut) cashOut.at = parsePtDateTime(dh[1], dh[2]);

    const used = line.match(/^Aposta Utilizada\s+R\$\s*([\d.,]+)/i);
    if (used && cashOut) cashOut.usedStake = parsePtNumber(used[1]);

    const orig = line.match(/^Aposta Original\s+R\$\s*([\d.,]+)/i);
    if (orig && cashOut) cashOut.originalStake = parsePtNumber(orig[1]);
  }

  if (stake === 0 && unitStake != null) stake = unitStake;

  return { betType, numBets, unitStake, stake, actualReturn, cashOut };
}

/**
 * Layout Criar Aposta: após match, blocos seleção → mercado → período.
 * Odds do builder ficam no header (souvent 1,00 incorreto).
 */
function parseCriarApostaLegs(
  lines: string[],
  startIdx: number,
  matchLabel: string,
  matchDate: string | null,
  builderGroup: number,
): { legs: ParsedStudyLeg[]; nextIdx: number } {
  const legs: ParsedStudyLeg[] = [];
  let i = startIdx;
  let sortBase = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (FOOTER_START.test(line)) break;
    if (/^Criar Aposta/i.test(line)) break; // próximo builder na múltipla
    if (isMatchOnly(line) || isMatchWithDate(line)) break;

    // skip boost / noise already filtered
    if (/^Aposta Aumentada/i.test(line)) {
      i++;
      continue;
    }
    if (isPeriod(line)) {
      i++;
      continue;
    }

    // selection line (not a market-looking-only if next is market)
    const selLine = line;
    if (FOOTER_START.test(selLine)) break;

    let selection = stripTrailingStatus(selLine).text;
    let status = stripTrailingStatus(selLine).status;
    let market = '—';
    let period: string | null = null;
    let j = i + 1;

    // market
    if (j < lines.length && looksLikeMarket(lines[j]) && !isPeriod(lines[j])) {
      const ms = stripTrailingStatus(lines[j]);
      market = ms.text;
      status = ms.status ?? status;
      j++;
    }

    // period / flags
    while (j < lines.length) {
      if (isPeriod(lines[j])) {
        period = lines[j];
        j++;
        continue;
      }
      if (/^SUBSTITUI/i.test(lines[j]) || /^P Inclui/i.test(lines[j])) {
        j++;
        continue;
      }
      break;
    }

    // If we never got a market, maybe selection was wrong — still keep
    if (selection && selection !== matchLabel) {
      legs.push({
        sortOrder: sortBase++,
        builderGroup,
        matchLabel,
        matchDate,
        market,
        selection,
        period: period ?? "90'+ Acréscimos",
        odd: null,
        boostedOdd: null,
        status,
        meta: { builder: true },
      });
    }

    i = Math.max(j, i + 1);
  }

  return { legs, nextIdx: i };
}

function parseClassicLegs(lines: string[], startIdx: number): ParsedStudyLeg[] {
  const legs: ParsedStudyLeg[] = [];
  let i = startIdx;
  let sortOrder = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (FOOTER_START.test(line)) break;
    if (/^Criar Aposta/i.test(line)) {
      i++;
      continue;
    }

    // Pattern A: selection + odds → match+date → market [status] [boost]
    const withOdds = parseSelectionWithOdds(line);
    if (withOdds && i + 1 < lines.length && isMatchWithDate(lines[i + 1])) {
      const { matchLabel, matchDate } = splitMatchLabel(lines[i + 1]);
      let market = '—';
      let status: ParsedLegStatus | null = null;
      let period: string | null = "90'+ Acréscimos";
      let hasBoost = withOdds.boostedOdd != null;
      let j = i + 2;

      while (j < lines.length) {
        if (/^Aposta Aumentada/i.test(lines[j])) {
          hasBoost = true;
          j++;
          continue;
        }
        if (isPeriod(lines[j])) {
          period = lines[j];
          j++;
          continue;
        }
        if (
          !parseSelectionWithOdds(lines[j]) &&
          !parseScoreSelection(lines[j]) &&
          !parseTeamOdd(lines[j]) &&
          !isMatchWithDate(lines[j]) &&
          !FOOTER_START.test(lines[j])
        ) {
          const ms = stripTrailingStatus(lines[j]);
          if (ms.text) {
            market = ms.text;
            status = ms.status;
            j++;
          }
          break;
        }
        break;
      }

      legs.push({
        sortOrder: sortOrder++,
        builderGroup: null,
        matchLabel,
        matchDate,
        market,
        selection: withOdds.selection,
        period,
        odd: withOdds.odd,
        boostedOdd: withOdds.boostedOdd,
        status,
        meta: hasBoost ? { oddsBoost: true } : undefined,
      });
      i = j;
      continue;
    }

    // Pattern B: score line
    const score = parseScoreSelection(line);
    if (score && i + 1 < lines.length && isMatchWithDate(lines[i + 1])) {
      const { matchLabel, matchDate } = splitMatchLabel(lines[i + 1]);
      let market = 'Resultado Correto';
      let status: ParsedLegStatus | null = null;
      if (i + 2 < lines.length) {
        const ms = stripTrailingStatus(lines[i + 2]);
        if (!isMatchWithDate(ms.text) && !parseTeamOdd(ms.text)) {
          market = ms.text || market;
          status = ms.status;
        }
      }
      legs.push({
        sortOrder: sortOrder++,
        builderGroup: null,
        matchLabel,
        matchDate,
        market,
        selection: score.selection,
        period: "90'+ Acréscimos",
        odd: score.odd,
        boostedOdd: null,
        status,
      });
      i += status || market !== 'Resultado Correto' ? 3 : 2;
      continue;
    }

    // Pattern C: team + odd → match+date → Resultado Final
    const teamOdd = parseTeamOdd(line);
    if (teamOdd && i + 1 < lines.length && isMatchWithDate(lines[i + 1])) {
      const { matchLabel, matchDate } = splitMatchLabel(lines[i + 1]);
      let market = 'Resultado Final';
      let status: ParsedLegStatus | null = null;
      if (i + 2 < lines.length) {
        const ms = stripTrailingStatus(lines[i + 2]);
        if (!parseTeamOdd(ms.text) && !isMatchWithDate(ms.text)) {
          market = ms.text || market;
          status = ms.status;
        }
      }
      legs.push({
        sortOrder: sortOrder++,
        builderGroup: null,
        matchLabel,
        matchDate,
        market,
        selection: teamOdd.selection,
        period: "90'+ Acréscimos",
        odd: teamOdd.odd,
        boostedOdd: null,
        status,
      });
      i += 3;
      continue;
    }

    i++;
  }

  return legs;
}

/** Pernas soltas (seleção → mercado) a partir de um índice — não para no rodapé. */
function parseFlatSelectionMarketLegs(
  lines: string[],
  startIdx: number,
): Array<{
  selection: string;
  market: string;
  period: string | null;
  status: ParsedLegStatus | null;
}> {
  const out: Array<{
    selection: string;
    market: string;
    period: string | null;
    status: ParsedLegStatus | null;
  }> = [];
  let i = startIdx;

  while (i < lines.length) {
    const line = lines[i];
    if (/^Criar Aposta/i.test(line)) {
      i++;
      continue;
    }
    if (FOOTER_START.test(line)) {
      i++;
      continue;
    }
    if (
      /^Data\/Hora/i.test(line) ||
      /^Encerrar/i.test(line) ||
      /^Aposta Utilizada/i.test(line) ||
      /^Aposta Original/i.test(line) ||
      /^Pagamento Antecipado/i.test(line) ||
      /Ministério da Fazenda/i.test(line) ||
      /Portaria SPA/i.test(line) ||
      /\)\s*$/.test(line) && /\d{2}\/\d{2}\/\d{4}/.test(line)
    ) {
      i++;
      continue;
    }
    if (isMatchOnly(line) || isMatchWithDate(line)) {
      i++;
      continue;
    }
    if (isPeriod(line) || /^Aposta Aumentada/i.test(line)) {
      i++;
      continue;
    }
    if (/^Tipo de Aposta/i.test(line)) {
      i++;
      continue;
    }

    const sel = stripTrailingStatus(line);
    // skip orphan numbers / short garbage
    if (sel.text.length < 3 || /^\d+[.,]\d{2}$/.test(sel.text)) {
      i++;
      continue;
    }

    let market = '—';
    let status = sel.status;
    let period: string | null = null;
    let j = i + 1;

    if (j < lines.length && looksLikeMarket(lines[j]) && !isPeriod(lines[j])) {
      const ms = stripTrailingStatus(lines[j]);
      market = ms.text;
      status = ms.status ?? status;
      j++;
    }

    while (j < lines.length) {
      if (isPeriod(lines[j])) {
        period = lines[j];
        j++;
        continue;
      }
      if (/^SUBSTITUI/i.test(lines[j]) || /^P Inclui/i.test(lines[j])) {
        j++;
        continue;
      }
      break;
    }

    // Avoid treating markets as selections when no market followed
    if (market === '—' && looksLikeMarket(sel.text) && !/:/.test(sel.text) && !/- Para /i.test(sel.text)) {
      i++;
      continue;
    }

    out.push({
      selection: sel.text,
      market,
      period: period ?? "90'+ Acréscimos",
      status,
    });
    i = Math.max(j, i + 1);
  }

  return out;
}

/**
 * Distribui pernas flat entre N builders.
 * 1) Por nome de time na seleção/mercado
 * 2) Por corte em Ganhou/Perdeu quando bate o nº de builders
 * 3) Divisão igualitária
 */
function teamTokens(matchLabel: string): string[] {
  return matchLabel
    .split(/\sv\s/i)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3);
}

function normalizeTeam(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findBuilderIndex(
  selection: string,
  market: string,
  builders: Array<{ matchLabel: string }>,
): number | null {
  const text = normalizeTeam(`${selection} ${market}`);
  const hits: number[] = [];
  for (let i = 0; i < builders.length; i++) {
    for (const team of teamTokens(builders[i].matchLabel)) {
      const nt = normalizeTeam(team);
      if (nt.length >= 3 && text.includes(nt)) {
        hits.push(i);
        break;
      }
      // tokens significativos (ex.: "Bayern", "Leverkusen")
      const parts = nt.split(' ').filter((p) => p.length >= 4);
      if (parts.some((p) => text.includes(p))) {
        hits.push(i);
        break;
      }
    }
  }
  const uniq = [...new Set(hits)];
  return uniq.length === 1 ? uniq[0] : null;
}

function assignLegsToBuilders(
  flat: Array<{
    selection: string;
    market: string;
    period: string | null;
    status: ParsedLegStatus | null;
  }>,
  builders: Array<{ matchLabel: string; matchDate: string | null }>,
): ParsedStudyLeg[] {
  if (builders.length === 0) return [];
  if (builders.length === 1) {
    return flat.map((f, idx) => ({
      sortOrder: idx,
      builderGroup: 0,
      matchLabel: builders[0].matchLabel,
      matchDate: builders[0].matchDate,
      market: f.market,
      selection: f.selection,
      period: f.period,
      odd: null,
      boostedOdd: null,
      status: f.status,
      meta: { builder: true },
    }));
  }

  // Pass 1: team name
  const assigned: Array<(typeof flat)[0] & { builderGroup: number } | null> =
    flat.map(() => null);
  const byBuilder: (typeof flat)[] = builders.map(() => []);

  for (let i = 0; i < flat.length; i++) {
    const bi = findBuilderIndex(flat[i].selection, flat[i].market, builders);
    if (bi != null) {
      assigned[i] = { ...flat[i], builderGroup: bi };
      byBuilder[bi].push(flat[i]);
    }
  }

  const unassignedIdx = assigned
    .map((a, i) => (a == null ? i : -1))
    .filter((i) => i >= 0);

  const teamHitRate =
    flat.length === 0 ? 0 : (flat.length - unassignedIdx.length) / flat.length;

  // Se poucos matches por time, ignora e usa split por status / igualitário
  if (teamHitRate < 0.35) {
    for (let b = 0; b < byBuilder.length; b++) byBuilder[b] = [];
    const statusEnds = flat
      .map((f, idx) => (f.status ? idx : -1))
      .filter((idx) => idx >= 0);
    const groups: (typeof flat)[] = [];
    if (statusEnds.length === builders.length) {
      let start = 0;
      for (const end of statusEnds) {
        groups.push(flat.slice(start, end + 1));
        start = end + 1;
      }
      if (start < flat.length) {
        groups[groups.length - 1].push(...flat.slice(start));
      }
    } else {
      const size = Math.ceil(flat.length / builders.length);
      for (let b = 0; b < builders.length; b++) {
        groups.push(flat.slice(b * size, (b + 1) * size));
      }
    }
    const legs: ParsedStudyLeg[] = [];
    let sort = 0;
    for (let b = 0; b < builders.length; b++) {
      for (const f of groups[b] ?? []) {
        legs.push({
          sortOrder: sort++,
          builderGroup: b,
          matchLabel: builders[b].matchLabel,
          matchDate: builders[b].matchDate,
          market: f.market,
          selection: f.selection,
          period: f.period,
          odd: null,
          boostedOdd: null,
          status: f.status,
          meta: { builder: true, assign: 'split' },
        });
      }
    }
    return legs;
  }

  if (unassignedIdx.length === 0) {
    const legs: ParsedStudyLeg[] = [];
    let sort = 0;
    for (let b = 0; b < builders.length; b++) {
      for (const f of byBuilder[b]) {
        legs.push({
          sortOrder: sort++,
          builderGroup: b,
          matchLabel: builders[b].matchLabel,
          matchDate: builders[b].matchDate,
          market: f.market,
          selection: f.selection,
          period: f.period,
          odd: null,
          boostedOdd: null,
          status: f.status,
          meta: { builder: true, assign: 'team' },
        });
      }
    }
    return legs;
  }

  // Pass 2: status-end groups for leftovers + already assigned keep place
  const statusEnds = flat
    .map((f, idx) => (f.status ? idx : -1))
    .filter((idx) => idx >= 0);

  const groups: typeof flat[] = [];
  if (statusEnds.length === builders.length) {
    let start = 0;
    for (const end of statusEnds) {
      groups.push(flat.slice(start, end + 1));
      start = end + 1;
    }
    if (start < flat.length) {
      groups[groups.length - 1].push(...flat.slice(start));
    }
  } else if (unassignedIdx.length === flat.length) {
    const size = Math.ceil(flat.length / builders.length);
    for (let b = 0; b < builders.length; b++) {
      groups.push(flat.slice(b * size, (b + 1) * size));
    }
  } else {
    // keep team-assigned; dump leftovers on last builder that has room / first
    for (const i of unassignedIdx) {
      const target =
        byBuilder.findIndex((g) => g.length === 0) >= 0
          ? byBuilder.findIndex((g) => g.length === 0)
          : builders.length - 1;
      byBuilder[target].push(flat[i]);
    }
    const legs: ParsedStudyLeg[] = [];
    let sort = 0;
    for (let b = 0; b < builders.length; b++) {
      for (const f of byBuilder[b]) {
        legs.push({
          sortOrder: sort++,
          builderGroup: b,
          matchLabel: builders[b].matchLabel,
          matchDate: builders[b].matchDate,
          market: f.market,
          selection: f.selection,
          period: f.period,
          odd: null,
          boostedOdd: null,
          status: f.status,
          meta: { builder: true, assign: 'team+fallback' },
        });
      }
    }
    return legs;
  }

  const legs: ParsedStudyLeg[] = [];
  let sort = 0;
  for (let b = 0; b < builders.length; b++) {
    const g = groups[b] ?? [];
    for (const f of g) {
      legs.push({
        sortOrder: sort++,
        builderGroup: b,
        matchLabel: builders[b].matchLabel,
        matchDate: builders[b].matchDate,
        market: f.market,
        selection: f.selection,
        period: f.period,
        odd: null,
        boostedOdd: null,
        status: f.status,
        meta: { builder: true, assign: 'status-split' },
      });
    }
  }
  return legs;
}

export function parseBet365PdfText(
  text: string,
  sourceFile: string,
): ParsedStudyTicket {
  const warnings: string[] = [];
  const allLines = text
    .split(/\r?\n/)
    .map(normalizeLine)
    .filter(Boolean);
  const lines = allLines.filter((l) => !isNoise(l));

  let bet365Ref: string | null = null;
  let placedAt: string | null = null;

  const headerIdx = lines.findIndex((l) =>
    /[A-Z]{2}\d+[A-Z]?\s+\d{2}\/\d{2}\/\d{4}/.test(l),
  );
  if (headerIdx >= 0) {
    const hm = lines[headerIdx].match(
      /([A-Z]{2}\d+[A-Z]?)\s+(\d{2}\/\d{2}\/\d{4})\s*(\d{2}:\d{2}:\d{2})/,
    );
    if (hm) {
      bet365Ref = hm[1];
      placedAt = parsePtDateTime(hm[2], hm[3]);
    }
  }

  if (!placedAt) {
    const base = sourceFile.split(/[/\\]/).pop() ?? '';
    const fm = base.match(/^(\d{2})(\d{2})(\d{4})-(\d{2})(\d{2})(\d{2})/);
    if (fm) {
      placedAt = parsePtDateTime(
        `${fm[1]}/${fm[2]}/${fm[3]}`,
        `${fm[4]}:${fm[5]}:${fm[6]}`,
      );
      warnings.push('placedAt inferido do nome do arquivo');
    } else {
      const fm2 = base.match(/^(\d{2})(\d{2})(\d{4})-(\d{2})hs/);
      if (fm2) {
        placedAt = parsePtDateTime(
          `${fm2[1]}/${fm2[2]}/${fm2[3]}`,
          `${fm2[4]}:00:00`,
        );
        warnings.push('placedAt inferido do nome do arquivo (hora aproximada)');
      } else {
        placedAt = new Date().toISOString();
        warnings.push('placedAt não encontrado');
      }
    }
  }

  const footer = extractFooter(lines);
  const hasOddsBoost =
    lines.some((l) => /Aposta Aumentada/i.test(l)) ||
    lines.some((l) => /^Criar Aposta.+\d+[.,]\d{2}\s+\d+[.,]\d{2}/i.test(l));

  let legs: ParsedStudyLeg[] = [];
  let headerCombinedOdd: number | null = null;
  let headerBoostedOdd: number | null = null;

  const criarCount = lines.filter((l) => /^Criar Aposta/i.test(l)).length;

  type Builder = {
    matchLabel: string;
    matchDate: string | null;
    odd: number | null;
    boostedOdd: number | null;
  };
  const builders: Builder[] = [];

  // 1) Coletar headers Criar Aposta + partidas
  for (let i = headerIdx >= 0 ? headerIdx + 1 : 0; i < lines.length; i++) {
    const criar = parseCriarApostaHeader(lines[i]);
    if (!criar) continue;

    if (criar.boostedOdd != null && criar.boostedOdd > 1.01) {
      headerBoostedOdd = criar.boostedOdd;
      headerCombinedOdd = criar.odd;
    } else if (criar.odd != null && criar.odd > 1.01) {
      if (headerCombinedOdd == null) headerCombinedOdd = criar.odd;
    } else if (criar.odd != null && criar.odd <= 1.01) {
      warnings.push(
        `Criar Aposta com odd ${criar.odd} no PDF (provavelmente incorreta — editar)`,
      );
    }

    let j = i + 1;
    while (j < lines.length && /^Aposta Aumentada/i.test(lines[j])) j++;
    let matchLabel = '—';
    let matchDate: string | null = null;
    if (j < lines.length && (isMatchOnly(lines[j]) || isMatchWithDate(lines[j]))) {
      const sm = splitMatchLabel(lines[j]);
      matchLabel = sm.matchLabel;
      matchDate = sm.matchDate;
    }
    builders.push({
      matchLabel,
      matchDate,
      odd: criar.odd,
      boostedOdd: criar.boostedOdd,
    });
  }

  if (builders.length > 0) {
    const footerIdx = lines.findIndex((l) => FOOTER_START.test(l));
    const postFooterLines =
      footerIdx >= 0
        ? lines.slice(footerIdx + 1).filter(
            (l) =>
              !FOOTER_START.test(l) &&
              !/^R\$/.test(l) &&
              !/^\d+[.,]\d{2}$/.test(l) &&
              !/^Encerrar/i.test(l) &&
              !/^Data\/Hora/i.test(l) &&
              !/^Aposta Utilizada/i.test(l) &&
              !/^Aposta Original/i.test(l) &&
              !/^Pagamento Antecipado/i.test(l),
          )
        : [];

    // Preferir pernas após rodapé (Duplas/Triplas / híbridos) — evita engolir Over clássico no meio
    if (postFooterLines.length >= 2) {
      const flat = parseFlatSelectionMarketLegs(lines, footerIdx);
      legs = assignLegsToBuilders(flat, builders);
      if (legs.length) {
        warnings.push(
          `Pernas após rodapé atribuídas a ${builders.length} Criar Aposta (por time/status)`,
        );
      }
    }

    // Pernas inline só se ainda vazio (Criar Aposta simples sem bloco final)
    if (legs.length === 0) {
      for (let b = 0; b < builders.length; b++) {
        const headerLineIdx = lines.findIndex((l, idx) => {
          if (!parseCriarApostaHeader(l)) return false;
          let n = 0;
          for (let k = 0; k <= idx; k++) {
            if (parseCriarApostaHeader(lines[k])) {
              if (n === b) return k === idx;
              n++;
            }
          }
          return false;
        });
        if (headerLineIdx < 0) continue;
        let j = headerLineIdx + 1;
        while (j < lines.length && /^Aposta Aumentada/i.test(lines[j])) j++;
        if (
          j < lines.length &&
          (isMatchOnly(lines[j]) || isMatchWithDate(lines[j]))
        ) {
          j++;
        }
        if (
          j < lines.length &&
          !parseCriarApostaHeader(lines[j]) &&
          !FOOTER_START.test(lines[j]) &&
          !parseSelectionWithOdds(lines[j]) &&
          !parseTeamOdd(lines[j])
        ) {
          const parsed = parseCriarApostaLegs(
            lines,
            j,
            builders[b].matchLabel,
            builders[b].matchDate,
            b,
          );
          if (parsed.legs.length) legs.push(...parsed.legs);
        }
      }
    }

    if (legs.length === 0) {
      const flat = parseFlatSelectionMarketLegs(
        lines,
        headerIdx >= 0 ? headerIdx + 1 : 0,
      );
      legs = assignLegsToBuilders(flat, builders);
    }

    // Pernas clássicas intercaladas (ex.: Over 3.5 no meio da múltipla)
    const classic = parseClassicLegs(
      lines,
      headerIdx >= 0 ? headerIdx + 1 : 0,
    );
    for (const c of classic) {
      const dup = legs.some(
        (l) =>
          l.selection === c.selection &&
          l.matchLabel === c.matchLabel,
      );
      if (!dup) {
        legs.push({ ...c, sortOrder: legs.length, meta: { ...(c.meta || {}), classic: true } });
      }
    }
  } else {
    // Clássico (sem Criar Aposta)
    legs = parseClassicLegs(lines, headerIdx >= 0 ? headerIdx + 1 : 0);
  }

  // Fallback clássico se Criar Aposta falhou totalmente
  if (legs.length === 0 && criarCount === 0) {
    legs = parseClassicLegs(lines, headerIdx >= 0 ? headerIdx + 1 : 0);
  }

  // Re-number sortOrder
  legs.forEach((l, idx) => {
    l.sortOrder = idx;
  });

  // Combined odd
  const effectiveOdds = legs
    .map((l) => l.boostedOdd ?? l.odd)
    .filter((o): o is number => o != null && o > 1.001);

  // Produto das odds de header dos builders (quando > 1.01)
  const builderOdds = builders
    .map((b) => b.boostedOdd ?? b.odd)
    .filter((o): o is number => o != null && o > 1.001);

  let combinedOdd: number | null = null;
  if (effectiveOdds.length === legs.length && legs.length > 0) {
    combinedOdd = Number(effectiveOdds.reduce((a, b) => a * b, 1).toFixed(4));
  } else if (builderOdds.length === builders.length && builders.length > 0) {
    combinedOdd = Number(builderOdds.reduce((a, b) => a * b, 1).toFixed(4));
    warnings.push('Odd combinada = produto dos headers Criar Aposta');
  } else if (headerBoostedOdd != null && headerBoostedOdd > 1.01) {
    combinedOdd = headerBoostedOdd;
    warnings.push('Odd combinada do header Criar Aposta (boost)');
  } else if (headerCombinedOdd != null && headerCombinedOdd > 1.01) {
    combinedOdd = headerCombinedOdd;
    warnings.push('Odd combinada do header Criar Aposta');
  } else if (effectiveOdds.length > 0) {
    combinedOdd = Number(effectiveOdds.reduce((a, b) => a * b, 1).toFixed(4));
    warnings.push(
      `Odd combinada parcial ${effectiveOdds.length}/${legs.length} pernas`,
    );
  } else {
    warnings.push('Odd combinada ausente ou 1.00 — precisa revisão manual');
  }

  const stake = footer.stake;
  const potentialReturn =
    combinedOdd != null && stake > 0
      ? Number((stake * combinedOdd).toFixed(2))
      : null;

  // Ticket status
  let status: ParsedStudyTicket['status'] = 'UNKNOWN';
  if (
    footer.cashOut?.value != null ||
    footer.cashOut?.total != null ||
    lines.some((l) => /Encerrar Aposta/i.test(l))
  ) {
    status = 'CASHED_OUT';
  } else if (legs.length > 0 && legs.every((l) => l.status === 'WON')) {
    status = 'WON';
  } else if (legs.some((l) => l.status === 'LOST')) {
    status = 'LOST';
  } else if (legs.some((l) => l.status === 'PENDING')) {
    status = 'PENDING';
  } else if (
    footer.actualReturn != null &&
    footer.actualReturn > 0 &&
    legs.every((l) => l.status === 'WON' || l.status == null)
  ) {
    status = 'WON';
  }

  if (status === 'CASHED_OUT' && footer.actualReturn == null) {
    footer.actualReturn =
      footer.cashOut?.total ?? footer.cashOut?.value ?? null;
  }

  if (status === 'UNKNOWN' && lines.some((l) => /\bPerdeu\b/i.test(l))) {
    status = 'LOST';
  }
  if (
    status === 'UNKNOWN' &&
    lines.some((l) => /\bGanhou\b/i.test(l)) &&
    !lines.some((l) => /\bPerdeu\b/i.test(l))
  ) {
    status = 'WON';
  }

  const betLabel =
    criarCount > 0
      ? hasOddsBoost
        ? 'Criar Aposta + Aposta Aumentada'
        : 'Criar Aposta'
      : legs[0]?.market ?? null;

  let betType = footer.betType;
  if (!betType && criarCount > 1) {
    betType =
      criarCount === 2
        ? 'Duplas'
        : criarCount === 3
          ? 'Triplas'
          : `${criarCount} Múltiplas`;
  }
  if (!betType && criarCount === 1) betType = 'Criar Aposta';
  if (!betType && legs.length > 1) betType = `${legs.length} Múltiplas`;
  if (!betType && legs.length === 1) betType = 'Simples';

  const needsReview =
    legs.length === 0 ||
    combinedOdd == null ||
    combinedOdd <= 1.01 ||
    legs.some((l) => !l.selection || l.selection === '—');

  if (legs.length === 0) {
    warnings.push('Nenhuma perna extraída');
  }

  return {
    sourceFile,
    bet365Ref,
    placedAt,
    betType,
    betLabel,
    status,
    stake,
    unitStake: footer.unitStake,
    numBets: footer.numBets,
    combinedOdd,
    potentialReturn,
    actualReturn: footer.actualReturn,
    cashOut: footer.cashOut,
    hasOddsBoost,
    needsReview,
    legs,
    rawLines: lines,
    warnings,
  };
}
