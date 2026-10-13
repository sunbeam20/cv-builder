import { describe, expect, it } from 'vitest'
import {
  contrastRatio,
  generateRamp,
  hslToRgb,
  parseHex,
  relativeLuminance,
  rgbToHex,
  rgbToHsl,
  toCssVariables,
  toTailwind,
  wcagLevel,
} from './color'

describe('parseHex', () => {
  it('parses six-digit hex and shorthand', () => {
    expect(parseHex('#ff0000')).toEqual({ r: 255, g: 0, b: 0 })
    expect(parseHex('f00')).toEqual({ r: 255, g: 0, b: 0 })
    expect(parseHex('abc')).toEqual({ r: 170, g: 187, b: 204 })
  })

  it('ignores any alpha channel', () => {
    expect(parseHex('#ff000080')).toEqual({ r: 255, g: 0, b: 0 })
    expect(parseHex('#f008')).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('rejects invalid input', () => {
    expect(parseHex('#xyz')).toBeNull()
    expect(parseHex('')).toBeNull()
    expect(parseHex('#12345')).toBeNull()
  })
})

describe('conversions', () => {
  it('round-trips rgb to hex', () => {
    expect(rgbToHex({ r: 79, g: 70, b: 229 })).toBe('#4f46e5')
  })

  it('converts rgb to hsl and back', () => {
    expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, l: 50 })
    expect(hslToRgb({ h: 0, s: 100, l: 50 })).toEqual({ r: 255, g: 0, b: 0 })
  })
})

describe('contrast', () => {
  it('rates white on black as 21:1', () => {
    expect(contrastRatio({ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 })).toBeCloseTo(21, 4)
  })

  it('computes a black luminance of zero', () => {
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBeCloseTo(0)
  })

  it('classifies WCAG levels', () => {
    expect(wcagLevel(21)).toBe('AAA')
    expect(wcagLevel(5)).toBe('AA')
    expect(wcagLevel(3.5)).toBe('AA Large')
    expect(wcagLevel(1.5)).toBe('Fail')
  })
})

describe('ramp', () => {
  it('produces one entry per step', () => {
    expect(generateRamp({ r: 79, g: 70, b: 229 })).toHaveLength(11)
  })

  it('formats CSS variables', () => {
    expect(toCssVariables([{ step: 500, hex: '#4f46e5' }], 'brand')).toContain(
      '--color-brand-500: #4f46e5;',
    )
  })

  it('formats a Tailwind palette', () => {
    const output = toTailwind([{ step: 500, hex: '#4f46e5' }], 'brand')
    expect(output).toContain("500: '#4f46e5'")
    expect(output.startsWith('brand: {')).toBe(true)
  })
})
