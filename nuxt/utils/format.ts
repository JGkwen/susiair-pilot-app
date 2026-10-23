const hoursFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

const monthFormatter = new Intl.DateTimeFormat('en-GB', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

export function formatHours(hours: number): string {
  return hoursFormatter.format(hours)
}

export function formatDate(date: string): string {
  return dateFormatter.format(Date.parse(`${date}T00:00:00Z`))
}

export function formatMonth(year: number, month: number): string {
  return monthFormatter.format(Date.UTC(year, month - 1, 1))
}
