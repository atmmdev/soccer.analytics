/**
 * Sugestões de bilhete por perfil — alinhado a docs/betting/examples/
 * e regras de docs/betting/ai/correlacoes.md
 */

import type { EvPlusMarket } from '@/types/analysis';
import {
  describeMarket,
  formatMarketLabel,
  getMarketCategoryLabel,
} from '@/lib/market-labels';

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
  category: string;
  selectionLabel: string;
  summary: string;
  liquidatesWhen: string;
  fairOddLabel: string;
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
    (m.recommendation === 'WATCH' && m.ev > 0.03)
  );
}

function byEv(a: EvPlusMarket, b: EvPlusMarket) {
  return b.ev - a.ev;
}

function byLowOddThenEv(a: EvPlusMarket, b: EvPlusMarket) {
  if (a.bookmakerOdd !== b.bookmakerOdd) return a.bookmakerOdd - b.bookmakerOdd;
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
  const action =
    m.recommendation === 'BET'
      ? 'O motor recomenda Apostar'
      : m.recommendation === 'WATCH'
        ? 'O motor recomenda Observar (edge presente, confiança moderada)'
        : 'Seleção disponível, mas o motor sugere Ignorar';

  switch (profile) {
    case 'conservador':
      return `${action}. Encaixa no perfil conservador por odd relativamente baixa (${m.bookmakerOdd.toFixed(2)}) e barreira mais fácil de acertar — padrão de bilhete-conservador.md (Over 1.5 / Under alto / favorito).`;
    case 'moderado':
      return `${action}. Encaixa no perfil moderado (Over 2.5 / BTTS / 1X2) de bilhete-moderado.md, com EV ${(m.ev * 100).toFixed(1)}% e confiança ${m.confidence}%.`;
    case 'agressivo':
      return `${action}. Perfil agressivo: odd/linha mais arriscada para maior retorno — ver bilhete-agressivo.md. Stake máximo sugerido 0,5%.`;
    case 'jogadores':
      return `${action}. Prop anytime do jogador${m.playerModel ? ' com modelo Poisson de gols' : ' (probabilidade implícita da odd, sem modelo completo)'}. Ver bilhete-jogadores.md.`;
    default:
      return action;
  }
}

function toLeg(profile: TicketProfileId, m: EvPlusMarket): SuggestedLeg {
  const desc = describeMarket(m.marketType, m.market);
  return {
    ...m,
    why: whyFor(profile, m),
    category: desc.category,
    selectionLabel: desc.selectionLabel,
    summary: desc.summary,
    liquidatesWhen: desc.liquidatesWhen,
    fairOddLabel: m.fairOdd.toFixed(2),
  };
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
  const avgEv = legs.reduce((acc, l) => acc + l.ev, 0) / legs.length;
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

function pushUnique(
  picks: EvPlusMarket[],
  candidate: EvPlusMarket | null,
  max = 2,
): void {
  if (!candidate || picks.length >= max) return;
  if (picks.some((p) => p.market === candidate.market)) return;
  // Evitar Over + Under no mesmo bilhete
  if (
    typeOf(candidate) === 'OVER_UNDER' &&
    picks.some(
      (p) =>
        typeOf(p) === 'OVER_UNDER' &&
        /over/i.test(p.market) !== /over/i.test(candidate.market),
    )
  ) {
    return;
  }
  picks.push(candidate);
}

/** Conservador: odd baixa — Over 1.5, Under 2.5/3.5, favorito, BTTS Não */
function buildConservador(markets: EvPlusMarket[]): SuggestedTicket {
  const profile = PROFILES[0];
  const picks: EvPlusMarket[] = [];

  pushUnique(
    picks,
    findBest(
      markets,
      (m) => typeOf(m) === 'OVER_UNDER' && /over\s*1\.5/i.test(m.market),
    ),
  );
  pushUnique(
    picks,
    findBest(
      markets,
      (m) =>
        typeOf(m) === 'OVER_UNDER' &&
        /under\s*(2\.5|3\.5)/i.test(m.market) &&
        m.bookmakerOdd <= 2.1,
    ),
  );
  pushUnique(
    picks,
    findBest(
      markets,
      (m) =>
        typeOf(m) === 'MATCH_RESULT' &&
        (selectionOf(m) === 'casa' || selectionOf(m) === 'fora') &&
        m.probability >= 0.45 &&
        m.bookmakerOdd <= 2.0,
    ),
  );
  pushUnique(
    picks,
    findBest(
      markets,
      (m) =>
        typeOf(m) === 'BTTS' &&
        /não|nao|no/i.test(m.market) &&
        m.bookmakerOdd <= 2.0,
    ),
  );

  // Fallback amplo: menores odds com EV>0 / BET / WATCH
  if (picks.length === 0) {
    const safest = [...markets]
      .filter((m) => isEligible(m) && m.ev > 0 && m.bookmakerOdd <= 2.2)
      .sort(byLowOddThenEv)
      .slice(0, 2);
    for (const s of safest) pushUnique(picks, s);
  }

  // Último recurso: qualquer BET com menor odd
  if (picks.length === 0) {
    const any = [...markets]
      .filter((m) => m.recommendation === 'BET' && m.ev > 0)
      .sort(byLowOddThenEv)[0];
    pushUnique(picks, any ?? null);
  }

  return finish(
    profile,
    picks.map((m) => toLeg('conservador', m)),
    picks.length > 1
      ? 'Mesmo jogo: correlação possível — stake 1–2%. Doc: bilhete-conservador.md.'
      : 'Uma perna conservadora (simples) — menor risco.',
    picks.length === 0
      ? 'Sem mercados de odd baixa com EV positivo neste jogo. Tente outra partida ou aguarde novas odds.'
      : undefined,
  );
}

/** Moderado: Over 2.5, BTTS Sim, 1X2 */
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
      m.bookmakerOdd >= 1.45 &&
      m.bookmakerOdd <= 2.6,
  );
  const corners = findBest(
    markets,
    (m) => typeOf(m) === 'CORNERS' && /over/i.test(m.market),
  );

  const picks: EvPlusMarket[] = [];
  const primary = [over25, bttsYes].filter(Boolean).sort((a, b) => byEv(a!, b!))[0];
  pushUnique(picks, primary ?? null);
  pushUnique(picks, result);
  pushUnique(picks, corners);

  if (picks.length === 0) {
    const mid = [...markets]
      .filter((m) => isEligible(m) && m.ev > 0.03)
      .sort(byEv)
      .slice(0, 2);
    for (const m of mid) pushUnique(picks, m);
  }

  const hasOverAndBtts =
    picks.some((p) => typeOf(p) === 'OVER_UNDER' && /over/i.test(p.market)) &&
    picks.some((p) => typeOf(p) === 'BTTS');

  return finish(
    profile,
    picks.map((m) => toLeg('moderado', m)),
    hasOverAndBtts
      ? 'Aviso (correlacoes.md): Over gols + BTTS no mesmo jogo = correlação +.'
      : picks.length > 1
        ? 'Pernas de tipos diferentes — correlação moderada no mesmo jogo.'
        : 'Uma perna moderada (simples).',
  );
}

/** Agressivo: Fora zebra, Over 3.5, handicap, props */
function buildAgressivo(markets: EvPlusMarket[]): SuggestedTicket {
  const profile = PROFILES[2];
  const picks: EvPlusMarket[] = [];

  pushUnique(
    picks,
    findBest(
      markets,
      (m) =>
        typeOf(m) === 'MATCH_RESULT' &&
        selectionOf(m) === 'fora' &&
        m.bookmakerOdd >= 2.2,
    ),
  );
  pushUnique(
    picks,
    findBest(
      markets,
      (m) => typeOf(m) === 'OVER_UNDER' && /over\s*3\.5/i.test(m.market),
    ),
  );
  pushUnique(
    picks,
    findBest(
      markets,
      (m) => typeOf(m) === 'HANDICAP' && m.bookmakerOdd >= 1.7,
    ),
  );
  pushUnique(
    picks,
    findBest(
      markets,
      (m) => typeOf(m) === 'PLAYER' && m.bookmakerOdd >= 2.0,
    ),
  );

  if (picks.length === 0) {
    const highEv = [...markets]
      .filter((m) => isEligible(m) && m.ev >= 0.08 && m.bookmakerOdd >= 1.9)
      .sort(byEv)
      .slice(0, 2);
    for (const m of highEv) pushUnique(picks, m);
  }

  return finish(
    profile,
    picks.map((m) => toLeg('agressivo', m)),
    picks.length > 1
      ? 'Perfil agressivo: variância alta · stake máx. 0,5% (bilhete-agressivo.md).'
      : 'Uma perna agressiva — preferível como simples se o edge for fino.',
    picks.length === 0
      ? 'Sem odd alta / zebra / Over 3.5 / props elegíveis neste jogo.'
      : undefined,
  );
}

/** Jogadores: anytime — inclui BET/WATCH e, se preciso, melhores PLAYER disponíveis */
function buildJogadores(markets: EvPlusMarket[]): SuggestedTicket {
  const profile = PROFILES[3];
  let players = markets
    .filter((m) => typeOf(m) === 'PLAYER' && isEligible(m))
    .sort(byEv)
    .slice(0, 2);

  // Fallback: qualquer PLAYER com EV > 0 mesmo SKIP
  if (players.length === 0) {
    players = markets
      .filter((m) => typeOf(m) === 'PLAYER' && m.ev > 0)
      .sort(byEv)
      .slice(0, 2);
  }

  // Fallback: top PLAYER por probabilidade
  if (players.length === 0) {
    players = markets
      .filter((m) => typeOf(m) === 'PLAYER')
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 2);
  }

  return finish(
    profile,
    players.map((m) => toLeg('jogadores', m)),
    players.length > 1
      ? 'Dois marcadores no mesmo jogo correlacionam com Over gols. Preferir 1 prop (bilhete-jogadores.md).'
      : players.length === 1
        ? 'Uma prop de marcador (simples).'
        : 'Sem odds de marcador neste jogo.',
    players.length === 0
      ? 'Nenhuma odd de jogador (anytime) foi importada para este jogo. A sync de odds precisa trazer o mercado de marcadores.'
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

export function pernaLabel(count: number): string {
  return count === 1 ? '1 perna' : `${count} pernas`;
}

export { getMarketCategoryLabel, formatMarketLabel };
