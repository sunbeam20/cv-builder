import { describe, expect, it } from 'vitest'
import { parseHost, toolUrl, hubUrl, isDevHost } from './host'

describe('parseHost', () => {
  it('recognises dev hosts', () => {
    for (const host of ['localhost', '127.0.0.1', '::1']) {
      const parsed = parseHost(host)
      expect(parsed).toEqual({ tool: null, rootHost: host, isDev: true })
    }
    expect(isDevHost('LOCALHOST')).toBe(true)
  })

  it('treats a known tool subdomain as that tool', () => {
    const parsed = parseHost('cv.example.com')
    expect(parsed.tool?.slug).toBe('cv')
    expect(parsed.rootHost).toBe('example.com')
    expect(parsed.isDev).toBe(false)
  })

  it('treats an unknown label as part of the root host', () => {
    const parsed = parseHost('notatool.example.com')
    expect(parsed.tool).toBeNull()
    expect(parsed.rootHost).toBe('notatool.example.com')
  })

  it('keeps bare apex hosts as the hub', () => {
    const parsed = parseHost('example.com')
    expect(parsed.tool).toBeNull()
    expect(parsed.rootHost).toBe('example.com')
  })

  it('strips trailing dots', () => {
    const parsed = parseHost('cv.example.com.')
    expect(parsed.tool?.slug).toBe('cv')
    expect(parsed.rootHost).toBe('example.com')
  })

  it('is case-insensitive', () => {
    expect(parseHost('CV.Example.COM').tool?.slug).toBe('cv')
  })
})

describe('url helpers', () => {
  it('builds tool subdomain URLs', () => {
    expect(toolUrl('cv', 'example.com')).toBe('https://cv.example.com/')
  })

  it('builds the hub URL', () => {
    expect(hubUrl('example.com')).toBe('https://example.com/')
  })
})