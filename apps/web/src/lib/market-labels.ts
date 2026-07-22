/** Labels de mercados alinhados a docs/betting/markets + analysis playbooks */

const CATEGORY_LABELS: Record<string, string> = {
  MATCH_RESULT: 'Resultado Final (1X2)',
  OVER_UNDER: 'Gols Over/Under',
  BTTS: 'Ambas Marcam (BTTS)',
  CORNERS: 'Escanteios',
  CARDS: 'Cartões',
  HANDICAP: 'Handicap Asiático (gols)',
  PLAYER: 'Marcador / Jogador',
  SHOTS: 'Chutes / Finalizações',
  SHOTS_ON_TARGET: 'Chutes no Gol (SOT)',
  GOALKEEPER_SAVES: 'Defesas do Goleiro',
  PLAYER_SHOTS: 'Chutes do Jogador',
  DOUBLE_CHANCE: 'Chance Dupla',
  HT_RESULT: 'Resultado 1º Tempo',
  HT_OVER_UNDER: 'Gols 1º Tempo O/U',
  HT_FT: 'Intervalo/Final',
  FIRST_SCORER: 'Primeiro Marcador',
};

const SELECTION_LABELS: Record<string, string> = {
  Casa: 'Casa vence',
  Empate: 'Empate',
  Fora: 'Fora vence',
  'BTTS Sim': 'Ambas marcam — Sim',
  'BTTS Não': 'Ambas marcam — Não',
  Yes: 'Sim',
  No: 'Não',
};

function detectCategoryFromSelection(
  marketType: string | null | undefined,
  selection: string,
): string {
  const type = (marketType ?? '').toUpperCase();
  if (type && CATEGORY_LABELS[type]) return type;

  const s = selection.toLowerCase();
  if (s.includes('escanteio') || s.includes('corner')) return 'CORNERS';
  if (s.includes('cartão') || s.includes('cartao') || s.includes('card')) return 'CARDS';
  if (s.includes('chute no gol') || s.includes('sot') || s.includes('shots on')) {
    return 'SHOTS_ON_TARGET';
  }
  if (s.includes('defesa') || s.includes('save')) return 'GOALKEEPER_SAVES';
  if (s.includes('chute') || s.includes('shot')) return 'SHOTS';
  if (s.startsWith('over') || s.startsWith('under')) return 'OVER_UNDER';
  if (s.includes('btts') || s.includes('ambas')) return 'BTTS';
  if (s === 'casa' || s === 'fora' || s === 'empate') return 'MATCH_RESULT';
  return type || 'PLAYER';
}

function formatSelectionLabel(
  category: string,
  selection: string,
): string {
  const mapped = SELECTION_LABELS[selection];
  if (mapped) return mapped;

  const overUnder = selection.match(/^(Over|Under)\s+([\d.]+)$/i);
  if (overUnder) {
    const side = overUnder[1].toLowerCase() === 'over' ? 'Over' : 'Under';
    const line = overUnder[2];
    if (category === 'CORNERS') return `${side} ${line} escanteios`;
    if (category === 'CARDS') return `${side} ${line} cartões`;
    if (category === 'SHOTS_ON_TARGET') return `${side} ${line} chutes no gol`;
    if (category === 'SHOTS') return `${side} ${line} finalizações`;
    if (category === 'GOALKEEPER_SAVES') return `${side} ${line} defesas`;
    if (category === 'HT_OVER_UNDER') return `${side} ${line} gols (1º tempo)`;
    return `${side} ${line} gols`;
  }

  const handicap = selection.match(/^(Casa|Fora|Home|Away)\s*([+-][\d.]+)$/i);
  if (handicap) {
    const side = /casa|home/i.test(handicap[1]) ? 'Casa' : 'Fora';
    return `${side} ${handicap[2]} (AH)`;
  }

  if (category === 'PLAYER' || category === 'FIRST_SCORER' || category === 'PLAYER_SHOTS') {
    return selection;
  }

  return selection;
}

/** Ex.: "Escanteios · Over 8.5 escanteios" */
export function formatMarketLabel(
  marketType: string | null | undefined,
  selection: string,
): string {
  const category = detectCategoryFromSelection(marketType, selection);
  const categoryLabel = CATEGORY_LABELS[category] ?? 'Mercado';
  const selectionLabel = formatSelectionLabel(category, selection);

  if (category === 'PLAYER') {
    return `Anytime marcador · ${selectionLabel}`;
  }
  if (category === 'FIRST_SCORER') {
    return `Primeiro marcador · ${selectionLabel}`;
  }
  if (category === 'PLAYER_SHOTS') {
    return `Chutes do jogador · ${selectionLabel}`;
  }

  return `${categoryLabel} · ${selectionLabel}`;
}

export function getMarketCategoryLabel(
  marketType: string | null | undefined,
  selection: string,
): string {
  const category = detectCategoryFromSelection(marketType, selection);
  return CATEGORY_LABELS[category] ?? 'Mercado';
}

export { CATEGORY_LABELS };
