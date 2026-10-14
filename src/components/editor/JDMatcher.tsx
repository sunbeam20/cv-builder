import { useMemo, useState } from 'react'
import { CheckCircle2, Circle, ClipboardList, PlusCircle, Sparkles } from 'lucide-react'
import { useResumeStore } from '../../store/resumeStore'
import { matchResumeToJob } from '../../lib/match'
import { uid } from '../../lib/helpers'

const tone = (score: number): { bar: string; text: string } => {
  if (score >= 75) return { bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' }
  if (score >= 40) return { bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' }
  return { bar: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400' }
}

export function JDMatcher() {
  const resume = useResumeStore((s) => s.resume)
  const update = useResumeStore((s) => s.update)
  const [jobDescription, setJobDescription] = useState('')
  const [extra, setExtra] = useState('')

  const report = useMemo(() => {
    if (!jobDescription.trim() && !extra.trim()) return null
    const extras = extra
      .split(/[,\s]+/)
      .map((value) => value.trim())
      .filter(Boolean)
    return matchResumeToJob(resume, jobDescription, extras)
  }, [resume, jobDescription, extra])

  const colors = report ? tone(report.score) : null

  const copyMissing = () => {
    if (!report || report.missing.length === 0) return
    navigator.clipboard?.writeText(report.missing.join(', '))
  }

  const addToSkills = () => {
    if (!report || report.missing.length === 0) return
    update((draft) => {
      const existing = new Set(draft.skills.flatMap((group) => group.items.map((item) => item.toLowerCase())))
      const fresh = report.missing.filter((keyword) => !existing.has(keyword.toLowerCase())).slice(0, 20)
      if (fresh.length === 0) return
      const group = draft.skills.find((entry) => entry.category === 'Job keywords')
      if (group) group.items.push(...fresh)
      else draft.skills.push({ id: uid(), category: 'Job keywords', items: fresh })
    })
  }

  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
        <ClipboardList size={16} className="text-indigo-600 dark:text-indigo-400" />
        Job match
      </div>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Paste a job description to see which keywords your résumé already covers.
      </p>

      <textarea
        aria-label="Job description"
        value={jobDescription}
        onChange={(event) => setJobDescription(event.target.value)}
        placeholder="Paste the job description here…"
        className="mt-3 min-h-[96px] w-full resize-y rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />

      <input
        aria-label="Extra keywords"
        value={extra}
        onChange={(event) => setExtra(event.target.value)}
        placeholder="Optional extra keywords (comma separated)"
        className="mt-2 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />

      {!report && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <Sparkles size={14} />
          The analysis appears here as you type.
        </p>
      )}

      {report && colors && (
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {report.matched.length} covered · {report.missing.length} missing
            </span>
            <span className={`text-sm font-bold ${colors.text}`}>{report.score}%</span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={`h-full rounded-full transition-all ${colors.bar}`}
              style={{ width: `${report.score}%` }}
            />
          </div>

          <p className="mt-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400">Found in your résumé</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {report.matched.length === 0 ? (
              <span className="text-xs text-slate-400 dark:text-slate-500">None yet</span>
            ) : (
              report.matched.map((keyword) => (
                <span
                  key={`matched-${keyword}`}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 text-[11px] font-medium text-emerald-700"
                >
                  <CheckCircle2 size={11} />
                  {keyword}
                </span>
              ))
            )}
          </div>

          <p className="mt-3 text-xs font-semibold text-amber-600 dark:text-amber-400">Not found — consider adding</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {report.missing.length === 0 ? (
              <span className="text-xs text-slate-400 dark:text-slate-500">All keywords covered</span>
            ) : (
              report.missing.map((keyword) => (
                <span
                  key={`missing-${keyword}`}
                  className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950 px-2 py-0.5 text-[11px] font-medium text-amber-700"
                >
                  <Circle size={11} />
                  {keyword}
                </span>
              ))
            )}
          </div>

          {report.missing.length > 0 && (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={copyMissing}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <ClipboardList size={14} />
                Copy missing
              </button>
              <button
                type="button"
                onClick={addToSkills}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700"
              >
                <PlusCircle size={14} />
                Add missing to skills
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}