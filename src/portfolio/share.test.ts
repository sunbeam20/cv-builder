import { describe, expect, it } from 'vitest'
import { decodePortfolio, encodePortfolio, portfolioShareUrl } from './share'
import { DEFAULT_SETTINGS, emptyPortfolio, resumeToPortfolio, type PortfolioSettings } from './model'
import { sampleResume } from '../lib/sampleData'

const settings: PortfolioSettings = {
  ...DEFAULT_SETTINGS,
  themeId: 'rose',
  accentColor: '#123456',
  mode: 'dark',
  density: 'compact',
  showAvatar: false,
  headingsUppercase: false,
  showContact: false,
}

describe('encodePortfolio / decodePortfolio', () => {
  it('round-trips data and settings through the compressed link', () => {
    const data = { ...resumeToPortfolio(sampleResume()), name: 'Únïcøde & Ñame' }
    const encoded = encodePortfolio(data, settings)
    expect(encoded.length).toBeGreaterThan(0)
    const decoded = decodePortfolio(encoded)
    expect(decoded).not.toBeNull()
    expect(decoded?.data).toEqual(data)
    expect(decoded?.settings).toEqual(settings)
  })

  it('round-trips a mostly empty portfolio against defaults', () => {
    const decoded = decodePortfolio(encodePortfolio(emptyPortfolio(), DEFAULT_SETTINGS))
    expect(decoded?.data).toEqual(emptyPortfolio())
    expect(decoded?.settings).toEqual(DEFAULT_SETTINGS)
  })

  it('returns null for corrupt or missing payloads', () => {
    expect(decodePortfolio('')).toBeNull()
    expect(decodePortfolio('not-encoded!!!')).toBeNull()
    expect(decodePortfolio(encodeURIComponent('{invalid json'))).toBeNull()
  })
})

describe('portfolioShareUrl', () => {
  it('builds a URL whose payload decodes back to the original data', () => {
    const data = resumeToPortfolio(sampleResume())
    const url = portfolioShareUrl(data, settings)
    expect(url.startsWith('http')).toBe(true)
    expect(url).toContain('#/p/')
    const payload = url.slice(url.indexOf('#/p/') + 4)
    expect(decodePortfolio(payload)?.data).toEqual(data)
    expect(decodePortfolio(payload)?.settings).toEqual(settings)
  })
})