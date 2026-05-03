export function formatNumber(n: number): string {
  return n.toLocaleString('en-NZ');
}

export function formatPercent(n: number, decimals = 1): string {
  return `${n.toFixed(decimals)}%`;
}

export function formatChange(current: number, previous: number): string {
  if (previous === 0) return 'N/A';
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}

export function yearMonthToDate(year: number, month: number): Date {
  return new Date(year, month - 1, 1);
}
