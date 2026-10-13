import { describe, expect, it } from 'vitest'
import { badgePath, emptyLogo, logoSvg, monogramFor, randomLogo } from './model'

describe('monogramFor', () => {
  it('uses initials for multi-word names', () => {
    expect(monogramFor({ ...emptyLogo(), text: 'North Wind', monogram: '' })).toBe('NW')
  })

  it('falls back to two letters for a single word', () => {
    expect(monogramFor({ ...emptyLogo(), text: 'Acme', monogram: '' })).toBe('AC')
  })

  it('prefers an explicit monogram', () => {
    expect(monogramFor({ ...emptyLogo(), text: 'Acme', monogram: 'zz' })).toBe('ZZ')
  })
})

describe('logoSvg', () => {
  it('renders text, tagline and the chosen accent colour', () => {
    const svg = logoSvg({ ...emptyLogo(), text: 'Acme', tagline: 'Studio', primary: '#123456' })
    expect(svg).toContain('>AC<')
    expect(svg).toContain('STUDIO')
    expect(svg).toContain('#123456')
    expect(svg.startsWith('<svg')).toBe(true)
  })

  it('escapes special characters', () => {
    expect(logoSvg({ ...emptyLogo(), text: 'Ben & Co' })).toContain('Ben &amp; Co')
  })

  it('skips the badge when shape is none', () => {
    const svg = logoSvg({ ...emptyLogo(), shape: 'none' })
    expect(svg).not.toContain('<circle')
  })
})

describe('badgePath', () => {
  it('produces the requested geometry', () => {
    expect(badgePath('circle', 10, 10, 4)).toContain('<circle')
    expect(badgePath('hex', 10, 10, 4)).toContain('<polygon')
    expect(badgePath('none', 10, 10, 4)).toBe('')
  })
})

describe('randomLogo', () => {
  it('keeps the base name but changes styling', () => {
    const next = randomLogo({ ...emptyLogo(), text: 'Keep' })
    expect(next.text).toBe('Keep')
  })
})
