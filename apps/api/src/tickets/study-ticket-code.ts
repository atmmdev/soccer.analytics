/**
 * Código no padrão Histórico Bet365 (estudo): DDMMYYYY-HHmmsshs
 * Ex.: 02042026-085508hs
 */
export function formatStudyTicketCode(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const dd = pad(date.getDate());
  const mm = pad(date.getMonth() + 1);
  const yyyy = String(date.getFullYear());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${dd}${mm}${yyyy}-${hh}${mi}${ss}hs`;
}

const MONTHS_PT = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
] as const;

export function studyTicketMonthFolder(date: Date = new Date()): string {
  return MONTHS_PT[date.getMonth()] ?? 'janeiro';
}

export function betTypeFromLegs(count: number): string {
  if (count <= 1) return 'Simples';
  if (count === 2) return 'Duplas';
  if (count === 3) return 'Triplas';
  return `${count} Múltiplas`;
}
