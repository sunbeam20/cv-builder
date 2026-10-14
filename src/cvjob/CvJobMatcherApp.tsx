import { useMemo, useState } from 'react'
import { Save, Target, Trash2 } from 'lucide-react'
import { ToolHeader } from '../components/ui/ToolHeader'
import { toast } from '../lib/toast'
import { useResumeStore } from '../store/resumeStore'
import { useMatcherStore } from './store'
import { analyseResume, parseExtraKeywords, type AnalysisReport } from './model'

const inputClass =
  'w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-2 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500'

const toneClasses: Record<string, string> = {
  low: 'text-red-600 dark:text-red-400',
  medium: 'text-amber-600 dark:text-amber-400',
  high: 'text-emerald-600 dark:text-emerald-400',
}

export function CvJobMatcherApp() {
  const resume = useResumeStore((s) => s.resume)
  const loadSample = useResumeStore((s) => s.loadSample)
  const jobDescription = useMatcherStore((s) => s.jobDescription)
  const setJobDescription = useMatcherStore((s) => s.setJobDescription)
  const history = useMatcherStore((s) => s.history)
  const saveAnalysis = useMatcherStore((s) => s.saveAnalysis)
  const removeAnalysis = useMatcherStore((s) => s.removeAnalysis)

  const [extra, setExtra] = useState('')
  const [label, setLabel] = useState('')
  const [report, setReport] = useState<AnalysisReport | null>(null)

  const wordCount = useMemo(
    () => (jobDescription.trim() ? jobDescription.trim().split(/\s+/).length : 0),
    [jobDescription],
  )

  const analyse = () => {
    if (!jobDescription.trim()) {
      toast.error('Paste a job description first')
      return
    }
    setReport(analyseResume(resume, jobDescription, parseExtraKeywords(extra)))
  }

  const save = () => {
    if (!report) return
    saveAnalysis({
      label: label.trim() || resume.profile.headline || 'Untitled analysis',
      score: report.score,
      matched: report.matched,
      missing: report.missing,
    })
    setLabel('')
    toast.success('Analysis saved')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800">
      <ToolHeader icon={Target} title="CV ↔ Job Matcher" subtitle="Score your CV against a job description and spot keyword gaps." />

      <main className="mx-auto grid max-w-5xl gap-4 px-4 py-6 lg:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Job description</span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">{wordCount} words</span>
          </div>
          <textarea
            aria-label="Job description"
            rows={12}
            className={`${inputClass} resize-y`}
            placeholder="Paste the job posting here…"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            Extra keywords (comma or newline separated)
            <input aria-label="Extra keywords" className={inputClass} value={extra} onChange={(e) => setExtra(e.target.value)} />
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={analyse}
              className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Analyse match
            </button>
            <button
              type="button"
              onClick={loadSample}
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Load sample CV
            </button>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Analysing: {resume.profile.fullName || 'empty CV'} · {resume.skills.reduce((n, g) => n + g.items.length, 0)} skills
          </p>
        </section>

        <section className="flex flex-col gap-4">
          {report ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div
                  aria-label="Match score"
                  className={`grid h-20 w-20 shrink-0 place-items-center rounded-full border-4 ${
                    report.band.tone === 'high'
                      ? 'border-emerald-200'
                      : report.band.tone === 'medium'
                        ? 'border-amber-200'
                        : 'border-red-200'
                  }`}
                >
                  <span className={`text-2xl font-bold ${toneClasses[report.band.tone]}`}>{report.score}%</span>
                </div>
                <div>
                  <p className={`text-sm font-semibold ${toneClasses[report.band.tone]}`}>{report.band.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{report.band.advice}</p>
                  <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                    {report.matched.length} of {report.keywords.length} keywords covered
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Save this analysis</span>
                  <button
                    type="button"
                    onClick={save}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                  >
                    <Save size={13} /> Save
                  </button>
                </div>
                <input
                  aria-label="Analysis label"
                  className={inputClass}
                  placeholder="e.g. Senior Product Designer @ Acme"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">Matched</p>
                  <div className="flex flex-wrap gap-1">
                    {report.matched.map((keyword) => (
                      <span key={keyword} className="rounded-full bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 text-[11px] text-emerald-700">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-red-500">Missing</p>
                  <div className="flex flex-wrap gap-1">
                    {report.missing.map((keyword) => (
                      <span key={keyword} className="rounded-full bg-red-50 dark:bg-red-950 px-2 py-0.5 text-[11px] text-red-600 dark:text-red-400">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-8 text-center text-sm text-slate-400 dark:text-slate-500">
              Paste a job description and hit analyse.
            </p>
          )}

          {history.length > 0 ? (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">History</span>
              {history.map((item) => (
                <div key={item.id} className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm">
                  <span className={`w-10 shrink-0 text-center font-semibold ${toneClasses[scoreBandTone(item.score)]}`}>
                    {item.score}%
                  </span>
                  <span className="flex-1 truncate text-slate-700 dark:text-slate-200">{item.label}</span>
                  <button
                    type="button"
                    aria-label="Delete analysis"
                    onClick={() => removeAnalysis(item.id)}
                    className="text-slate-400 dark:text-slate-500 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  )
}

function scoreBandTone(score: number): string {
  return score >= 75 ? 'high' : score >= 45 ? 'medium' : 'low'
}

export default CvJobMatcherApp
