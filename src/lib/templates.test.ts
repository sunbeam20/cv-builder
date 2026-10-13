import { describe, expect, it } from 'vitest'
import {
  BULLET_GLYPH,
  BULLET_LABELS,
  BULLET_STYLES,
  DESIGN_PRESETS,
  FONT_OPTIONS,
  HEADING_CASES,
  HEADING_CASE_LABELS,
  HEADING_WEIGHTS,
  HEADING_WEIGHT_LABELS,
  TEMPLATES,
  TEMPLATE_LIST,
  isTemplateId,
  resolveTheme,
} from './templates'

describe('templates', () => {
  it('lists every template in the catalogue', () => {
    expect(TEMPLATE_LIST).toHaveLength(Object.keys(TEMPLATES).length)
    expect(TEMPLATE_LIST.map((t) => t.id)).toEqual(Object.keys(TEMPLATES))
  })

  it('recognises known template ids and rejects unknown ones', () => {
    for (const t of TEMPLATE_LIST) expect(isTemplateId(t.id)).toBe(true)
    expect(isTemplateId('nope')).toBe(false)
  })

  it('gives every template the required theme fields', () => {
    for (const t of TEMPLATE_LIST) {
      expect(t.fontFamily).toBeTruthy()
      expect(t.docxFont).toBeTruthy()
      expect(t.accent).toMatch(/^#[0-9a-f]{6}$/i)
      expect(t.nameColor).toMatch(/^#[0-9a-f]{6}$/i)
      expect(t.linkColor).toMatch(/^#[0-9a-f]{6}$/i)
      expect(t.baseFontSize).toBeGreaterThan(0)
      expect(t.pdfFonts.regular).toBeTruthy()
      expect(t.pdfFonts.bold).toBeTruthy()
    }
  })
})

describe('resolveTheme', () => {
  it('returns the template unchanged when there are no overrides', () => {
    expect(resolveTheme(TEMPLATES.ats, {})).toEqual(TEMPLATES.ats)
  })

  it('applies colour and size overrides', () => {
    const theme = resolveTheme(TEMPLATES.ats, {
      accent: '#ff0000',
      linkColor: '#00ff00',
      baseFontSize: 12,
      accentBar: true,
    })
    expect(theme.accent).toBe('#ff0000')
    expect(theme.linkColor).toBe('#00ff00')
    expect(theme.baseFontSize).toBe(12)
    expect(theme.accentBar).toBe(true)
    expect(theme.nameColor).toBe(TEMPLATES.ats.nameColor)
  })

  it('swaps fonts when a font id is chosen', () => {
    const font = FONT_OPTIONS.find((f) => f.id === 'georgia')!
    const theme = resolveTheme(TEMPLATES.ats, { fontId: 'georgia' })
    expect(theme.fontFamily).toBe(font.cssFamily)
    expect(theme.docxFont).toBe(font.docxFont)
    expect(theme.pdfFonts).toEqual(font.pdfFonts)
  })

  it('ignores an unknown font id', () => {
    const theme = resolveTheme(TEMPLATES.modern, { fontId: 'nope' })
    expect(theme.fontFamily).toBe(TEMPLATES.modern.fontFamily)
  })

  it('applies layout overrides', () => {
    const theme = resolveTheme(TEMPLATES.ats, {
      pageMarginY: 60,
      pageMarginX: 40,
      lineHeight: 1.6,
      headingTracking: 0.2,
    })
    expect(theme.pageMarginY).toBe(60)
    expect(theme.pageMarginX).toBe(40)
    expect(theme.lineHeight).toBe(1.6)
    expect(theme.headingTracking).toBe(0.2)
  })

  it('applies typography and bullet overrides', () => {
    const theme = resolveTheme(TEMPLATES.ats, {
      nameScale: 1.2,
      headingScale: 0.9,
      sectionSpacing: 24,
      bulletStyle: 'dash',
    })
    expect(theme.nameScale).toBe(1.2)
    expect(theme.headingScale).toBe(0.9)
    expect(theme.sectionSpacing).toBe(24)
    expect(theme.bulletStyle).toBe('dash')
  })

  it('provides a glyph for every bullet style', () => {
    for (const style of BULLET_STYLES) {
      expect(BULLET_LABELS[style]).toBeTruthy()
      expect(typeof BULLET_GLYPH[style]).toBe('string')
    }
    expect(BULLET_GLYPH.none).toBe('')
  })

  it('applies heading and name typography overrides', () => {
    const theme = resolveTheme(TEMPLATES.ats, {
      headingCase: 'capitalize',
      headingWeight: 400,
      ruleColor: '#123456',
      ruleThickness: 2.5,
      nameTracking: 0.1,
    })
    expect(theme.headingCase).toBe('capitalize')
    expect(theme.headingWeight).toBe(400)
    expect(theme.ruleColor).toBe('#123456')
    expect(theme.ruleThickness).toBe(2.5)
    expect(theme.nameTracking).toBe(0.1)
  })

  it('exposes labels for every heading case and weight', () => {
    for (const value of HEADING_CASES) expect(HEADING_CASE_LABELS[value]).toBeTruthy()
    for (const weight of HEADING_WEIGHTS) expect(HEADING_WEIGHT_LABELS[weight]).toBeTruthy()
  })
})

describe('design presets', () => {
  it('has unique ids and names', () => {
    expect(new Set(DESIGN_PRESETS.map((p) => p.id)).size).toBe(DESIGN_PRESETS.length)
    for (const preset of DESIGN_PRESETS) expect(preset.name).toBeTruthy()
  })

  it('resolves cleanly on top of every template', () => {
    for (const preset of DESIGN_PRESETS) {
      for (const template of TEMPLATE_LIST) {
        const theme = resolveTheme(template, preset.customization)
        expect(theme.baseFontSize).toBeGreaterThan(0)
        expect(theme.pageMarginY).toBeGreaterThan(0)
        expect(theme.headingWeight).toBe(
          preset.customization.headingWeight ?? template.headingWeight,
        )
      }
    }
  })
})
