import { describe, expect, it } from 'vitest'
import { emptySignature, signatureHtml, signatureText, signatureVCard } from './model'

describe('signatureHtml', () => {
  it('includes name, role and company', () => {
    const html = signatureHtml({ ...emptySignature(), name: 'Ada', role: 'Engineer', company: 'Acme' })
    expect(html).toContain('Ada')
    expect(html).toContain('Engineer · Acme')
    expect(html).toContain('<table')
  })

  it('links contact details', () => {
    const html = signatureHtml({ ...emptySignature(), email: 'a@b.com', phone: '+1 555' })
    expect(html).toContain('mailto:a@b.com')
    expect(html).toContain('tel:+1555')
  })

  it('escapes markup in fields', () => {
    expect(signatureHtml({ ...emptySignature(), name: '<script>' })).toContain('&lt;script&gt;')
  })

  it('applies the accent colour', () => {
    expect(signatureHtml({ ...emptySignature(), accent: '#ff0000' })).toContain('#ff0000')
  })

  it('renders distinct markup per layout', () => {
    const classic = signatureHtml({ ...emptySignature(), layout: 'classic' })
    const compact = signatureHtml({ ...emptySignature(), layout: 'compact' })
    const banner = signatureHtml({ ...emptySignature(), layout: 'banner' })
    expect(compact).not.toBe(classic)
    expect(banner).not.toBe(classic)
    expect(banner).not.toBe(compact)
  })

  it('fills the banner with the accent colour', () => {
    expect(signatureHtml({ ...emptySignature(), layout: 'banner', accent: '#ff0000' })).toContain('background:#ff0000')
  })

  it('adds a rounded photo for an image data URL', () => {
    const html = signatureHtml({ ...emptySignature(), photo: 'data:image/png;base64,AAAA' })
    expect(html).toContain('<img')
    expect(html).toContain('border-radius:50%')
  })

  it('omits the photo when empty', () => {
    expect(signatureHtml({ ...emptySignature(), photo: '' })).not.toContain('<img')
  })
})

describe('signatureVCard', () => {
  it('produces a valid vCard 3.0 with the contact details', () => {
    const card = signatureVCard({ ...emptySignature(), name: 'Ada Lovelace' })
    expect(card).toContain('BEGIN:VCARD')
    expect(card).toContain('VERSION:3.0')
    expect(card).toContain('FN:Ada Lovelace')
    expect(card).toContain('END:VCARD')
    expect(card).toContain('\r\n')
  })
})

describe('signatureText', () => {
  it('produces a plain-text signature', () => {
    const text = signatureText({ ...emptySignature(), name: 'Ada', role: 'Dev', company: 'Acme', location: '' })
    expect(text.split('\n')[0]).toBe('Ada')
    expect(text).toContain('Dev · Acme')
  })
})
