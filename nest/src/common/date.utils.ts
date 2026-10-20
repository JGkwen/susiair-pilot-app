const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

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
