import { describe, expect, it } from 'vitest'
import { emptySignature, signatureHtml, signatureText } from './model'

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
})

describe('signatureText', () => {
  it('produces a plain-text signature', () => {
    const text = signatureText({ ...emptySignature(), name: 'Ada', role: 'Dev', company: 'Acme', location: '' })
    expect(text.split('\n')[0]).toBe('Ada')
    expect(text).toContain('Dev · Acme')
  })
})
