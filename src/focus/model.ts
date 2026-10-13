export type Phase = 'work' | 'short' | 'long'

export interface FocusSettings {
  workMin: number
  shortBreakMin: number
  longBreakMin: number
  /** Work sessions before a long break. */
  cyclesBeforeLong: number
  autoStart: boolean
}

export const DEFAULT_SETTINGS: FocusSettings = {
  workMin: 25,
  shortBreakMin: 5,
  longBreakMin: 15,
  cyclesBeforeLong: 4,
  autoStart: false,
}

export interface FocusSession {
  id: string
  /** YYYY-MM-DD of completion. */
  date: string
  phase: Phase
  minutes: number
  completedAt: string
}

export const PHASE_LABELS: Record<Phase, string> = {
  work: 'Focus',
  short: 'Short break',
  long: 'Long break',
}

export const phaseSeconds = (phase: Phase, settings: FocusSettings): number =>
  (phase === 'work' ? settings.workMin : phase === 'short' ? settings.shortBreakMin : settings.longBreakMin) * 60

export const formatClock = (seconds: number): string => {
  const safe = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(safe / 60)
  const secs = safe % 60
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

/**
 * The phase that follows a completed one. `completedWork` counts work sessions
 * finished so far (including the one just finished).
 */
export function nextPhase(phase: Phase, completedWork: number, settings: FocusSettings): Phase {
  if (phase !== 'work') return 'work'
  return completedWork % settings.cyclesBeforeLong === 0 ? 'long' : 'short'
}

export const dateKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const createSession = (phase: Phase, minutes: number, now: Date = new Date()): FocusSession => ({
  id: Math.random().toString(36).slice(2, 11),
  date: dateKey(now),
  phase,
  minutes: Math.round(minutes),
  completedAt: now.toISOString(),
})

export interface FocusSummary {
  todayMinutes: number
  todaySessions: number
  totalSessions: number
  totalHours: number
  streak: number
}

export function summarise(sessions: FocusSession[], now: Date = new Date()): FocusSummary {
  const today = dateKey(now)
  const work = sessions.filter((session) => session.phase === 'work')
  const todayWork = work.filter((session) => session.date === today)
  const days = new Set(work.map((session) => session.date))
  let cursor = new Date(now)
  if (!days.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (days.has(dateKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  const totalMinutes = work.reduce((sum, session) => sum + session.minutes, 0)
  return {
    todayMinutes: todayWork.reduce((sum, session) => sum + session.minutes, 0),
    todaySessions: todayWork.length,
    totalSessions: work.length,
    totalHours: Number((totalMinutes / 60).toFixed(1)),
    streak,
  }
}
