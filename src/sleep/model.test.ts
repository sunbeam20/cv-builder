import { describe, expect, it } from 'vitest'
import {
  bedtimeMinutes,
  createEntry,
  durationMinutes,
  formatClock,
  formatDuration,
  isValidTime,
  minutesFromTime,
  summarise,
  type SleepEntry,
} from './model'

const entry = (overrides: Partial<SleepEntry> = {}): SleepEntry => ({
  ...createEntry({ date: '2026-03-10', bed: '23:00', wake: '07:00', quality: 4 }),
  ...overrides,
})

describe('durationMinutes', () => {
  it('handles a same-day span', () => {
    expect(durationMinutes('13:00', '14:30')).toBe(90)
  })

  it('rolls over midnight', () => {
    expect(durationMinutes('23:00', '07:00')).toBe(480)
  })
})

describe('formatting', () => {
  it('formats durations', () => {
    expect(formatDuration(480)).toBe('8h')
    expect(formatDuration(450)).toBe('7h 30m')
  })

  it('parses and formats clock times', () => {
    expect(minutesFromTime('07:30')).toBe(450)
    expect(formatClock(450)).toBe('07:30')
    expect(formatClock(1500)).toBe('01:00')
  })

  it('validates HH:MM strings', () => {
    expect(isValidTime('23:59')).toBe(true)
    expect(isValidTime('7:05')).toBe(true)
    expect(isValidTime('24:00')).toBe(false)
    expect(isValidTime('noon')).toBe(false)
  })

  it('normalises bedtimes onto a night scale', () => {
    expect(bedtimeMinutes('23:30')).toBe(1410)
    expect(bedtimeMinutes('00:30')).toBe(1470)
  })
})

describe('summarise', () => {
  it('returns null with no entries', () => {
    expect(summarise([])).toBeNull()
  })

  it('averages duration, quality, and times', () => {
    const summary = summarise([
      entry({ id: 'a', date: '2026-03-09', bed: '23:00', wake: '07:00', quality: 4 }),
      entry({ id: 'b', date: '2026-03-10', bed: '22:00', wake: '06:00', quality: 2 }),
    ])
    expect(summary?.averageMinutes).toBe(480)
    expect(summary?.averageQuality).toBe(3)
    expect(summary?.longest).toBe(480)
  })
})
