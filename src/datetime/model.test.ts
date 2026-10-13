import { describe, expect, it } from 'vitest'
import {
  addToDate,
  calculateAge,
  diffDates,
  formatInTimeZone,
  parseDateInput,
  toDateInput,
} from './model'

describe('diffDates', () => {
  it('counts total days and calendar components', () => {
    const diff = diffDates(new Date(2026, 0, 1), new Date(2026, 2, 1))
    expect(diff.totalDays).toBe(59)
    expect(diff.months).toBe(2)
    expect(diff.years).toBe(0)
  })

  it('is symmetric regardless of order', () => {
    expect(diffDates(new Date(2026, 2, 1), new Date(2026, 0, 1)).totalDays).toBe(59)
  })
})

describe('calculateAge', () => {
  it('computes years, months, and days', () => {
    const age = calculateAge(new Date(2000, 0, 1), new Date(2026, 2, 10))
    expect(age.years).toBe(26)
    expect(age.months).toBe(2)
    expect(age.days).toBe(9)
  })

  it('finds the next birthday', () => {
    const age = calculateAge(new Date(2000, 11, 31), new Date(2026, 2, 10))
    expect(age.nextBirthdayIn).toBe(296)
  })
})

describe('addToDate', () => {
  it('adds years, months, and days', () => {
    expect(toDateInput(addToDate(new Date(2026, 0, 15), { months: 1, days: 5 }))).toBe('2026-02-20')
  })

  it('rolls over month ends', () => {
    expect(toDateInput(addToDate(new Date(2026, 0, 31), { months: 1 }))).toBe('2026-03-03')
  })
})

describe('time zones', () => {
  it('formats an instant in UTC', () => {
    expect(formatInTimeZone(new Date(Date.UTC(2026, 2, 10, 12, 30)), 'UTC')).toBe('2026-03-10 12:30')
  })
})

describe('date input helpers', () => {
  it('round-trips a date input value', () => {
    expect(toDateInput(new Date(2026, 2, 5))).toBe('2026-03-05')
    expect(parseDateInput('2026-03-05')?.getMonth()).toBe(2)
    expect(parseDateInput('')).toBeNull()
  })
})
