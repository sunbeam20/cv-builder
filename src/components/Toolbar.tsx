import { useRef, useState } from 'react'
import type { RefObject } from 'react'
import { FileText, FileType, Image, Printer, RotateCcw, Sparkles, Upload } from 'lucide-react'
import { useResumeStore } from '../store/resumeStore'
import { resumeSchema } from '../lib/schema'
import { TEMPLATES, TEMPLATE_LIST, isTemplateId } from '../lib/templates'

type Busy = 'pdf' | 'docx' | 'png' | null

const buttonBase =
  'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60'

interface ToolbarProps {
  pageRef: RefObject<HTMLDivElement | null>
}

export function Toolbar({ pageRef }: ToolbarProps) {
  const resume = useResumeStore((s) => s.resume)
  const template = useResumeStore((s) => s.template)
  const setTemplate = useResumeStore((s) => s.setTemplate)
  const replace = useResumeStore((s) => s.replace)
  const loadSample = useResumeStore((s) => s.loadSample)
  const reset = useResumeStore((s) => s.reset)
  const [busy, setBusy] = useState<Busy>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const theme = TEMPLATES[template]

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
      const parsed = resumeSchema.parse(JSON.parse(await file.text()))
      replace(parsed)
    } catch {
      setError('Invalid CV file')
    }
  }

  const handleReset = () => {
    if (window.confirm('Clear all CV data? This cannot be undone.')) reset()
  }

  return (
    <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur no-print">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-2 px-4 py-2.5">
        <div className="mr-auto flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-800">CV Builder</span>
          <span className="hidden rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 sm:inline">
            ATS-friendly
          </span>
          <select
            aria-label="Template"
            value={template}
            onChange={(e) => {
              if (isTemplateId(e.target.value)) setTemplate(e.target.value)
            }}
            className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-600 outline-none hover:bg-slate-50 focus:border-indigo-500"
          >
            {TEMPLATE_LIST.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className={`${buttonBase} bg-indigo-600 text-white hover:bg-indigo-700`}
          disabled={busy !== null}
          onClick={() =>
            run('pdf', async () => {
              const { exportPdf } = await import('../export/exportPdf')
              await exportPdf(resume, theme)
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
              const { exportDocx } = await import('../export/exportDocx')
              await exportDocx(resume, theme)
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
              await exportPng(node, resume.profile.fullName)
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
