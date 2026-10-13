import { beforeEach, describe, expect, it } from 'vitest'
import {
  DEFAULT_SETTINGS,
  STORAGE_KEY,
  emptyPortfolio,
  loadDraft,
  normalizeUrl,
  portfolioHasContent,
  renderPortfolioHtml,
  resumeToPortfolio,
  saveDraft,
} from './model'
import { sampleResume } from '../lib/sampleData'
import type { PortfolioData } from './model'

const data = (): PortfolioData => resumeToPortfolio(sampleResume())

beforeEach(() => {
  localStorage.clear()
})

describe('resumeToPortfolio', () => {
  it('maps the resume profile into portfolio fields', () => {
    const portfolio = resumeToPortfolio(sampleResume())
    expect(portfolio.name).toBe('Jordan Avery')
    expect(portfolio.headline).toBe('Senior Frontend Engineer')
    expect(portfolio.email).toBe('jordan.avery@email.com')
    expect(portfolio.links).toHaveLength(2)
    expect(portfolio.experience).toHaveLength(2)
    expect(portfolio.projects).toHaveLength(1)
    expect(portfolio.education).toHaveLength(1)
  })

  it('flattens and de-duplicates skills', () => {
    const portfolio = resumeToPortfolio(sampleResume())
    expect(portfolio.skills).toContain('TypeScript')
    expect(new Set(portfolio.skills).size).toBe(portfolio.skills.length)
  })
})

describe('portfolioHasContent', () => {
  it('is false for an empty portfolio and true once filled', () => {
    expect(portfolioHasContent(emptyPortfolio())).toBe(false)
    expect(portfolioHasContent(data())).toBe(true)
  })
})

describe('normalizeUrl', () => {
  it('keeps safe schemes, prefixes bare domains, and rejects junk', () => {
    expect(normalizeUrl('https://example.com')).toBe('https://example.com')
    expect(normalizeUrl('mailto:a@b.com')).toBe('mailto:a@b.com')
    expect(normalizeUrl('example.com/path')).toBe('https://example.com/path')
    expect(normalizeUrl('a@b.com')).toBe('mailto:a@b.com')
    expect(normalizeUrl('')).toBeNull()
    expect(normalizeUrl('javascript:alert(1)')).toBeNull()
  })
})

describe('renderPortfolioHtml', () => {
  it('renders a full HTML document with the profile details', () => {
    const html = renderPortfolioHtml(data(), DEFAULT_SETTINGS)
    expect(html.startsWith('<!doctype html>')).toBe(true)
    expect(html).toContain('Jordan Avery')
    expect(html).toContain('Senior Frontend Engineer')
    expect(html).toContain('OpenCharts')
    expect(html).toContain('mailto:jordan.avery@email.com')
    expect(html).toContain('<title>Jordan Avery · Portfolio</title>')
  })

  it('escapes user-supplied HTML', () => {
    const evil = { ...emptyPortfolio(), name: '<script>alert(1)</script>', summary: 'A & B' }
    const html = renderPortfolioHtml(evil, DEFAULT_SETTINGS)
    expect(html).not.toContain('<script>alert(1)</script>')
    expect(html).toContain('&lt;script&gt;')
    expect(html).toContain('A &amp; B')
  })

  it('uses the selected theme accent and mode background', () => {
    const light = renderPortfolioHtml(data(), { ...DEFAULT_SETTINGS, themeId: 'emerald' })
    expect(light).toContain('#059669')
    expect(light).toContain('background:#ffffff')
    const dark = renderPortfolioHtml(data(), { ...DEFAULT_SETTINGS, mode: 'dark' })
    expect(dark).toContain('background:#0b1120')
  })

  it('omits sections that are toggled off', () => {
    const html = renderPortfolioHtml(data(), { ...DEFAULT_SETTINGS, showProjects: false })
    expect(html).not.toContain('<h2>Projects</h2>')
    expect(html).not.toContain('OpenCharts')
  })

  it('applies a custom accent color override', () => {
    const html = renderPortfolioHtml(data(), { ...DEFAULT_SETTINGS, accentColor: '#123456' })
    expect(html).toContain('#123456')
    expect(html).toContain('.topbar')
  })

  it('hides the avatar, accent bar, and uppercase headings when disabled', () => {
    const html = renderPortfolioHtml(data(), {
      ...DEFAULT_SETTINGS,
      showAvatar: false,
      accentBar: false,
      headingsUppercase: false,
    })
    expect(html).not.toContain('class="avatar"')
    expect(html).not.toContain('class="topbar"')
    expect(html).toContain('text-transform:none')
  })

  it('tightens spacing in compact density', () => {
    const html = renderPortfolioHtml(data(), { ...DEFAULT_SETTINGS, density: 'compact' })
    expect(html).toContain('padding:48px 22px 36px')
    expect(html).toContain('.section{margin-top:30px}')
  })

  it('falls back to a placeholder name when empty', () => {
    const html = renderPortfolioHtml(emptyPortfolio(), DEFAULT_SETTINGS)
    expect(html).toContain('Your Name')
  })
})

describe('loadDraft / saveDraft', () => {
  it('returns null when nothing is stored', () => {
    expect(loadDraft()).toBeNull()
  })

  it('round-trips a draft and merges partial data', () => {
    saveDraft({ data: data(), settings: { ...DEFAULT_SETTINGS, mode: 'dark' } })
    expect(localStorage.getItem(STORAGE_KEY)).toContain('Jordan Avery')
    const loaded = loadDraft()
    expect(loaded?.settings.mode).toBe('dark')
    expect(loaded?.data.name).toBe('Jordan Avery')
  })

  it('ignores corrupt data', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(loadDraft()).toBeNull()
  })
})
