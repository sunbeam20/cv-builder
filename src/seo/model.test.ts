import { describe, expect, it } from 'vitest'
import {
  crumbsFromUrl,
  descriptionStatus,
  emptySeo,
  hostFromUrl,
  metaTags,
  seoWarnings,
  titleStatus,
  truncateText,
} from './model'

describe('truncateText', () => {
  it('leaves short text alone', () => {
    expect(truncateText('hello', 10)).toBe('hello')
  })

  it('adds an ellipsis when too long', () => {
    const result = truncateText('abcdefghij', 5)
    expect(result.endsWith('…')).toBe(true)
    expect(result.length).toBeLessThanOrEqual(5)
  })
})

describe('hostFromUrl / crumbsFromUrl', () => {
  it('strips the protocol and www', () => {
    expect(hostFromUrl('https://www.example.com/a/b')).toBe('example.com')
  })

  it('builds breadcrumb style crumbs', () => {
    expect(crumbsFromUrl('https://example.com/blog/post')).toBe('example.com › blog › post')
  })
})

describe('seoWarnings', () => {
  it('flags missing fields', () => {
    const warnings = seoWarnings({
      title: '',
      description: '',
      url: 'example.com',
      siteName: '',
      imageAlt: '',
      ogImage: '',
      favicon: '',
    })
    expect(warnings.some((w) => /title/i.test(w))).toBe(true)
    expect(warnings.some((w) => /description/i.test(w))).toBe(true)
    expect(warnings.some((w) => /http/i.test(w))).toBe(true)
    expect(warnings.some((w) => /social share image/i.test(w))).toBe(true)
  })

  it('warns with an empty string when the social share image is missing', () => {
    const input = { ...emptySeo(), title: 'A clear, descriptive page title for search', description: 'x'.repeat(150) }
    expect(input.ogImage).toBe('')
    expect(seoWarnings(input).some((w) => /social share image/i.test(w))).toBe(true)
  })

  it('is happy with well-formed input', () => {
    const warnings = seoWarnings({
      title: 'A clear, descriptive page title for search',
      description: 'x'.repeat(150),
      url: 'https://example.com',
      siteName: 'Example',
      imageAlt: 'A screenshot of the dashboard',
      ogImage: 'data:image/png;base64,abc',
      favicon: 'data:image/png;base64,def',
    })
    expect(warnings).toEqual([])
  })
})

describe('status helpers', () => {
  it('classifies title and description lengths', () => {
    expect(titleStatus('')).toBe('empty')
    expect(titleStatus('x'.repeat(70))).toBe('long')
    expect(titleStatus('A perfectly reasonable page title')).toBe('good')
    expect(descriptionStatus('too short')).toBe('short')
    expect(descriptionStatus('x'.repeat(200))).toBe('long')
  })
})

describe('metaTags', () => {
  it('emits og and twitter tags', () => {
    const tags = metaTags({
      title: 'T',
      description: 'D',
      url: 'https://e.com',
      siteName: 'E',
      imageAlt: 'A',
      ogImage: '',
      favicon: '',
    })
    expect(tags).toContain('<meta property="og:title" content="T" />')
    expect(tags).toContain('<meta name="twitter:card" content="summary_large_image" />')
    expect(tags).toContain('<link rel="canonical" href="https://e.com" />')
  })
})
