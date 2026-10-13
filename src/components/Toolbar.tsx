import { useRef, useState } from 'react'
import type { RefObject } from 'react'
import {
  Download,
  FileText,
  FileType,
  Image,
  KeyRound,
  Printer,
  Redo2,
  RotateCcw,
  Sparkles,
  Undo2,
  Upload,
} from 'lucide-react'
import { useResumeStore } from '../store/resumeStore'
import { bundleSchema, resumeSchema } from '../lib/schema'
import { downloadBlob, slug } from '../lib/helpers'
import { TEMPLATES, isTemplateId } from '../lib/templates'
import { TemplatePicker } from './ui/TemplatePicker'

type Busy = 'pdf' | 'docx' | 'png' | null

const buttonBase =
  'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60'

const tabBase = 'rounded px-2.5 py-1 text-xs font-medium transition'

interface ToolbarProps {
  pageRef: RefObject<HTMLDivElement | null>
}

export function Toolbar({ pageRef }: ToolbarProps) {
  const resume = useResumeStore((s) => s.resume)
  const coverLetter = useResumeStore((s) => s.coverLetter)
  const template = useResumeStore((s) => s.template)
  const docType = useResumeStore((s) => s.docType)
  const setDocType = useResumeStore((s) => s.setDocType)
  const setTemplate = useResumeStore((s) => s.setTemplate)
  const replace = useResumeStore((s) => s.replace)
  const setCoverLetter = useResumeStore((s) => s.setCoverLetter)
  const loadSample = useResumeStore((s) => s.loadSample)
  const reset = useResumeStore((s) => s.reset)
  const openAiSettings = useResumeStore((s) => s.openAiSettings)
  const undo = useResumeStore((s) => s.undo)
  const redo = useResumeStore((s) => s.redo)
  const canUndo = useResumeStore((s) => s.past.length > 0)
  const canRedo = useResumeStore((s) => s.future.length > 0)
  const [busy, setBusy] = useState<Busy>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const theme = TEMPLATES[template]
  const isCover = docType === 'cover'

  const run = async (kind: Busy, fn: () => Promise<void>) => {
    setError(null)
    setBusy(kind)
    try {
      await fn()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setBusy(null)
    }
  }

  const handleImport = async (file: File) => {
    setError(null)
    try {
      const raw = JSON.parse(await file.text())
      const bundle = bundleSchema.safeParse(raw)
      if (bundle.success) {
        replace(bundle.data.resume)
        if (bundle.data.coverLetter) setCoverLetter(bundle.data.coverLetter)
        if (bundle.data.template && isTemplateId(bundle.data.template)) {
          setTemplate(bundle.data.template)
        }
      } else {
        replace(resumeSchema.parse(raw))
      }
    } catch {
      setError('Invalid CV file')
    }
  }

  const handleReset = () => {
    if (window.confirm('Clear all CV data? This cannot be undone.')) reset()
  }

  const handleExportJson = () => {
    const json = JSON.stringify({ resume, coverLetter, template }, null, 2)
    downloadBlob(
      new Blob([json], { type: 'application/json' }),
      `${slug(resume.profile.fullName)}.json`,
    )
  }

  return (
    <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur no-print">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-2 px-4 py-2.5">
        <div className="mr-auto flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-800">CV Builder</span>
          <div className="flex rounded-md border border-slate-200 p-0.5">
            <button
              type="button"
              onClick={() => setDocType('resume')}
              className={`${tabBase} ${
                isCover ? 'text-slate-500 hover:bg-slate-50' : 'bg-indigo-600 text-white'
              }`}
            >
              Résumé
            </button>
            <button
              type="button"
              onClick={() => setDocType('cover')}
              className={`${tabBase} ${
                isCover ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              Cover letter
            </button>
          </div>
          <TemplatePicker />
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Undo"
              title="Undo (Ctrl+Z)"
              onClick={undo}
              disabled={!canUndo}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Undo2 size={15} />
            </button>
            <button
              type="button"
              aria-label="Redo"
              title="Redo (Ctrl+Shift+Z)"
              onClick={redo}
              disabled={!canRedo}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Redo2 size={15} />
            </button>
          </div>
        </div>

        <button
          type="button"
          className={`${buttonBase} bg-indigo-600 text-white hover:bg-indigo-700`}
          disabled={busy !== null}
          onClick={() =>
            run('pdf', async () => {
              if (isCover) {
                const { exportCoverLetterPdf } = await import('../export/exportCoverLetterPdf')
                await exportCoverLetterPdf(coverLetter, resume.profile, theme)
              } else {
                const { exportPdf } = await import('../export/exportPdf')
                await exportPdf(resume, theme)
              }
            })
          }
        >
          <FileText size={15} />
          {busy === 'pdf' ? 'Exporting…' : 'PDF'}
        </button>
        <button
          type="button"
          className={`${buttonBase} bg-slate-800 text-white hover:bg-slate-900`}
          disabled={busy !== null}
          onClick={() =>
            run('docx', async () => {
              if (isCover) {
                const { exportCoverLetterDocx } = await import('../export/exportCoverLetterDocx')
                await exportCoverLetterDocx(coverLetter, resume.profile, theme)
              } else {
                const { exportDocx } = await import('../export/exportDocx')
                await exportDocx(resume, theme)
              }
            })
          }
        >
          <FileType size={15} />
          {busy === 'docx' ? 'Exporting…' : 'DOCX'}
        </button>
        <button
          type="button"
          className={`${buttonBase} bg-slate-800 text-white hover:bg-slate-900`}
          disabled={busy !== null}
          onClick={() =>
            run('png', async () => {
              const node = pageRef.current
              if (!node) return
              const { exportPng } = await import('../export/exportPng')
              await exportPng(node, resume.profile.fullName, isCover ? 'Cover_Letter' : 'CV')
            })
          }
        >
          <Image size={15} />
          {busy === 'png' ? 'Exporting…' : 'PNG'}
        </button>

        <span className="mx-1 hidden h-5 w-px bg-slate-200 sm:block" />

        <button
          type="button"
          className={`${buttonBase} border border-slate-200 text-slate-600 hover:bg-slate-50`}
          onClick={() => window.print()}
        >
          <Printer size={15} />
          Print
        </button>
        <button
          type="button"
          className={`${buttonBase} border border-slate-200 text-slate-600 hover:bg-slate-50`}
          onClick={() => fileRef.current?.click()}
        >
          <Upload size={15} />
          Import
        </button>
        <button
          type="button"
          className={`${buttonBase} border border-slate-200 text-slate-600 hover:bg-slate-50`}
          onClick={handleExportJson}
        >
          <Download size={15} />
          JSON
        </button>
        <button
          type="button"
          className={`${buttonBase} border border-slate-200 text-slate-600 hover:bg-slate-50`}
          onClick={openAiSettings}
        >
          <KeyRound size={15} />
          AI
        </button>
        <button
          type="button"
          className={`${buttonBase} border border-slate-200 text-slate-600 hover:bg-slate-50`}
          onClick={loadSample}
        >
          <Sparkles size={15} />
          Sample
        </button>
        <button
          type="button"
          className={`${buttonBase} border border-slate-200 text-red-600 hover:bg-red-50`}
          onClick={handleReset}
        >
          <RotateCcw size={15} />
          Reset
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleImport(file)
            e.target.value = ''
          }}
        />
      </div>
      {error ? (
        <div className="border-t border-red-100 bg-red-50 px-4 py-1.5 text-center text-xs text-red-600">
          {error}
        </div>
      ) : null}
    </div>
  )
}
