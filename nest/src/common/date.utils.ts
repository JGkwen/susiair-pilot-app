const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

export function parseDate(date: string): number {
  return Date.parse(`${date}T00:00:00Z`);
}

export function formatDate(time: number): string {
  return new Date(time).toISOString().slice(0, 10);
}

export function isValidDate(value: unknown): boolean {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;
  const time = parseDate(value);
  return !Number.isNaN(time) && formatDate(time) === value;
}

export function addDays(date: string, days: number): string {
  return formatDate(parseDate(date) + days * DAY_MS);
}

export function diffDays(from: string, to: string): number {
  return (parseDate(to) - parseDate(from)) / DAY_MS;
}

export function datesBetween(from: string, to: string): string[] {
  return Array.from({ length: diffDays(from, to) + 1 }, (_, index) =>
    addDays(from, index),
  );
}
