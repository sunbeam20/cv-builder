const MS_PER_DAY = 86_400_000

export const startOfDay = (date: Date): Date => {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

export interface DateDiff {
  years: number
  months: number
  days: number
  totalDays: number
  totalWeeks: number
  weekendDays: number
}

function calendarDiff(from: Date, to: Date): { years: number; months: number; days: number } {
  let years = to.getFullYear() - from.getFullYear()
  let months = to.getMonth() - from.getMonth()
  let days = to.getDate() - from.getDate()
  if (days < 0) {
    months -= 1
    days += new Date(to.getFullYear(), to.getMonth(), 0).getDate()
  }
  if (months < 0) {
    years -= 1
    months += 12
  }
  return { years, months, days }
}

function countWeekends(from: Date, to: Date): number {
  let count = 0
  const cursor = startOfDay(from)
  const end = startOfDay(to)
  while (cursor <= end) {
    const day = cursor.getDay()
    if (day === 0 || day === 6) count += 1
    cursor.setDate(cursor.getDate() + 1)
  }
  return count
}

export function diffDates(from: Date, to: Date): DateDiff {
  const [early, late] = from <= to ? [from, to] : [to, from]
  const { years, months, days } = calendarDiff(startOfDay(early), startOfDay(late))
  const totalDays = Math.round((startOfDay(late).getTime() - startOfDay(early).getTime()) / MS_PER_DAY)
  return {
    years,
    months,
    days,
    totalDays,
    totalWeeks: Math.floor(totalDays / 7),
    weekendDays: countWeekends(early, late),
  }
}

export interface AgeResult {
  years: number
  months: number
  days: number
  totalDays: number
  nextBirthdayIn: number
}

export function calculateAge(birth: Date, today: Date = new Date()): AgeResult {
  const { years, months, days } = calendarDiff(startOfDay(birth), startOfDay(today))
  const totalDays = Math.round((startOfDay(today).getTime() - startOfDay(birth).getTime()) / MS_PER_DAY)
  let next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
  if (next < startOfDay(today)) next = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate())
  const nextBirthdayIn = Math.round((startOfDay(next).getTime() - startOfDay(today).getTime()) / MS_PER_DAY)
  return { years, months, days, totalDays, nextBirthdayIn }
}

export interface DateOffset {
  years?: number
  months?: number
  weeks?: number
  days?: number
}

export function addToDate(date: Date, offset: DateOffset): Date {
  const next = new Date(date)
  next.setFullYear(next.getFullYear() + (offset.years ?? 0))
  next.setMonth(next.getMonth() + (offset.months ?? 0))
  next.setDate(next.getDate() + (offset.weeks ?? 0) * 7 + (offset.days ?? 0))
  return next
}

export const FALLBACK_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Kolkata',
  'Asia/Tokyo',
  'Australia/Sydney',
]

export function listTimezones(): string[] {
  try {
    const supported = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf
    const values = supported?.('timeZone')
    if (values && values.length) return values
  } catch {
    /* fall through */
  }
  return FALLBACK_TIMEZONES
}

/** Format an instant in a given IANA time zone, e.g. "2026-03-10 14:30". */
export function formatInTimeZone(date: Date, timeZone: string): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const parts = formatter.formatToParts(date)
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}`
}

export const toDateInput = (date: Date): string => {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export const parseDateInput = (value: string): Date | null => {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}
