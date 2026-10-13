export interface Medicine {
  id: string
  name: string
  dosage: string
  /** Daily dose times as HH:MM, sorted. */
  times: string[]
  /** Doses remaining before a refill is needed. */
  remaining: number
  createdAt: string
}

export const REFILL_THRESHOLD = 5

export const dateKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const TIME_RE = /^([01]?\d|2[0-3]):([0-5]\d)$/

export const normalizeTime = (value: string): string | null => {
  const trimmed = value.trim()
  if (!TIME_RE.test(trimmed)) return null
  const [hours = '0', minutes = '00'] = trimmed.split(':')
  return `${hours.padStart(2, '0')}:${minutes}`
}

export const parseTimes = (value: string): string[] =>
  [...new Set(value.split(/[,\s]+/).map(normalizeTime).filter((time): time is string => time !== null))].sort()

export const doseKey = (medicineId: string, date: string, time: string): string =>
  `${medicineId}|${date}|${time}`

export interface ScheduledDose {
  time: string
  key: string
  taken: boolean
  overdue: boolean
  future: boolean
}

/** Today's schedule for a medicine, with taken/overdue flags. */
export function scheduledDoses(
  medicine: Medicine,
  taken: Record<string, boolean>,
  now: Date = new Date(),
): ScheduledDose[] {
  const date = dateKey(now)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  return medicine.times.map((time) => {
    const [hours = 0, minutes = 0] = time.split(':').map(Number)
    const at = hours * 60 + minutes
    const key = doseKey(medicine.id, date, time)
    return {
      time,
      key,
      taken: Boolean(taken[key]),
      overdue: !taken[key] && at < nowMinutes,
      future: at > nowMinutes,
    }
  })
}

export const needsRefill = (medicine: Medicine): boolean => medicine.remaining <= REFILL_THRESHOLD

export const createMedicine = (input: {
  name: string
  dosage?: string
  times?: string[]
  remaining?: number
}): Medicine => ({
  id: Math.random().toString(36).slice(2, 11),
  name: input.name.trim(),
  dosage: input.dosage?.trim() ?? '',
  times: input.times && input.times.length > 0 ? [...input.times].sort() : ['09:00'],
  remaining: Math.max(0, Math.round(input.remaining ?? 30)),
  createdAt: new Date().toISOString(),
})

export interface DayProgress {
  total: number
  taken: number
  percent: number
}

export function dayProgress(
  medicines: Medicine[],
  taken: Record<string, boolean>,
  now: Date = new Date(),
): DayProgress {
  let total = 0
  let done = 0
  for (const medicine of medicines) {
    for (const dose of scheduledDoses(medicine, taken, now)) {
      total += 1
      if (dose.taken) done += 1
    }
  }
  return { total, taken: done, percent: total ? Math.round((done / total) * 100) : 0 }
}
