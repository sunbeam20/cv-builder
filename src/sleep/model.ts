export interface SleepEntry {
  id: string
  /** Wake-day key, YYYY-MM-DD. */
  date: string
  /** Bed time, HH:MM (24h). */
  bed: string
  /** Wake time, HH:MM (24h). */
  wake: string
  /** Subjective quality, 1–5. */
  quality: number
  note: string
  createdAt: string
}

export const QUALITY_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
}

const TIME_RE = /^([01]?\d|2[0-3]):([0-5]\d)$/

export const isValidTime = (value: string): boolean => TIME_RE.test(value.trim())

export const minutesFromTime = (value: string): number => {
  const [hours = 0, minutes = 0] = value.trim().split(':').map(Number)
  return hours * 60 + minutes
}

export const formatClock = (minutes: number): string => {
  const wrapped = ((minutes % 1440) + 1440) % 1440
  const hours = Math.floor(wrapped / 60)
  const mins = wrapped % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

/** Minutes asleep between a bed time and wake time, rolling over midnight. */
export function durationMinutes(bed: string, wake: string): number {
  const start = minutesFromTime(bed)
  const end = minutesFromTime(wake)
  const diff = end - start
  return diff > 0 ? diff : diff + 1440
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`
}

/** Bed time normalised onto a night scale (evening = before midnight). */
export const bedtimeMinutes = (bed: string): number => {
  const minutes = minutesFromTime(bed)
  return minutes < 720 ? minutes + 1440 : minutes
}

export const dateKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const addDays = (date: Date, days: number): Date => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export const sortByDateDesc = (entries: SleepEntry[]): SleepEntry[] =>
  [...entries].sort((a, b) => b.date.localeCompare(a.date))

export interface SleepSummary {
  averageMinutes: number
  averageQuality: number
  averageBedtime: number
  averageWake: number
  count: number
  longest: number
  shortest: number
}

export function summarise(entries: SleepEntry[]): SleepSummary | null {
  if (entries.length === 0) return null
  const durations = entries.map((entry) => durationMinutes(entry.bed, entry.wake))
  const total = durations.reduce((sum, value) => sum + value, 0)
  const quality = entries.reduce((sum, entry) => sum + entry.quality, 0)
  const bedtimes = entries.map((entry) => bedtimeMinutes(entry.bed))
  const wakes = entries.map((entry) => minutesFromTime(entry.wake))
  const avg = (values: number[]) => Math.round(values.reduce((s, v) => s + v, 0) / values.length)
  return {
    averageMinutes: Math.round(total / entries.length),
    averageQuality: Number((quality / entries.length).toFixed(1)),
    averageBedtime: avg(bedtimes),
    averageWake: avg(wakes),
    count: entries.length,
    longest: Math.max(...durations),
    shortest: Math.min(...durations),
  }
}

export const createEntry = (input: {
  date: string
  bed: string
  wake: string
  quality: number
  note?: string
}): SleepEntry => ({
  id: Math.random().toString(36).slice(2, 11),
  date: input.date,
  bed: input.bed.trim(),
  wake: input.wake.trim(),
  quality: Math.min(5, Math.max(1, Math.round(input.quality))),
  note: input.note?.trim() ?? '',
  createdAt: new Date().toISOString(),
})
