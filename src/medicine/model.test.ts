import { describe, expect, it } from 'vitest'
import {
  createMedicine,
  dayProgress,
  doseKey,
  needsRefill,
  normalizeTime,
  parseTimes,
  scheduledDoses,
} from './model'

const at = (h: number, m: number) => new Date(2026, 2, 10, h, m)

describe('time parsing', () => {
  it('normalises valid times', () => {
    expect(normalizeTime('9:05')).toBe('09:05')
    expect(normalizeTime('23:59')).toBe('23:59')
    expect(normalizeTime('24:00')).toBeNull()
  })

  it('parses, de-duplicates, and sorts a list', () => {
    expect(parseTimes('21:00, 09:00, 09:00')).toEqual(['09:00', '21:00'])
  })
})

describe('scheduledDoses', () => {
  const medicine = { ...createMedicine({ name: 'A', times: ['09:00', '21:00'] }), id: 'med' }

  it('flags taken, overdue, and future doses', () => {
    const doses = scheduledDoses(medicine, { [doseKey('med', '2026-03-10', '09:00')]: true }, at(12, 0))
    expect(doses[0]).toMatchObject({ time: '09:00', taken: true, overdue: false })
    expect(doses[1]).toMatchObject({ time: '21:00', taken: false, future: true })
  })

  it('marks a missed past dose overdue', () => {
    const doses = scheduledDoses(medicine, {}, at(12, 0))
    expect(doses[0]?.overdue).toBe(true)
  })
})

describe('dayProgress', () => {
  it('counts doses taken today', () => {
    const medicine = { ...createMedicine({ name: 'A', times: ['09:00'] }), id: 'med' }
    const progress = dayProgress([medicine], { [doseKey('med', '2026-03-10', '09:00')]: true }, at(10, 0))
    expect(progress).toEqual({ total: 1, taken: 1, percent: 100 })
  })
})

describe('needsRefill', () => {
  it('warns at or below the threshold', () => {
    expect(needsRefill(createMedicine({ name: 'A', remaining: 3 }))).toBe(true)
    expect(needsRefill(createMedicine({ name: 'A', remaining: 30 }))).toBe(false)
  })
})
