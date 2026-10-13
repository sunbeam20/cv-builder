export const HABIT_COLORS = ['indigo', 'emerald', 'amber', 'rose', 'sky', 'violet'] as const
export type HabitColor = (typeof HABIT_COLORS)[number]

export const COLOR_STYLES: Record<HabitColor, { bg: string; text: string; ring: string }> = {
  indigo: { bg: 'bg-indigo-500', text: 'text-indigo-600', ring: 'ring-indigo-200' },
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600', ring: 'ring-emerald-200' },
  amber: { bg: 'bg-amber-500', text: 'text-amber-600', ring: 'ring-amber-200' },
  rose: { bg: 'bg-rose-500', text: 'text-rose-600', ring: 'ring-rose-200' },
  sky: { bg: 'bg-sky-500', text: 'text-sky-600', ring: 'ring-sky-200' },
  violet: { bg: 'bg-violet-500', text: 'text-violet-600', ring: 'ring-violet-200' },
}

export interface Habit {
  id: string
  name: string
  emoji: string
  color: HabitColor
  createdAt: string
  /** Times per week the habit should be completed. */
  targetPerWeek: number
  /** dateKey → completed. */
  done: Record<string, boolean>
  /** dateKey → frozen: protects a streak without counting as completed. */
  frozen: Record<string, boolean>
}

export const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const

export const dateKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const parseKey = (key: string): Date => {
  const [year = 1970, month = 1, day = 1] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export const addDays = (date: Date, days: number): Date => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export const startOfDay = (date: Date): Date => {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

/** Monday-based start of the week. */
export const startOfWeek = (date: Date): Date => {
  const start = startOfDay(date)
  const offset = (start.getDay() + 6) % 7
  start.setDate(start.getDate() - offset)
  return start
}

export const isSatisfied = (habit: Habit, key: string): boolean =>
  Boolean(habit.done[key]) || Boolean(habit.frozen[key])

/** Consecutive satisfied days ending today (or yesterday when today is still open). */
export function currentStreak(habit: Habit, today: Date = new Date()): number {
  let cursor = startOfDay(today)
  if (!isSatisfied(habit, dateKey(cursor))) cursor = addDays(cursor, -1)
  let streak = 0
  while (isSatisfied(habit, dateKey(cursor))) {
    streak += 1
    cursor = addDays(cursor, -1)
  }
  return streak
}

/** Longest satisfied run ever recorded for the habit. */
export function bestStreak(habit: Habit): number {
  const keys = [...new Set([...Object.keys(habit.done), ...Object.keys(habit.frozen)])]
    .filter((key) => isSatisfied(habit, key))
    .sort()
  let best = 0
  let run = 0
  let previous: string | null = null
  for (const key of keys) {
    const consecutive =
      previous !== null && parseKey(key).getTime() - parseKey(previous).getTime() === 86_400_000
    run = consecutive ? run + 1 : 1
    best = Math.max(best, run)
    previous = key
  }
  return best
}

export interface WeekDay {
  key: string
  label: string
  done: boolean
  frozen: boolean
  future: boolean
  today: boolean
}

export interface WeekStats {
  days: WeekDay[]
  completed: number
  target: number
  met: boolean
  percent: number
}

export function weeklyStats(habit: Habit, today: Date = new Date()): WeekStats {
  const start = startOfWeek(today)
  const todayKey = dateKey(startOfDay(today))
  const days: WeekDay[] = []
  let completed = 0
  for (let i = 0; i < 7; i += 1) {
    const date = addDays(start, i)
    const key = dateKey(date)
    const done = Boolean(habit.done[key])
    if (done) completed += 1
    days.push({
      key,
      label: WEEKDAY_LABELS[i],
      done,
      frozen: Boolean(habit.frozen[key]),
      future: key > todayKey,
      today: key === todayKey,
    })
  }
  const target = Math.max(1, habit.targetPerWeek)
  return {
    days,
    completed,
    target,
    met: completed >= target,
    percent: Math.min(100, Math.round((completed / target) * 100)),
  }
}

/** Last `count` days (oldest → newest) for the completion heatmap. */
export function recentDays(habit: Habit, count: number, today: Date = new Date()): WeekDay[] {
  const days: WeekDay[] = []
  const todayKey = dateKey(startOfDay(today))
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = addDays(today, -i)
    const key = dateKey(date)
    days.push({
      key,
      label: String(date.getDate()),
      done: Boolean(habit.done[key]),
      frozen: Boolean(habit.frozen[key]),
      future: false,
      today: key === todayKey,
    })
  }
  return days
}

export const createHabit = (input: {
  name: string
  emoji?: string
  color?: HabitColor
  targetPerWeek?: number
}): Habit => ({
  id: Math.random().toString(36).slice(2, 11),
  name: input.name.trim(),
  emoji: input.emoji?.trim() || '✅',
  color: input.color ?? 'indigo',
  targetPerWeek: input.targetPerWeek ?? 7,
  createdAt: new Date().toISOString(),
  done: {},
  frozen: {},
})
