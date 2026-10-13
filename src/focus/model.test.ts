import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SETTINGS,
  createSession,
  formatClock,
  nextPhase,
  phaseSeconds,
  summarise,
  type FocusSession,
} from './model'

const work = (date: string, minutes: number): FocusSession => ({
  ...createSession('work', minutes, new Date(2026, 2, 10, 12)),
  date,
})

const day = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12)

describe('phaseSeconds / formatClock', () => {
  it('uses the configured durations', () => {
    expect(phaseSeconds('work', DEFAULT_SETTINGS)).toBe(1500)
    expect(phaseSeconds('short', { ...DEFAULT_SETTINGS, shortBreakMin: 7 })).toBe(420)
  })

  it('formats seconds as mm:ss', () => {
    expect(formatClock(1500)).toBe('25:00')
    expect(formatClock(5)).toBe('00:05')
    expect(formatClock(-1)).toBe('00:00')
  })
})

describe('nextPhase', () => {
  it('returns a short break after a focus block', () => {
    expect(nextPhase('work', 1, DEFAULT_SETTINGS)).toBe('short')
  })

  it('returns a long break every Nth focus block', () => {
    expect(nextPhase('work', 4, DEFAULT_SETTINGS)).toBe('long')
  })

  it('always returns focus after a break', () => {
    expect(nextPhase('short', 2, DEFAULT_SETTINGS)).toBe('work')
    expect(nextPhase('long', 4, DEFAULT_SETTINGS)).toBe('work')
  })
})

describe('summarise', () => {
  it('totals focus today and overall', () => {
    const summary = summarise([work('2026-03-10', 25), work('2026-03-10', 25), work('2026-03-09', 50)], day(2026, 3, 10))
    expect(summary.todayMinutes).toBe(50)
    expect(summary.todaySessions).toBe(2)
    expect(summary.totalSessions).toBe(3)
    expect(summary.totalHours).toBe(1.7)
    expect(summary.streak).toBe(2)
  })
})
