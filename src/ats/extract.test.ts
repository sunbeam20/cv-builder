import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fileKind, jsonToPlainText, readResumeFile, stripHtml } from './extract'
import { sampleResume } from '../lib/sampleData'

const h = vi.hoisted(() => {
  const getPage = async (pageNumber: number) => ({
    getTextContent: async () => ({ items: [{ str: `Page ${pageNumber}` }, { str: 'body' }] }),
  })
  const doc = { numPages: 2, getPage }
  const destroy = vi.fn(async () => {})
  return { doc, destroy }
})

vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: {} as { workerSrc?: string },
  getDocument: vi.fn(() => ({ promise: Promise.resolve(h.doc), destroy: h.destroy })),
}))

vi.mock('pdfjs-dist/build/pdf.worker.min.mjs?url', () => ({ default: '/assets/pdf.worker.mjs' }))

vi.mock('mammoth', () => ({
  extractRawText: vi.fn(async () => ({ value: 'DOCX body text' })),
}))

const pdfFile = (): File =>
  ({
    name: 'resume.pdf',
    type: 'application/pdf',
    arrayBuffer: async () => new ArrayBuffer(8),
  }) as unknown as File

beforeEach(() => {
  h.destroy.mockClear()
})

describe('fileKind', () => {
  it('detects kinds by extension', () => {
    expect(fileKind('cv.pdf')).toBe('pdf')
    expect(fileKind('cv.docx')).toBe('docx')
    expect(fileKind('cv.txt')).toBe('text')
    expect(fileKind('cv.md')).toBe('text')
    expect(fileKind('cv.json')).toBe('json')
    expect(fileKind('cv.html')).toBe('html')
  })

  it('falls back to MIME types', () => {
    expect(fileKind('resume', 'application/pdf')).toBe('pdf')
    expect(fileKind('resume', 'text/plain')).toBe('text')
    expect(fileKind('photo.png', 'image/png')).toBeNull()
    expect(fileKind('cv.doc')).toBeNull()
  })
})

describe('stripHtml', () => {
  it('removes tags, keeps block breaks, and decodes entities', () => {
    const html = '<h1>Jane Doe</h1><p>Engineer &amp; writer</p><ul><li>One</li><li>Two</li></ul>'
    const text = stripHtml(html)
    expect(text).toContain('Jane Doe')
    expect(text).toContain('Engineer & writer')
    expect(text).toContain('One')
    expect(text).not.toContain('<')
  })
})

describe('jsonToPlainText', () => {
  it('reads a full bundle export', () => {
    const bundle = { resume: sampleResume(), template: 'classic' }
    expect(jsonToPlainText(JSON.stringify(bundle))).toContain('Jordan Avery')
  })

  it('reads a bare resume export', () => {
    expect(jsonToPlainText(JSON.stringify(sampleResume()))).toContain('Jordan Avery')
  })

  it('returns null for unrelated JSON', () => {
    expect(jsonToPlainText('{"hello":"world"}')).toBeNull()
    expect(jsonToPlainText('not json')).toBeNull()
  })
})

describe('readResumeFile', () => {
  it('reads plain text', async () => {
    const file = new File(['Alex Doe\nEngineer'], 'cv.txt', { type: 'text/plain' })
    const outcome = await readResumeFile(file)
    expect(outcome).toEqual({ ok: true, text: 'Alex Doe\nEngineer', kind: 'text' })
  })

  it('parses an exported bundle JSON', async () => {
    const file = new File([JSON.stringify(sampleResume())], 'cv.json', { type: 'application/json' })
    const outcome = await readResumeFile(file)
    expect(outcome.ok).toBe(true)
  })

  it('extracts text from HTML', async () => {
    const file = new File(['<p>Hello <b>world</b></p>'], 'cv.html', { type: 'text/html' })
    const outcome = await readResumeFile(file)
    expect(outcome.ok && outcome.text).toContain('Hello world')
  })

  it('extracts text from a PDF', async () => {
    const outcome = await readResumeFile(pdfFile())
    expect(outcome).toEqual({ ok: true, text: 'Page 1 body\n\nPage 2 body', kind: 'pdf' })
    expect(h.destroy).toHaveBeenCalled()
  })

  it('extracts text from a DOCX', async () => {
    const file = {
      name: 'cv.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      arrayBuffer: async () => new ArrayBuffer(8),
    } as unknown as File
    const outcome = await readResumeFile(file)
    expect(outcome).toEqual({ ok: true, text: 'DOCX body text', kind: 'docx' })
  })

  it('rejects unsupported files', async () => {
    const file = new File(['x'], 'photo.png', { type: 'image/png' })
    expect(await readResumeFile(file)).toEqual({ ok: false, reason: 'unsupported' })
  })

  it('reports empty text', async () => {
    const file = new File(['   \n  '], 'cv.txt', { type: 'text/plain' })
    expect(await readResumeFile(file)).toEqual({ ok: false, reason: 'empty' })
  })

  it('reports read errors', async () => {
    const file = {
      name: 'cv.pdf',
      type: 'application/pdf',
      arrayBuffer: async () => {
        throw new Error('boom')
      },
    } as unknown as File
    expect(await readResumeFile(file)).toEqual({ ok: false, reason: 'error' })
  })
})
