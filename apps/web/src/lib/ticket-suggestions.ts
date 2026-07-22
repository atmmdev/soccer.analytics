/**
 * Sugestões de bilhete por perfil — alinhado a docs/betting/examples/
 * e regras de docs/betting/ai/correlacoes.md
 */

import type { EvPlusMarket } from '@/types/analysis';
import { formatMarketLabel, getMarketCategoryLabel } from '@/lib/market-labels';

export type TicketProfileId =
  | 'conservador'
  | 'moderado'
  | 'agressivo'
  | 'jogadores';

export interface TicketProfileMeta {
  id: TicketProfileId;
  name: string;
  objective: string;
  oddTarget: string;
  stakeHint: string;
  docPath: string;
}

export interface SuggestedLeg extends EvPlusMarket {
  why: string;
}

export interface SuggestedTicket {
  profile: TicketProfileMeta;
  legs: SuggestedLeg[];
  combinedOdd: number;
  avgEv: number;
  avgConfidence: number;
  correlationNote: string;
  buildable: boolean;
  unavailableReason?: string;
}

const PROFILES: TicketProfileMeta[] = [
  {
    id: 'conservador',
    name: 'Conservador',
    objective: 'Baixo risco — odd baixa com edge estatístico',
    oddTarget: '1,40 – 2,00',
    stakeHint: '1–2% da banca',
    docPath: 'docs/betting/examples/bilhete-conservador.md',
  },
  {
    id: 'moderado',
    name: 'Moderado',
    objective: 'Risco médio — Over/BTTS/1X2 com EV positivo',
    oddTarget: '4,00 – 6,00 (múltipla) · 1,60–2,20 (por perna)',
    stakeHint: '1–1,5% da banca',
    docPath: 'docs/betting/examples/bilhete-moderado.md',
  },
  {
    id: 'agressivo',
    name: 'Agressivo',
    objective: 'Alto retorno — zebra, Over alto ou props',
    oddTarget: '15,00+ (múltipla) · 2,40+ (por perna)',
    stakeHint: '0,5% da banca',
    docPath: 'docs/betting/examples/bilhete-agressivo.md',
  },
  {
    id: 'jogadores',
    name: 'Jogadores',
    objective: 'Props de marcador (anytime)',
    oddTarget: '2,00 – 5,00',
    stakeHint: '0,5–1% da banca',
    docPath: 'docs/betting/examples/bilhete-jogadores.md',
  },
];

function typeOf(m: EvPlusMarket): string {
  return (m.marketType ?? 'MATCH_RESULT').toUpperCase();
}

function isEligible(m: EvPlusMarket): boolean {
  return (
    m.recommendation === 'BET' ||
    (m.recommendation === 'WATCH' && m.ev > 0.05)
  );
}

function byEv(a: EvPlusMarket, b: EvPlusMarket) {
  return b.ev - a.ev;
}

function findBest(
  markets: EvPlusMarket[],
  predicate: (m: EvPlusMarket) => boolean,
): EvPlusMarket | null {
  const hits = markets.filter((m) => isEligible(m) && predicate(m)).sort(byEv);
  return hits[0] ?? null;
}

function selectionOf(m: EvPlusMarket) {
  return m.market.trim().toLowerCase();
}

function whyFor(profile: TicketProfileId, m: EvPlusMarket): string {
  const label = formatMarketLabel(m.marketType, m.market);
  const ev = `${m.ev >= 0 ? '+' : ''}${(m.ev * 100).toFixed(1)}%`;
  const base = `${label} · EV ${ev} · conf. ${m.confidence}% · ${m.recommendation}`;

  switch (profile) {
    case 'conservador':
      return `${base}. Perfil conservador prioriza odd baixa e barreira fácil (ex.: Over 1.5 / Under 3.5), como em bilhete-conservador.md.`;
    case 'moderado':
      return `${base}. Perfil moderado segue o padrão Over 2.5 / BTTS / 1X2 de bilhete-moderado.md.`;
    case 'agressivo':
      return `${base}. Perfil agressivo busca odd alta ou linha agressiva (Over 3.5, visitante, props), como em bilhete-agressivo.md.`;
    case 'jogadores':
      return `${base}. Prop de marcador — modelo ${m.playerModel ? 'disponível' : 'implícito'}; ver bilhete-jogadores.md.`;
    default:
      return base;
  }
}

function toLeg(profile: TicketProfileId, m: EvPlusMarket): SuggestedLeg {
  return { ...m, why: whyFor(profile, m) };
}

function finish(
  profile: TicketProfileMeta,
  legs: SuggestedLeg[],
  correlationNote: string,
  unavailableReason?: string,
): SuggestedTicket {
  if (legs.length === 0) {
    return {
      profile,
      legs: [],
      combinedOdd: 0,
      avgEv: 0,
      avgConfidence: 0,
      correlationNote,
      buildable: false,
      unavailableReason:
        unavailableReason ??
        'Não há mercados elegíveis (BET/WATCH com EV) deste perfil neste jogo.',
    };
  }

  const combinedOdd = Number(
    legs.reduce((acc, l) => acc * l.bookmakerOdd, 1).toFixed(2),
  );
  const avgEv =
    legs.reduce((acc, l) => acc + l.ev, 0) / legs.length;
  const avgConfidence =
    legs.reduce((acc, l) => acc + l.confidence, 0) / legs.length;

  return {
    profile,
    legs,
    combinedOdd,
    avgEv: Math.round(avgEv * 1000) / 1000,
    avgConfidence: Math.round(avgConfidence),
    correlationNote,
    buildable: true,
  };
}

/** Conservador: Over 1.5, Under 3.5, favorito curto — odd por perna ≤ ~1.55 */
function buildConservador(markets: EvPlusMarket[]): SuggestedTicket {
  const profile = PROFILES[0];
  const over15 = findBest(
    markets,
    (m) =>
      typeOf(m) === 'OVER_UNDER' &&
      /over\s*1\.5/i.test(m.market) &&
      m.bookmakerOdd <= 1.55,
  );
  const under35 = findBest(
    markets,
    (m) =>
      typeOf(m) === 'OVER_UNDER' &&
      /under\s*3\.5/i.test(m.market) &&
      m.bookmakerOdd <= 1.55,
  );
  const safeHome = findBest(
    markets,
    (m) =>
      typeOf(m) === 'MATCH_RESULT' &&
      selectionOf(m) === 'casa' &&
      m.probability >= 0.55 &&
      m.bookmakerOdd <= 1.7,
  );
  const safeBttsNo = findBest(
    markets,
    (m) =>
      typeOf(m) === 'BTTS' &&
      /não|nao|no/i.test(m.market) &&
      m.bookmakerOdd <= 1.7,
  );

  // Preferir 1–2 pernas de odd baixa (doc: Over 1.5 / Under 3.5)
  const picks: EvPlusMarket[] = [];
  for (const c of [over15, under35, safeHome, safeBttsNo]) {
    if (!c) continue;
    if (picks.some((p) => p.market === c.market)) continue;
    // Evitar Over + Under conflitantes
    if (
      picks.some(
        (p) =>
          typeOf(p) === 'OVER_UNDER' &&
          typeOf(c) === 'OVER_UNDER' &&
          /over/i.test(p.market) !== /over/i.test(c.market),
      )
    ) {
      continue;
    }
    picks.push(c);
    if (picks.length >= 2) break;
  }

  // Fallback: menor odd BET disponível
  if (picks.length === 0) {
    const safest = [...markets]
      .filter((m) => isEligible(m) && m.bookmakerOdd <= 1.8 && m.ev > 0)
      .sort((a, b) => a.bookmakerOdd - b.bookmakerOdd)[0];
    if (safest) picks.push(safest);
  }

  return finish(
    profile,
    picks.map((m) => toLeg('conservador', m)),
    picks.length > 1
      ? 'Mesmo jogo: correlação possível — stake baixo (1–2%). Preferível simples se EV marginal.'
      : 'Uma perna conservadora (simples) — menor risco de correlação.',
  );
}

/** Moderado: Over 2.5, BTTS Sim, 1X2 — padrão bilhete-moderado.md */
function buildModerado(markets: EvPlusMarket[]): SuggestedTicket {
  const profile = PROFILES[1];
  const over25 = findBest(
    markets,
    (m) => typeOf(m) === 'OVER_UNDER' && /over\s*2\.5/i.test(m.market),
  );
  const bttsYes = findBest(
    markets,
    (m) => typeOf(m) === 'BTTS' && /sim|yes/i.test(m.market),
  );
  const result = findBest(
    markets,
    (m) =>
      typeOf(m) === 'MATCH_RESULT' &&
      m.bookmakerOdd >= 1.55 &&
      m.bookmakerOdd <= 2.4,
  );
  const corners = findBest(
    markets,
    (m) => typeOf(m) === 'CORNERS' && /over/i.test(m.market),
  );

  const picks: EvPlusMarket[] = [];
  // Doc: Over 2.5 + BTTS no MESMO jogo = correlação + → no máx. 1 dos dois + resultado OU escanteios
  const primary = [over25, bttsYes].filter(Boolean).sort((a, b) => byEv(a!, b!))[0];
  if (primary) picks.push(primary);

  for (const c of [result, corners]) {
    if (!c) continue;
    if (picks.some((p) => typeOf(p) === typeOf(c) || p.market === c.market)) continue;
    picks.push(c);
    if (picks.length >= 2) break;
  }

  if (picks.length === 0 && result) picks.push(result);
  if (picks.length === 0) {
    const mid = [...markets]
      .filter(
        (m) =>
          isEligible(m) &&
          m.bookmakerOdd >= 1.5 &&
          m.bookmakerOdd <= 2.5 &&
          m.ev > 0.04,
      )
      .sort(byEv)[0];
    if (mid) picks.push(mid);
  }

  const hasOverAndBtts =
    picks.some((p) => typeOf(p) === 'OVER_UNDER') &&
    picks.some((p) => typeOf(p) === 'BTTS');

  return finish(
    profile,
    picks.map((m) => toLeg('moderado', m)),
    hasOverAndBtts
      ? 'Aviso (correlacoes.md): Over gols + BTTS no mesmo jogo = correlação +. Máx. 2 pernas correlacionadas.'
      : picks.length > 1
        ? 'Pernas de tipos diferentes — correlação moderada no mesmo jogo.'
        : 'Uma perna moderada (simples).',
  );
}

/** Agressivo: Fora zebra, Over 3.5, handicap, props caras */
function buildAgressivo(markets: EvPlusMarket[]): SuggestedTicket {
  const profile = PROFILES[2];
  const away = findBest(
    markets,
    (m) =>
      typeOf(m) === 'MATCH_RESULT' &&
      selectionOf(m) === 'fora' &&
      m.bookmakerOdd >= 2.5,
  );
  const over35 = findBest(
    markets,
    (m) =>
      typeOf(m) === 'OVER_UNDER' &&
      /over\s*3\.5/i.test(m.market),
  );
  const handicap = findBest(
    markets,
    (m) => typeOf(m) === 'HANDICAP' && m.bookmakerOdd >= 1.8,
  );
  const player = findBest(
    markets,
    (m) => typeOf(m) === 'PLAYER' && m.bookmakerOdd >= 2.2,
  );
  const highEv = [...markets]
    .filter((m) => isEligible(m) && m.ev >= 0.1 && m.bookmakerOdd >= 2)
    .sort(byEv)[0];

  const picks: EvPlusMarket[] = [];
  for (const c of [away, over35, handicap, player, highEv]) {
    if (!c) continue;
    if (picks.some((p) => p.market === c.market || typeOf(p) === typeOf(c))) continue;
    picks.push(c);
    if (picks.length >= 2) break;
  }

  return finish(
    profile,
    picks.map((m) => toLeg('agressivo', m)),
    picks.length > 1
      ? 'Perfil agressivo (bilhete-agressivo.md): variância alta · stake máx. 0,5%. Correlação no mesmo jogo concentrada.'
      : 'Uma perna agressiva — preferível como simples (doc recomenda WATCH na combinada se edge fino).',
    picks.length === 0
      ? 'Sem odd alta / zebra / Over 3.5 / props elegíveis neste jogo.'
      : undefined,
  );
}

/** Jogadores: top anytime scorers */
function buildJogadores(markets: EvPlusMarket[]): SuggestedTicket {
  const profile = PROFILES[3];
  const players = markets
    .filter((m) => typeOf(m) === 'PLAYER' && isEligible(m) && m.ev > 0)
    .sort(byEv)
    .slice(0, 2);

  return finish(
    profile,
    players.map((m) => toLeg('jogadores', m)),
    players.length > 1
      ? 'Dois marcadores no mesmo jogo = correlação alta com Over gols. Preferir 1 prop ou jogos diferentes (bilhete-jogadores.md).'
      : players.length === 1
        ? 'Uma prop de marcador (simples).'
        : 'Sem odds de marcador (PLAYER) analisadas neste jogo.',
    players.length === 0
      ? 'Nenhuma odd de jogador/anytime importada ou elegível (BET/WATCH) neste jogo.'
      : undefined,
  );
}

export function buildSuggestedTickets(
  markets: EvPlusMarket[],
): SuggestedTicket[] {
  return [
    buildConservador(markets),
    buildModerado(markets),
    buildAgressivo(markets),
    buildJogadores(markets),
  ];
}

export function stakeExampleReturn(combinedOdd: number, stake = 20): number {
  return Number((combinedOdd * stake).toFixed(2));
}

export { getMarketCategoryLabel };
