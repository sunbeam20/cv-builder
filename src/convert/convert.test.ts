import { describe, expect, it } from 'vitest'
import { UNITS, convertUnit, formatNumber } from './convert'

describe('convertUnit', () => {
  it('converts within length', () => {
    expect(convertUnit('length', 'm', 'cm', 2)).toBeCloseTo(200)
    expect(convertUnit('length', 'km', 'mi', 1)).toBeCloseTo(0.621371, 5)
  })

  it('converts within mass', () => {
    expect(convertUnit('mass', 'kg', 'g', 1.5)).toBeCloseTo(1500)
    expect(convertUnit('mass', 'lb', 'kg', 1)).toBeCloseTo(0.45359237, 6)
  })

  it('converts digital storage using binary units', () => {
    expect(convertUnit('digital', 'gb', 'mb', 1)).toBe(1024)
    expect(convertUnit('digital', 'mb', 'kb', 1)).toBe(1024)
  })

  it('handles temperature offsets', () => {
    expect(convertUnit('temperature', 'c', 'f', 100)).toBeCloseTo(212)
    expect(convertUnit('temperature', 'f', 'c', 32)).toBeCloseTo(0)
    expect(convertUnit('temperature', 'c', 'k', 0)).toBeCloseTo(273.15)
  })

  it('returns NaN for unknown units', () => {
    expect(convertUnit('length', 'nope', 'm', 1)).toBeNaN()
  })

  it('round-trips', () => {
    const there = convertUnit('speed', 'kmh', 'mph', 100)
    expect(convertUnit('speed', 'mph', 'kmh', there)).toBeCloseTo(100, 6)
  })
})

describe('UNITS', () => {
  it('has unique ids per category', () => {
    for (const units of Object.values(UNITS)) {
      expect(new Set(units.map((u) => u.id)).size).toBe(units.length)
    }
  })
})

describe('formatNumber', () => {
  it('formats with sensible precision', () => {
    expect(formatNumber(0)).toBe('0')
    expect(formatNumber(2.5)).toBe('2.5')
    expect(formatNumber(123.456)).toBe('123.46')
    expect(formatNumber(Number.NaN)).toBe('—')
  })
})
