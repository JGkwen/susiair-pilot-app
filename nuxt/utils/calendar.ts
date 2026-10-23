const DAY_MS = 86_400_000
const EPOCH_MONDAY_FIRST_WEEKDAY = 3

export function daysInMonth(year: number, month: number): number {
  return (Date.UTC(year, month, 1) - Date.UTC(year, month - 1, 1)) / DAY_MS
}

export function mondayFirstWeekday(year: number, month: number): number {
  return (Date.UTC(year, month - 1, 1) / DAY_MS + EPOCH_MONDAY_FIRST_WEEKDAY) % 7
}

export function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}
