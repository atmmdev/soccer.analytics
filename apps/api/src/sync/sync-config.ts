/**
 * Configuração do sync híbrido + allowlist de ligas (API-Football IDs).
 *
 * Defaults:
 * - Fixtures/odds: hoje → +7
 * - Stats/players: finalizados nos últimos 3 dias
 * - Ligas: 1ª+2ª dos 8 países + copas EN + Champions + Libertadores
 *   + Brasil: Copa do Brasil, Copa do Nordeste, Supercopa e regionais (1ª)
 *
 * Override: SYNC_LEAGUE_IDS=39,40,...
 */
export const SYNC_AGENDA_LOOKAHEAD_DAYS = 7;
export const SYNC_STATS_LOOKBACK_DAYS = 3;

/**
 * Allowlist padrão:
 * BR 71/72 + Copa do Brasil/Nordeste/Supercopa + regionais A1
 * EN 39/40 + FA Cup 45 + EFL Cup 48
 * FR 61/62 · DE 78/79 · IT 135/136 · NL 88/89 · PT 94/95 · ES 140/141
 * + Champions 2 · Libertadores 13
 */
export const DEFAULT_SYNC_LEAGUE_IDS = [
  // Brasil — nacionais
  '71', // Serie A
  '72', // Serie B
  '73', // Copa Do Brasil
  '612', // Copa do Nordeste
  '632', // Supercopa do Brasil
  // Brasil — regionais (1ª divisão estadual)
  '475', // Paulista - A1
  '624', // Carioca - 1
  '629', // Mineiro - 1
  '477', // Gaúcho - 1
  '602', // Baiano - 1
  '606', // Paranaense - 1
  '604', // Catarinense - 1
  '628', // Goiano - 1
  '622', // Pernambucano - 1
  '609', // Cearense - 1
  '610', // Brasiliense
  '77', // Alagoano
  '626', // Sergipano
  '627', // Paraense
  '603', // Paraibano
  '616', // Potiguar
  '608', // Maranhense
  '621', // Piauiense
  '611', // Capixaba
  '520', // Acreano
  '522', // Amazonense
  '630', // Matogrossense
  '623', // Sul-Matogrossense
  '631', // Tocantinense
  '615', // Rondoniense
  '607', // Roraimense
  '521', // Amapaense
  // Inglaterra
  '39',
  '40',
  '45',
  '48',
  // França
  '61',
  '62',
  // Alemanha
  '78',
  '79',
  // Itália
  '135',
  '136',
  // Holanda
  '88',
  '89',
  // Portugal
  '94',
  '95',
  // Espanha
  '140',
  '141',
  // Continentais
  '2', // UEFA Champions League
  '13', // Copa Libertadores
] as const;

export const SYNC_LEAGUE_LABELS: Record<string, string> = {
  '71': 'Brasileirão Série A',
  '72': 'Brasileirão Série B',
  '73': 'Copa do Brasil',
  '612': 'Copa do Nordeste',
  '632': 'Supercopa do Brasil',
  '475': 'Paulista A1',
  '624': 'Carioca - 1',
  '629': 'Mineiro - 1',
  '477': 'Gaúcho - 1',
  '602': 'Baiano - 1',
  '606': 'Paranaense - 1',
  '604': 'Catarinense - 1',
  '628': 'Goiano - 1',
  '622': 'Pernambucano - 1',
  '609': 'Cearense - 1',
  '610': 'Brasiliense',
  '77': 'Alagoano',
  '626': 'Sergipano',
  '627': 'Paraense',
  '603': 'Paraibano',
  '616': 'Potiguar',
  '608': 'Maranhense',
  '621': 'Piauiense',
  '611': 'Capixaba',
  '520': 'Acreano',
  '522': 'Amazonense',
  '630': 'Matogrossense',
  '623': 'Sul-Matogrossense',
  '631': 'Tocantinense',
  '615': 'Rondoniense',
  '607': 'Roraimense',
  '521': 'Amapaense',
  '39': 'Premier League',
  '40': 'Championship',
  '45': 'FA Cup',
  '48': 'EFL Cup',
  '61': 'Ligue 1',
  '62': 'Ligue 2',
  '78': 'Bundesliga',
  '79': '2. Bundesliga',
  '135': 'Serie A',
  '136': 'Serie B',
  '88': 'Eredivisie',
  '89': 'Eerste Divisie',
  '94': 'Primeira Liga',
  '95': 'Liga Portugal 2',
  '140': 'La Liga',
  '141': 'La Liga 2',
  '2': 'UEFA Champions League',
  '13': 'Copa Libertadores',
};

export function readSyncLeagueIds(
  raw: string | undefined | null,
): string[] {
  if (raw == null || !String(raw).trim()) {
    return [...DEFAULT_SYNC_LEAGUE_IDS];
  }
  const ids = String(raw)
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return ids.length ? ids : [...DEFAULT_SYNC_LEAGUE_IDS];
}

/** Prisma filter: matches whose competition.externalId is in the allowlist. */
export function matchAllowlistFilter(leagueIds: string[]) {
  return {
    competition: { externalId: { in: leagueIds } },
  };
}

export function buildDateWindow(
  fromOffset: number,
  toOffset: number,
  base = new Date(),
): string[] {
  const dates: string[] = [];
  for (let offset = fromOffset; offset <= toOffset; offset++) {
    dates.push(formatIsoDate(addDays(base, offset)));
  }
  return dates;
}

export function formatIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}
