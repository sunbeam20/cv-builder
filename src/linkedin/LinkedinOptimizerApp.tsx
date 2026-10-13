import { useMemo, useState } from 'react'
import { BadgeCheck, Check, Copy, X } from 'lucide-react'
import { ToolHeader } from '../components/ui/ToolHeader'
import { toast } from '../lib/toast'
import { ABOUT_MIN, analyseProfile, emptyProfile, headlineLeft, type LinkedinProfile } from './model'

const inputClass =
  'w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500'

export function LinkedinOptimizerApp() {
  const [profile, setProfile] = useState<LinkedinProfile>(emptyProfile)

  const report = useMemo(() => analyseProfile(profile), [profile])
  const remaining = headlineLeft(profile.headline)

  const patch = (updater: Partial<LinkedinProfile>) => setProfile((prev) => ({ ...prev, ...updater }))

  const headlineSuggestion = () => {
    const keywords = report.keywords.slice(0, 3)
    patch({
      headline: `I help teams ship ${keywords[0] ?? 'great products'} · ${keywords.slice(1).join(' · ') || 'Builder'} · Open to new roles`,
    })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ToolHeader icon={BadgeCheck} title="LinkedIn Optimizer" subtitle="Score your headline, about section and skills for recruiter search." />

      <main className="mx-auto grid max-w-5xl gap-4 px-4 py-6 lg:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            <span className="flex items-center justify-between">
              Headline
              <span className={remaining < 0 ? 'text-red-500' : 'text-slate-400'}>{remaining} left</span>
            </span>
            <input
              aria-label="Headline"
              className={inputClass}
              placeholder="Senior Product Designer · Fintech · Design systems"
              value={profile.headline}
              onChange={(e) => patch({ headline: e.target.value })}
            />
          </label>
          <button
            type="button"
            onClick={headlineSuggestion}
            className="self-start rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50"
          >
            Suggest headline
          </button>

          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            <span className="flex items-center justify-between">
              About
              <span className={profile.about.trim().length < ABOUT_MIN ? 'text-amber-500' : 'text-emerald-600'}>
                {profile.about.trim().length}/{ABOUT_MIN}
              </span>
            </span>
            <textarea
              aria-label="About"
              rows={10}
              className={`${inputClass} resize-y`}
              placeholder="I'm a designer who turns messy problems into simple products…"
              value={profile.about}
              onChange={(e) => patch({ about: e.target.value })}
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Skills (comma or newline separated)
            <textarea
              aria-label="Skills"
              rows={3}
              className={`${inputClass} resize-y`}
              placeholder="Figma, Design systems, User research"
              value={profile.skills}
              onChange={(e) => patch({ skills: e.target.value })}
            />
          </label>
        </section>

        <section className="flex flex-col gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800">Profile score</span>
              <span aria-label="Profile score" className="text-2xl font-bold text-indigo-600">
                {report.score}%
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-indigo-500" style={{ width: `${report.score}%` }} />
            </div>
            <ul className="mt-3 flex flex-col gap-2">
              {report.checks.map((check) => (
                <li key={check.id} className="flex items-start gap-2 text-sm">
                  <span className={check.pass ? 'mt-0.5 text-emerald-500' : 'mt-0.5 text-red-400'}>
                    {check.pass ? <Check size={15} /> : <X size={15} />}
                  </span>
                  <span>
                    <span className={check.pass ? 'text-slate-700' : 'font-medium text-slate-800'}>{check.label}</span>
                    {!check.pass ? <span className="block text-xs text-slate-400">{check.hint}</span> : null}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Top keywords</span>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(report.keywords.join(', '))
                    toast.success('Keywords copied')
                  } catch {
                    toast.error('Clipboard unavailable')
                  }
                }}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600"
              >
                <Copy size={12} /> Copy
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {report.keywords.length ? (
                report.keywords.map((keyword) => (
                  <span key={keyword} className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] text-indigo-700">
                    {keyword}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">Add content to surface keywords.</span>
              )}
            </div>
            <p className="mt-3 text-[11px] text-slate-400">
              {report.verbs.length} action verbs · {report.quantified} measurable result(s)
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default LinkedinOptimizerApp
