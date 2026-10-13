const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

export const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (char) => ESCAPES[char] ?? char)

/** Allow only safe URL schemes (and relative/anchor links). */
export function safeUrl(url: string): string {
  const trimmed = url.trim()
  if (/^(https?:\/\/|mailto:|\/|#)/i.test(trimmed)) return trimmed
  return ''
}

const CODE_TOKEN = /\u0000(\d+)\u0000/g

/** Inline formatting: code spans, images, links, bold, italic, strikethrough. */
export function renderInline(text: string): string {
  const codes: string[] = []
  let out = escapeHtml(text)
  out = out.replace(/`([^`]+)`/g, (_match, code: string) => {
    codes.push(`<code>${code}</code>`)
    return `\u0000${codes.length - 1}\u0000`
  })
  out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_match, alt: string, url: string) => {
    const safe = safeUrl(url)
    return safe ? `<img src="${safe}" alt="${alt}" />` : alt
  })
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_match, label: string, url: string) => {
    const safe = safeUrl(url)
    return safe ? `<a href="${safe}" target="_blank" rel="noreferrer">${label}</a>` : label
  })
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  out = out.replace(/__([^_]+)__/g, '<strong>$1</strong>')
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
  out = out.replace(/~~([^~]+)~~/g, '<del>$1</del>')
  out = out.replace(CODE_TOKEN, (_match, index: string) => codes[Number(index)] ?? '')
  return out
}

const isBlank = (line: string): boolean => line.trim() === ''
const isHeading = (line: string): boolean => /^#{1,6}\s/.test(line)
const isFence = (line: string): boolean => /^```/.test(line)
const isHr = (line: string): boolean => /^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)
const isQuote = (line: string): boolean => /^>\s?/.test(line)
const isUl = (line: string): boolean => /^\s*[-*+]\s+/.test(line)
const isOl = (line: string): boolean => /^\s*\d+[.)]\s+/.test(line)

/** Convert Markdown to sanitized HTML. Raw HTML is escaped, not executed. */
export function renderMarkdown(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const html: string[] = []
  let list: { type: 'ul' | 'ol'; items: string[] } | null = null

  const flushList = () => {
    if (!list) return
    html.push(
      `<${list.type}>${list.items.map((item) => `<li>${renderInline(item)}</li>`).join('')}</${list.type}>`,
    )
    list = null
  }

  let i = 0
  while (i < lines.length) {
    const line = lines[i] ?? ''

    if (isFence(line)) {
      flushList()
      const lang = line.replace(/^```/, '').trim()
      const body: string[] = []
      i += 1
      while (i < lines.length && !isFence(lines[i] ?? '')) {
        body.push(lines[i] ?? '')
        i += 1
      }
      i += 1
      html.push(`<pre><code data-lang="${escapeHtml(lang)}">${escapeHtml(body.join('\n'))}</code></pre>`)
      continue
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/)
    if (heading) {
      flushList()
      const level = heading[1]?.length ?? 1
      html.push(`<h${level}>${renderInline(heading[2] ?? '')}</h${level}>`)
      i += 1
      continue
    }

    if (isHr(line)) {
      flushList()
      html.push('<hr />')
      i += 1
      continue
    }

    if (isQuote(line)) {
      flushList()
      const parts: string[] = []
      while (i < lines.length && isQuote(lines[i] ?? '')) {
        parts.push((lines[i] ?? '').replace(/^>\s?/, ''))
        i += 1
      }
      html.push(`<blockquote>${renderInline(parts.join(' '))}</blockquote>`)
      continue
    }

    const ul = line.match(/^\s*[-*+]\s+(.*)$/)
    if (ul) {
      if (!list || list.type !== 'ul') {
        flushList()
        list = { type: 'ul', items: [] }
      }
      list.items.push(ul[1] ?? '')
      i += 1
      continue
    }

    const ol = line.match(/^\s*\d+[.)]\s+(.*)$/)
    if (ol) {
      if (!list || list.type !== 'ol') {
        flushList()
        list = { type: 'ol', items: [] }
      }
      list.items.push(ol[1] ?? '')
      i += 1
      continue
    }

    if (isBlank(line)) {
      flushList()
      i += 1
      continue
    }

    flushList()
    const paragraph: string[] = [line]
    i += 1
    while (i < lines.length) {
      const next = lines[i] ?? ''
      if (
        isBlank(next) ||
        isHeading(next) ||
        isFence(next) ||
        isHr(next) ||
        isQuote(next) ||
        isUl(next) ||
        isOl(next)
      ) {
        break
      }
      paragraph.push(next)
      i += 1
    }
    html.push(`<p>${paragraph.map(renderInline).join('<br />')}</p>`)
  }

  flushList()
  return html.join('\n')
}

/** Strip Markdown syntax down to plain text (for excerpts and word counts). */
export function toPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[>*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export const wordCount = (markdown: string): number => {
  const text = toPlainText(markdown)
  return text ? text.split(/\s+/).length : 0
}
