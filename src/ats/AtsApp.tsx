import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
  FileUp,
  Gauge,
  Link2,
  ScanSearch,
  Sparkles,
  Trash2,
  XCircle,
} from 'lucide-react'
import { analyzeAts, formatAtsReport, SAMPLE_ATS_TEXT, type AtsStatus } from '../lib/ats'
import { downloadBlob, resumeHasContent, slug } from '../lib/helpers'
import { resumePlainText } from '../lib/match'
import { useResumeStore } from '../store/resumeStore'
import { toast } from '../lib/toast'
import { goHome } from '../home/navigation'
import { BRAND } from '../home/config'
import { readResumeFile } from './extract'

const DRAFT_KEY = 'ats-scanner-draft-v1'

interface Draft {
  text: string
  jobDescription: string
}

function loadDraft(): Draft {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Draft>
      return { text: parsed.text ?? '', jobDescription: parsed.jobDescription ?? '' }
    }
  } catch {
    // ignore corrupt drafts
  }
  return { text: '', jobDescription: '' }
}

const STATUS_META: Record<AtsStatus, { icon: typeof CheckCircle2; className: string }> = {
  pass: { icon: CheckCircle2, className: 'text-emerald-600' },
  warn: { icon: AlertTriangle, className: 'text-amber-600' },
  fail: { icon: XCircle, className: 'text-rose-600' },
}

const tone = (score: number): { bar: string; text: string } => {
  if (score >= 85) return { bar: 'bg-emerald-500', text: 'text-emerald-600' }
  if (score >= 70) return { bar: 'bg-lime-500', text: 'text-lime-600' }
  if (score >= 50) return { bar: 'bg-amber-500', text: 'text-amber-600' }
  return { bar: 'bg-rose-500', text: 'text-rose-600' }
}

function ScoreHeader({ report }: { report: ReturnType<typeof analyzeAts> }) {
  const colors = tone(report.score)
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full border-4 ${
            report.score >= 70
              ? 'border-emerald-200'
              : report.score >= 50
                ? 'border-amber-200'
                : 'border-rose-200'
          }`}
        >
          <span className={`text-2xl font-bold ${colors.text}`}>{report.score}</span>
          <span className="text-[10px] font-medium text-slate-400">/ 100</span>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-slate-800">ATS score: {report.grade}</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {report.wordCount} words · {report.issues.length} suggestion
            {report.issues.length === 1 ? '' : 's'} to review
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all ${colors.bar}`}
              style={{ width: `${report.score}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export function AtsApp() {
  const [draft] = useState(loadDraft)
  const [text, setText] = useState(draft.text)
  const [jobDescription, setJobDescription] = useState(draft.jobDescription)
  const fileRef = useRef<HTMLInputElement>(null)
  const resume = useResumeStore((s) => s.resume)

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ text, jobDescription }))
    } catch {
      // storage may be unavailable; scanning still works
    }
  }, [text, jobDescription])

  const report = useMemo(
    () => (text.trim() ? analyzeAts(text, jobDescription) : null),
    [text, jobDescription],
  )

  const wordTotal = text.trim() ? text.trim().split(/\s+/).length : 0

  const importFromCv = () => {
    if (!resumeHasContent(resume)) {
      toast.error('No saved CV found', { description: 'Build or import one in the CV Builder first.' })
      return
    }
    setText(resumePlainText(resume))
    toast.success('Imported from CV Builder')
  }

  const onFile = async (file: File) => {
    const outcome = await readResumeFile(file)
    if (!outcome.ok) {
      if (outcome.reason === 'unsupported') {
        toast.error('Unsupported file', {
          description: 'Upload PDF, DOCX, TXT, MD, JSON or HTML — or paste the text.',
        })
      } else if (outcome.reason === 'empty') {
        toast.error('No text found', {
          description: 'This file looks scanned or empty. Try pasting the text instead.',
        })
      } else {
        toast.error('Couldn’t read that file')
      }
      return
    }
    setText(outcome.text)
    toast.success(`Loaded ${file.name}`)
  }

  const loadExample = () => {
    setText(SAMPLE_ATS_TEXT)
    toast.success('Example résumé loaded')
  }

  const clearAll = () => {
    toast.confirm({
      message: 'Clear the scanner?',
      description: 'Your pasted résumé and job description will be removed.',
      confirmLabel: 'Clear',
      tone: 'error',
      onConfirm: () => {
        setText('')
        setJobDescription('')
      },
    })
  }

  const downloadReport = () => {
    if (!report) return
    const name = text.split(/\r?\n/).map((line) => line.trim()).find(Boolean) ?? 'resume'
    downloadBlob(
      new Blob([formatAtsReport(report)], { type: 'text/plain' }),
      `${slug(name)}-ats-report.txt`,
    )
    toast.success('Report downloaded')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5">
          <button
            type="button"
            aria-label={`Go to ${BRAND} home`}
            title="All tools"
            onClick={() => goHome()}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <ArrowLeft size={15} />
          </button>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <ScanSearch size={16} />
          </span>
          <div className="mr-auto min-w-0">
            <h1 className="truncate text-sm font-semibold text-slate-800">ATS Scanner</h1>
            <p className="hidden truncate text-[11px] text-slate-400 sm:block">
              Check how well your CV passes applicant tracking systems.
            </p>
          </div>
          <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-600 sm:inline-flex">
            <Sparkles size={12} />
            Runs locally
          </span>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="flex flex-col gap-4">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="mr-auto flex items-center gap-2 text-sm font-semibold text-slate-800">
                <FileText size={16} className="text-indigo-600" />
                Your résumé
              </h2>
              <button
                type="button"
                onClick={importFromCv}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                <Link2 size={14} />
                Import from CV Builder
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                <FileUp size={14} />
                Upload
              </button>
              <button
                type="button"
                onClick={loadExample}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                <Sparkles size={14} />
                Example
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                <Trash2 size={14} />
                Clear
              </button>
            </div>

            <textarea
              aria-label="Résumé text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Paste your résumé text here, upload a file, or import from the CV Builder…"
              className="mt-3 min-h-[280px] w-full resize-y rounded-lg border border-slate-300 bg-slate-50 p-3 font-mono text-xs leading-relaxed text-slate-700 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            <p className="mt-1.5 text-[11px] text-slate-400">
              {wordTotal} word{wordTotal === 1 ? '' : 's'} · PDF, DOCX, TXT — or just paste
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Gauge size={16} className="text-indigo-600" />
              Job description
              <span className="font-normal text-slate-400">(optional)</span>
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Add a job post to check keyword coverage against your résumé.
            </p>
            <textarea
              aria-label="Job description"
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder="Paste the job description here…"
              className="mt-3 min-h-[120px] w-full resize-y rounded-lg border border-slate-300 bg-slate-50 p-3 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </section>

          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx,.txt,.md,.markdown,.html,.htm,.json,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown,application/json,text/html"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void onFile(file)
              event.target.value = ''
            }}
          />
        </div>

        <div className="flex flex-col gap-4">
          {!report ? (
            <section className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <ScanSearch size={24} />
              </span>
              <h2 className="text-sm font-semibold text-slate-800">Ready to scan</h2>
              <p className="max-w-xs text-xs leading-relaxed text-slate-500">
                Paste your résumé (or import it) and the ATS report appears here instantly —
                contact details, sections, action verbs, metrics, formatting, and keyword match.
              </p>
            </section>
          ) : (
            <>
              <ScoreHeader report={report} />

              <button
                type="button"
                onClick={downloadReport}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <Download size={14} />
                Download report
              </button>

              {report.keywords ? (
                <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-800">Keyword match</h2>
                    <span className={`text-sm font-bold ${tone(report.keywords.score).text}`}>
                      {report.keywords.score}%
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Where you land against the job description.
                  </p>
                  <p className="mt-3 text-xs font-semibold text-emerald-600">Matched</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {report.keywords.matched.length === 0 ? (
                      <span className="text-xs text-slate-400">None yet</span>
                    ) : (
                      report.keywords.matched.map((keyword) => (
                        <span
                          key={`m-${keyword}`}
                          className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700"
                        >
                          {keyword}
                        </span>
                      ))
                    )}
                  </div>
                  <p className="mt-3 text-xs font-semibold text-amber-600">Missing</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {report.keywords.missing.length === 0 ? (
                      <span className="text-xs text-slate-400">All covered</span>
                    ) : (
                      report.keywords.missing.map((keyword) => (
                        <span
                          key={`x-${keyword}`}
                          className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700"
                        >
                          {keyword}
                        </span>
                      ))
                    )}
                  </div>
                </section>
              ) : null}

              {report.categories.map((category) => {
                const colors = tone(category.score)
                return (
                  <section
                    key={category.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-slate-800">{category.label}</h2>
                      <span className={`text-sm font-bold ${colors.text}`}>{category.score}%</span>
                    </div>
                    <ul className="mt-3 flex flex-col gap-2">
                      {category.checks.map((item) => {
                        const meta = STATUS_META[item.status]
                        const Icon = meta.icon
                        return (
                          <li key={item.id} className="flex items-start gap-2">
                            <Icon size={15} className={`mt-0.5 shrink-0 ${meta.className}`} />
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-slate-700">{item.label}</p>
                              <p className="text-[11px] text-slate-500">{item.detail}</p>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </section>
                )
              })}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default AtsApp
