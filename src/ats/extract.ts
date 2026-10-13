import { bundleSchema, resumeSchema } from '../lib/schema'
import { resumePlainText } from '../lib/match'

export type ResumeFileKind = 'text' | 'json' | 'html' | 'pdf' | 'docx'

export function fileKind(name: string, type = ''): ResumeFileKind | null {
  const lower = name.toLowerCase()
  if (lower.endsWith('.pdf') || type === 'application/pdf') return 'pdf'
  if (lower.endsWith('.docx') || type.includes('wordprocessingml.document')) return 'docx'
  if (lower.endsWith('.json') || type === 'application/json') return 'json'
  if (/\.html?$/.test(lower) || type === 'text/html') return 'html'
  if (/\.(txt|md|markdown|text)$/.test(lower) || type.startsWith('text/')) return 'text'
  return null
}

export function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<\/(p|div|h[1-6]|li|tr|section|article|header|footer)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function jsonToPlainText(raw: string): string | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  const bundle = bundleSchema.safeParse(parsed)
  if (bundle.success) return resumePlainText(bundle.data.resume)
  const single = resumeSchema.safeParse(parsed)
  if (single.success) return resumePlainText(single.data)
  return null
}

export async function extractPdfText(data: ArrayBuffer): Promise<string> {
  const pdfjs = await import('pdfjs-dist')
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

  const loadingTask = pdfjs.getDocument({ data })
  const doc = await loadingTask.promise
  try {
    const pages: string[] = []
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
      const page = await doc.getPage(pageNumber)
      const content = await page.getTextContent()
      const line = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ')
      pages.push(line)
    }
    return pages.join('\n\n')
  } finally {
    await loadingTask.destroy()
  }
}

export async function extractDocxText(data: ArrayBuffer): Promise<string> {
  const mammoth = await import('mammoth')
  const result = await mammoth.extractRawText({ arrayBuffer: data })
  return result.value
}

export type ExtractOutcome =
  | { ok: true; text: string; kind: ResumeFileKind }
  | { ok: false; reason: 'unsupported' | 'empty' | 'error' }

export async function readResumeFile(file: File): Promise<ExtractOutcome> {
  const kind = fileKind(file.name, file.type)
  if (!kind) return { ok: false, reason: 'unsupported' }

  try {
    let text = ''
    if (kind === 'pdf') {
      text = await extractPdfText(await file.arrayBuffer())
    } else if (kind === 'docx') {
      text = await extractDocxText(await file.arrayBuffer())
    } else {
      const raw = await file.text()
      if (kind === 'json') text = jsonToPlainText(raw) ?? raw
      else if (kind === 'html') text = stripHtml(raw)
      else text = raw
    }

    if (!text.trim()) return { ok: false, reason: 'empty' }
    return { ok: true, text, kind }
  } catch {
    return { ok: false, reason: 'error' }
  }
}
