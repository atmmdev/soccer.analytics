/**
 * Configuração do sync híbrido + allowlist de ligas (API-Football IDs).
 *
 * Defaults:
 * - Fixtures/odds: hoje → +7
 * - Stats/players: finalizados nos últimos 3 dias
 * - Ligas: top europeias + Brasileirão
 *
 * Override: SYNC_LEAGUE_IDS=39,140,135,78,61,71
 */
export const SYNC_AGENDA_LOOKAHEAD_DAYS = 7;
export const SYNC_STATS_LOOKBACK_DAYS = 3;

/** Premier 39, La Liga 140, Serie A 135, Bundesliga 78, Ligue 1 61, Brasileirão 71 */
export const DEFAULT_SYNC_LEAGUE_IDS = [
  '39',
  '140',
  '135',
  '78',
  '61',
  '71',
] as const;

export const SYNC_LEAGUE_LABELS: Record<string, string> = {
  '39': 'Premier League',
  '140': 'La Liga',
  '135': 'Serie A',
  '78': 'Bundesliga',
  '61': 'Ligue 1',
  '71': 'Brasileirão Série A',
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
