import { describe, expect, it } from 'vitest'
import {
  SIZES,
  emptyFavicon,
  faviconDataUri,
  faviconLinkTag,
  faviconSvg,
  linkTags,
  webmanifest,
} from './model'

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

  it('renders an image element with the data URL in image mode', () => {
    const image = 'data:image/png;base64,AAAA'
    const svg = faviconSvg({ ...emptyFavicon(), mode: 'image', image })
    expect(svg).toContain('<image')
    expect(svg).toContain(image)
  })
})

describe('faviconDataUri / faviconLinkTag', () => {
  it('produces an embeddable data URI', () => {
    expect(faviconDataUri(emptyFavicon())).toContain('data:image/svg+xml')
    expect(faviconLinkTag(emptyFavicon())).toContain('<link rel="icon"')
  })
})

describe('webmanifest', () => {
  it('parses as JSON and lists every size', () => {
    const parsed = JSON.parse(webmanifest(emptyFavicon())) as {
      icons: { sizes: string }[]
      theme_color: string
    }
    const sizes = parsed.icons.map((icon) => icon.sizes)
    SIZES.forEach((size) => expect(sizes).toContain(`${size}x${size}`))
    expect(parsed.theme_color).toBe(emptyFavicon().background)
  })
})

describe('linkTags', () => {
  it('covers the manifest, apple touch icon and icon formats', () => {
    const tags = linkTags()
    expect(tags).toContain('site.webmanifest')
    expect(tags).toContain('apple-touch-icon')
    expect(tags).toContain('favicon.ico')
    expect(tags).toContain('image/svg+xml')
  })
})
