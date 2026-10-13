import { describe, expect, it } from 'vitest'
import { emptyFavicon, faviconDataUri, faviconLinkTag, faviconSvg } from './model'

describe('faviconSvg', () => {
  it('renders the letter and colours', () => {
    const svg = faviconSvg({ ...emptyFavicon(), text: 'Z', background: '#000000', foreground: '#ffffff' })
    expect(svg).toContain('>Z<')
    expect(svg).toContain('#000000')
    expect(svg).toContain('#ffffff')
  })

  it('truncates to two letters', () => {
    expect(faviconSvg({ ...emptyFavicon(), text: 'abcd' })).toContain('>ab<')
  })

  it('uses a circular radius for circle shapes', () => {
    expect(faviconSvg({ ...emptyFavicon(), shape: 'circle' })).toContain('rx="32"')
  })

  it('escapes special characters', () => {
    expect(faviconSvg({ ...emptyFavicon(), text: '<' })).toContain('&lt;')
  })
})

describe('faviconDataUri / faviconLinkTag', () => {
  it('produces an embeddable data URI', () => {
    expect(faviconDataUri(emptyFavicon())).toContain('data:image/svg+xml')
    expect(faviconLinkTag(emptyFavicon())).toContain('<link rel="icon"')
  })
})
