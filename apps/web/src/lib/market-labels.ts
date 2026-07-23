/** Labels de mercados alinhados a docs/betting/markets + analysis playbooks */

const CATEGORY_LABELS: Record<string, string> = {
  MATCH_RESULT: 'Resultado Final (1X2)',
  OVER_UNDER: 'Total de Gols',
  BTTS: 'Ambas Marcam (BTTS)',
  CORNERS: 'Escanteios',
  CARDS: 'Cartões',
  HANDICAP: 'Handicap Asiático (gols)',
  PLAYER: 'Jogador a Marcar',
  SHOTS: 'Total de Chutes',
  SHOTS_ON_TARGET: 'Total de Chutes ao Gol',
  GOALKEEPER_SAVES: 'Defesas do Goleiro',
  PLAYER_SHOTS: 'Jogador - Chutes',
  PLAYER_SHOTS_ON_TARGET: 'Jogador - Chutes ao Gol',
  PLAYER_CARDS: 'Jogador - Cartão',
  PLAYER_FOULS: 'Jogador - Faltas',
  PLAYER_TACKLES: 'Jogador - Desarmes',
  PLAYER_ASSIST_OR_GOAL: 'Jogador a Marcar ou Assistir',
  DOUBLE_CHANCE: 'Chance Dupla',
  HT_RESULT: 'Resultado 1º Tempo',
  HT_OVER_UNDER: 'Gols 1º Tempo O/U',
  HT_FT: 'Intervalo/Final',
  EXACT_SCORE: 'Placar',
  WINNING_MARGIN: 'Margem de Vitória',
  RED_CARD: 'Cartão Vermelho',
  BOTH_TEAMS_CARDS: 'Ambos Recebem Cartão',
  FIRST_SCORER: 'Primeiro Marcador',
  GOAL_BANDS: 'Faixa de Gols',
  ANY_PLAYER_SCORE: 'Qualquer Jogador a Marcar',
  ANY_PLAYER_CARD: 'Qualquer Jogador Receber Cartão',
  HIGHEST_SCORING_HALF: 'Tempo Com Mais Gols',
  TEAM_MOST: 'Time - Maior Número',
  TEAM_TO_SCORE: 'Time - Marcador de Gols',
  TEAM_SPECIAL: 'Time - Especiais',
};

const SELECTION_LABELS: Record<string, string> = {
  Casa: 'Casa vence',
  Empate: 'Empate',
  Fora: 'Fora vence',
  'BTTS Sim': 'Ambas marcam — Sim',
  'BTTS Não': 'Ambas marcam — Não',
  'Casa ou Empate': 'Casa ou Empate (1X)',
  'Empate ou Fora': 'Empate ou Fora (X2)',
  'Casa ou Fora': 'Casa ou Fora (12)',
  Yes: 'Sim',
  No: 'Não',
  Sim: 'Sim',
  Não: 'Não',
};

/** Traduz seleções ainda em inglês (ex.: Clean Sheet / Win to Nil). */
export function translateSelectionText(selection: string): string {
  let s = selection.trim();
  if (!s) return s;

  const phrases: Array<[RegExp, string]> = [
    [/to score in both halves/gi, 'Marcar nos dois tempos'],
    [/win both halves/gi, 'Vencer ambos os tempos'],
    [/win\s*to\s*nil/gi, 'Vencer sem sofrer'],
    [/clean\s*sheet/gi, 'Sem sofrer gols'],
    [/both teams to score/gi, 'Ambas marcam'],
    [/highest scoring half/gi, 'Tempo com mais gols'],
    [/exact score/gi, 'Placar exato'],
    [/double chance/gi, 'Chance dupla'],
  ];
  for (const [re, pt] of phrases) {
    s = s.replace(re, pt);
  }

  s = s
    .replace(/\bHome\b/g, 'Casa')
    .replace(/\bAway\b/g, 'Fora')
    .replace(/\bDraw\b/gi, 'Empate')
    .replace(/\bYes\b/gi, 'Sim')
    .replace(/\bNo\b/gi, 'Não');

  return s;
}

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

  const translated = translateSelectionText(selection);
  const mappedTranslated = SELECTION_LABELS[translated];
  if (mappedTranslated) return mappedTranslated;

  const overUnder = translated.match(/^(Over|Under)\s+([\d.]+)$/i);
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

  const handicap = translated.match(/^(Casa|Fora|Home|Away)\s*([+-][\d.]+)$/i);
  if (handicap) {
    const side = /casa|home/i.test(handicap[1]) ? 'Casa' : 'Fora';
    return `${side} ${handicap[2]} (AH)`;
  }

  if (category === 'PLAYER' || category === 'FIRST_SCORER' || category === 'PLAYER_SHOTS') {
    return translated;
  }

  return translated;
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
  if (category === 'PLAYER_ASSIST_OR_GOAL') {
    return `Marcar ou assistir · ${selectionLabel}`;
  }
  if (category === 'PLAYER_CARDS') {
    return `Jogador cartão · ${selectionLabel}`;
  }
  if (category === 'FIRST_SCORER') {
    return `Primeiro marcador · ${selectionLabel}`;
  }
  if (category === 'PLAYER_SHOTS' || category === 'PLAYER_SHOTS_ON_TARGET') {
    return `${CATEGORY_LABELS[category]} · ${selectionLabel}`;
  }
  if (category === 'PLAYER_FOULS' || category === 'PLAYER_TACKLES') {
    return `${CATEGORY_LABELS[category]} · ${selectionLabel}`;
  }
  if (category === 'HT_FT') {
    return `Intervalo/Final · ${selectionLabel}`;
  }
  if (category === 'EXACT_SCORE') {
    return `Placar · ${selectionLabel}`;
  }
  if (category === 'WINNING_MARGIN') {
    return `Margem · ${selectionLabel}`;
  }
  if (category === 'DOUBLE_CHANCE') {
    return `Chance Dupla · ${selectionLabel}`;
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

const CATEGORY_SUMMARIES: Record<string, string> = {
  MATCH_RESULT:
    'Mercado de desfecho do jogo em 90 minutos (+ acréscimos): vitória da casa, empate ou vitória do visitante (1X2).',
  OVER_UNDER:
    'Total de gols da partida (soma dos dois times). Over precisa de gols acima da linha; Under precisa ficar em ou abaixo.',
  BTTS:
    'Ambas as equipes marcam pelo menos 1 gol no tempo regulamentar (Both Teams To Score).',
  CORNERS:
    'Total de escanteios cobrados no jogo. Over/Under na linha indicada (ex.: Over 8.5 = 9+ escanteios).',
  CARDS:
    'Total de cartões (amarelos/vermelhos conforme liquidação da casa). Over/Under na linha.',
  HANDICAP:
    'Handicap asiático de gols: o placar é ajustado pela linha antes de liquidar a aposta.',
  PLAYER:
    'Anytime marcador: o jogador precisa marcar pelo menos 1 gol em qualquer momento do jogo (não precisa ser o primeiro).',
  SHOTS: 'Total de finalizações (chutes) na partida — Over/Under na linha.',
  SHOTS_ON_TARGET:
    'Chutes no gol (SOT): finalizações que exigem defesa ou resultam em gol.',
  GOALKEEPER_SAVES:
    'Defesas do goleiro: número de saves contabilizados pela casa na linha escolhida.',
  PLAYER_SHOTS:
    'Prop de chutes do jogador (total ou no gol) conforme a linha da seleção.',
  DOUBLE_CHANCE:
    'Chance dupla (1X, X2 ou 12): cobre dois dos três resultados do 1X2.',
  HT_RESULT: 'Resultado apenas do 1º tempo.',
  HT_OVER_UNDER: 'Total de gols só no 1º tempo (Over/Under).',
  HT_FT: 'Resultado intervalo/final (HT/FT) — 9 combinações.',
  EXACT_SCORE: 'Placar exato da partida no tempo regulamentar.',
  WINNING_MARGIN: 'Margem de vitória (ex.: Casa por 1, Fora por 2+).',
  RED_CARD: 'Mercado de cartão vermelho na partida ou no tempo.',
  BOTH_TEAMS_CARDS: 'Ambos os times recebem pelo menos um cartão.',
  FIRST_SCORER: 'Primeiro marcador do jogo — só o autor do 1º gol ganha.',
};

function liquidatesWhen(category: string, selection: string): string {
  const sel = selection.trim();
  const ou = sel.match(/^(Over|Under)\s+([\d.]+)$/i);

  switch (category) {
    case 'MATCH_RESULT':
      if (/casa|home/i.test(sel)) return 'GREEN se o time da casa vencer em 90′.';
      if (/fora|away/i.test(sel)) return 'GREEN se o visitante vencer em 90′.';
      if (/empate|draw/i.test(sel)) return 'GREEN se o jogo empatar em 90′.';
      return 'GREEN conforme o resultado final 1X2.';
    case 'OVER_UNDER':
      if (ou) {
        const side = ou[1].toLowerCase() === 'over' ? 'Over' : 'Under';
        const line = Number(ou[2]);
        if (side === 'Over') {
          return `GREEN se o jogo tiver ${Math.ceil(line + 0.1)}+ gols (acima de ${line}).`;
        }
        return `GREEN se o jogo tiver no máximo ${Math.floor(line)} gols (Under ${line}).`;
      }
      return 'GREEN conforme Over/Under de gols na linha.';
    case 'BTTS':
      if (/sim|yes/i.test(sel)) return 'GREEN se casa e visitante marcarem ≥1 gol cada.';
      return 'GREEN se pelo menos um dos times não marcar.';
    case 'CORNERS':
      if (ou) {
        const side = ou[1].toLowerCase() === 'over' ? 'Over' : 'Under';
        return `GREEN se o total de escanteios for ${side.toLowerCase()} ${ou[2]}.`;
      }
      return 'GREEN conforme Over/Under de escanteios.';
    case 'CARDS':
      if (ou) {
        return `GREEN se o total de cartões for ${ou[1]} ${ou[2]}.`;
      }
      return 'GREEN conforme Over/Under de cartões.';
    case 'PLAYER':
      return `GREEN se ${sel} marcar ≥1 gol em qualquer momento (anytime). VOID se não jogar (regra da casa).`;
    case 'HANDICAP':
      return `GREEN se, após aplicar o handicap "${sel}", a seleção cobrir a linha asiática.`;
    case 'SHOTS_ON_TARGET':
      return 'GREEN conforme Over/Under de chutes no gol na linha.';
    case 'GOALKEEPER_SAVES':
      return 'GREEN conforme Over/Under de defesas do goleiro na linha.';
    default:
      return 'Liquidação conforme regras da casa para este mercado.';
  }
}

/** Detalhe completo do mercado para UI de bilhete */
export function describeMarket(
  marketType: string | null | undefined,
  selection: string,
): {
  categoryKey: string;
  category: string;
  selectionLabel: string;
  fullLabel: string;
  summary: string;
  liquidatesWhen: string;
} {
  const categoryKey = detectCategoryFromSelection(marketType, selection);
  const category = CATEGORY_LABELS[categoryKey] ?? 'Mercado';
  const selectionLabel = formatSelectionLabel(categoryKey, selection);
  return {
    categoryKey,
    category,
    selectionLabel,
    fullLabel: formatMarketLabel(marketType, selection),
    summary: CATEGORY_SUMMARIES[categoryKey] ?? 'Mercado de apostas esportivas.',
    liquidatesWhen: liquidatesWhen(categoryKey, selection),
  };
}

export { CATEGORY_LABELS, formatSelectionLabel };
