import { describe, expect, it } from 'vitest'
import { TEMPLATES, TEMPLATE_LIST, isTemplateId } from './templates'

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
      expect(t.pdfFonts.regular).toBeTruthy()
      expect(t.pdfFonts.bold).toBeTruthy()
    }
  })
})
