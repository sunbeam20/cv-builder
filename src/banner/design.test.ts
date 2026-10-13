import { beforeEach, describe, expect, it } from 'vitest'
import {
  BANNER_SIZES,
  BANNER_THEMES,
  DEFAULT_DESIGN,
  applyTheme,
  backgroundStyle,
  clampDimension,
  findSize,
  findTheme,
  fontFamily,
  layout,
  loadDesign,
  saveDesign,
  STORAGE_KEY,
} from './design'

beforeEach(() => {
  localStorage.clear()
})

describe('banner presets', () => {
  it('finds sizes and themes by id', () => {
    expect(findSize('linkedin')?.width).toBe(1584)
    expect(findSize('nope')).toBeUndefined()
    expect(findTheme('indigo')?.name).toBe('Indigo')
    expect(findTheme('nope')).toBeUndefined()
  })

  it('includes a range of presets', () => {
    expect(BANNER_SIZES.length).toBeGreaterThan(3)
    expect(BANNER_THEMES.length).toBeGreaterThan(2)
  })
})

describe('fontFamily', () => {
  it('resolves a known font and falls back otherwise', () => {
    expect(fontFamily('georgia')).toContain('Georgia')
    expect(fontFamily('does-not-exist')).toBe(fontFamily('helvetica'))
  })
})

describe('backgroundStyle', () => {
  it('returns a solid color', () => {
    expect(backgroundStyle({ ...DEFAULT_DESIGN, bgType: 'solid', bgColor: '#112233' })).toEqual({
      backgroundColor: '#112233',
    })
  })

  it('returns a gradient', () => {
    const style = backgroundStyle({
      ...DEFAULT_DESIGN,
      bgType: 'gradient',
      bgColor: '#000000',
      bgColor2: '#ffffff',
      gradientAngle: 90,
    })
    expect(style.backgroundImage).toBe('linear-gradient(90deg, #000000, #ffffff)')
  })
})

describe('layout', () => {
  it('scales sizes with the canvas height', () => {
    const small = layout({ ...DEFAULT_DESIGN, height: 300 })
    const large = layout({ ...DEFAULT_DESIGN, height: 600 })
    expect(large.titleSize).toBeGreaterThan(small.titleSize)
    expect(large.padding).toBeGreaterThan(small.padding)
  })

  it('honours the title scale', () => {
    const base = layout({ ...DEFAULT_DESIGN, height: 400, titleScale: 1 })
    const big = layout({ ...DEFAULT_DESIGN, height: 400, titleScale: 1.5 })
    expect(big.titleSize).toBeGreaterThan(base.titleSize)
  })
})

describe('applyTheme', () => {
  it('copies theme colors onto the design', () => {
    const theme = findTheme('forest')!
    const themed = applyTheme(DEFAULT_DESIGN, theme)
    expect(themed.bgColor).toBe(theme.bgColor)
    expect(themed.textColor).toBe(theme.textColor)
    expect(themed.accentColor).toBe(theme.accentColor)
  })
})

describe('clampDimension', () => {
  it('keeps dimensions within bounds and rounds', () => {
    expect(clampDimension(50)).toBe(100)
    expect(clampDimension(99999)).toBe(4000)
    expect(clampDimension(1234.6)).toBe(1235)
    expect(clampDimension(Number.NaN)).toBe(800)
  })
})

describe('loadDesign / saveDesign', () => {
  it('returns the default when nothing is stored', () => {
    expect(loadDesign()).toEqual(DEFAULT_DESIGN)
  })

  it('round-trips a saved design', () => {
    saveDesign({ ...DEFAULT_DESIGN, title: 'Ada Lovelace', width: 1234 })
    expect(localStorage.getItem(STORAGE_KEY)).toContain('Ada Lovelace')
    const loaded = loadDesign()
    expect(loaded.title).toBe('Ada Lovelace')
    expect(loaded.width).toBe(1234)
  })

  it('merges partial stored data over the defaults', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ title: 'Partial' }))
    const loaded = loadDesign()
    expect(loaded.title).toBe('Partial')
    expect(loaded.height).toBe(DEFAULT_DESIGN.height)
  })

  it('ignores corrupt stored data', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(loadDesign()).toEqual(DEFAULT_DESIGN)
  })
})
