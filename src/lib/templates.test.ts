import { describe, expect, it } from 'vitest'
import {
  FONT_OPTIONS,
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
})
