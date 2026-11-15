const percentFormatter = new Intl.NumberFormat(undefined, {
  style: 'percent',
  maximumFractionDigits: 0,
});
const daysFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });
const shortDateFormatter = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});

export const NO_DATA_LABEL = '—';

export function formatRate(rate: number | null): string {
  return rate === null ? NO_DATA_LABEL : percentFormatter.format(rate);
}

export function formatDays(days: number | null): string {
  return days === null ? NO_DATA_LABEL : `${daysFormatter.format(days)} d`;
}

export function formatWeekLabel(weekStart: string): string {
  return shortDateFormatter.format(new Date(weekStart));
}

export function formatShare(part: number, total: number): string {
  return total === 0 ? NO_DATA_LABEL : percentFormatter.format(part / total);
}
