import { describe, expect, it } from 'vitest'
import {
  addDays,
  bestStreak,
  createHabit,
  currentStreak,
  dateKey,
  recentDays,
  startOfWeek,
  weeklyStats,
  type Habit,
} from './model'

const habit = (done: string[] = [], frozen: string[] = [], targetPerWeek = 7): Habit => ({
  ...createHabit({ name: 'Test', targetPerWeek }),
  done: Object.fromEntries(done.map((key) => [key, true])),
  frozen: Object.fromEntries(frozen.map((key) => [key, true])),
})

const day = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12)

describe('date helpers', () => {
  it('formats a date key', () => {
    expect(dateKey(day(2026, 3, 5))).toBe('2026-03-05')
  })

  it('shifts days across month boundaries', () => {
    expect(dateKey(addDays(day(2026, 3, 1), -1))).toBe('2026-02-28')
  })

  it('finds a Monday-based week start', () => {
    expect(dateKey(startOfWeek(day(2026, 3, 11)))).toBe('2026-03-09')
  })
})

describe('currentStreak', () => {
  it('counts consecutive completed days up to today', () => {
    expect(currentStreak(habit(['2026-03-08', '2026-03-09', '2026-03-10']), day(2026, 3, 10))).toBe(3)
  })

  it('does not break when today is still open', () => {
    expect(currentStreak(habit(['2026-03-08', '2026-03-09']), day(2026, 3, 10))).toBe(2)
  })

  it('treats frozen days as satisfied', () => {
    expect(currentStreak(habit(['2026-03-10'], ['2026-03-09'], ), day(2026, 3, 10))).toBe(2)
  })

  it('stops at a gap', () => {
    expect(currentStreak(habit(['2026-03-10', '2026-03-08']), day(2026, 3, 10))).toBe(1)
  })
})

describe('bestStreak', () => {
  it('finds the longest historical run', () => {
    expect(bestStreak(habit(['2026-03-01', '2026-03-02', '2026-03-03', '2026-03-05', '2026-03-06']))).toBe(3)
  })

  it('is zero with no history', () => {
    expect(bestStreak(habit())).toBe(0)
  })
})

describe('weeklyStats', () => {
  it('summarises the current week against the target', () => {
    const stats = weeklyStats(habit(['2026-03-09', '2026-03-10', '2026-03-11'], [], 3), day(2026, 3, 11))
    expect(stats.days).toHaveLength(7)
    expect(stats.days[0]?.key).toBe('2026-03-09')
    expect(stats.completed).toBe(3)
    expect(stats.met).toBe(true)
    expect(stats.percent).toBe(100)
  })
})

describe('recentDays', () => {
  it('returns a window ending today', () => {
    const days = recentDays(habit(), 5, day(2026, 3, 10))
    expect(days).toHaveLength(5)
    expect(days[4]?.key).toBe('2026-03-10')
    expect(days[4]?.today).toBe(true)
  })
})
