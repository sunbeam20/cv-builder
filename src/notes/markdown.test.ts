import { describe, expect, it } from 'vitest'
import { escapeHtml, renderMarkdown, safeUrl, toPlainText, wordCount } from './markdown'

describe('escapeHtml / safeUrl', () => {
  it('escapes HTML special characters', () => {
    expect(escapeHtml('<b>&"')).toBe('&lt;b&gt;&amp;&quot;')
  })

  it('allows only safe URL schemes', () => {
    expect(safeUrl('https://example.com')).toBe('https://example.com')
    expect(safeUrl('mailto:a@b.com')).toBe('mailto:a@b.com')
    expect(safeUrl('#section')).toBe('#section')
    expect(safeUrl('javascript:alert(1)')).toBe('')
  })
})

describe('renderMarkdown', () => {
  it('renders headings', () => {
    expect(renderMarkdown('# Title')).toContain('<h1>Title</h1>')
    expect(renderMarkdown('### Sub')).toContain('<h3>Sub</h3>')
  })

  it('renders inline emphasis and code', () => {
    const html = renderMarkdown('**bold** *italic* `code` ~~old~~')
    expect(html).toContain('<strong>bold</strong>')
    expect(html).toContain('<em>italic</em>')
    expect(html).toContain('<code>code</code>')
    expect(html).toContain('<del>old</del>')
  })

  it('renders unordered and ordered lists', () => {
    expect(renderMarkdown('- a\n- b')).toContain('<ul><li>a</li><li>b</li></ul>')
    expect(renderMarkdown('1. one\n2. two')).toContain('<ol><li>one</li><li>two</li></ol>')
  })

  it('renders blockquotes and rules', () => {
    expect(renderMarkdown('> hello')).toContain('<blockquote>hello</blockquote>')
    expect(renderMarkdown('---')).toContain('<hr />')
  })

  it('escapes raw HTML inside code blocks', () => {
    const html = renderMarkdown('```html\n<script>alert(1)</script>\n```')
    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<script>')
  })

  it('sanitizes unsafe links', () => {
    expect(renderMarkdown('[x](javascript:alert(1))')).not.toContain('href')
    expect(renderMarkdown('[site](https://example.com)')).toContain('href="https://example.com"')
  })

  it('wraps plain lines in a paragraph with breaks', () => {
    expect(renderMarkdown('one\ntwo')).toContain('<p>one<br />two</p>')
  })
})

describe('toPlainText / wordCount', () => {
  it('strips markup', () => {
    expect(toPlainText('# Hi\n\n**there**')).toBe('Hi there')
  })

  it('counts words', () => {
    expect(wordCount('one two three')).toBe(3)
    expect(wordCount('')).toBe(0)
  })
})
