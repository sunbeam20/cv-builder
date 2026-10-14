import { useMemo, useState } from 'react'
import { BadgeCheck, Check, Copy, X } from 'lucide-react'
import { ToolHeader } from '../components/ui/ToolHeader'
import { AiButton } from '../components/ui/AiButton'
import { toast } from '../lib/toast'
import { ABOUT_MIN, analyseProfile, emptyProfile, headlineLeft, type LinkedinProfile } from './model'

const inputClass =
  'w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-2 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500'

export function LinkedinOptimizerApp() {
  const [profile, setProfile] = useState<LinkedinProfile>(emptyProfile)
  const [review, setReview] = useState('')

  const report = useMemo(() => analyseProfile(profile), [profile])
  const remaining = headlineLeft(profile.headline)
  const reviewText = `Headline: ${profile.headline}\n\nAbout: ${profile.about}\n\nSkills: ${profile.skills}`

  const patch = (updater: Partial<LinkedinProfile>) => setProfile((prev) => ({ ...prev, ...updater }))

  const headlineSuggestion = () => {
    const keywords = report.keywords.slice(0, 3)
    patch({
      headline: `I help teams ship ${keywords[0] ?? 'great products'} · ${keywords.slice(1).join(' · ') || 'Builder'} · Open to new roles`,
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800">
      <ToolHeader icon={BadgeCheck} title="LinkedIn Optimizer" subtitle="Score your headline, about section and skills for recruiter search." />

      <main className="mx-auto grid max-w-5xl gap-4 px-4 py-6 lg:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <div className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            <span className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                Headline
                <AiButton
                  text={profile.headline}
                  onResult={(text) => patch({ headline: text })}
                  instruction="Rewrite this LinkedIn headline to be specific and compelling (max 220 characters), covering role, focus and proof."
                  context={profile.skills}
                  label="Improve"
                />
              </span>
              <span className={remaining < 0 ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}>{remaining} left</span>
            </span>
            <input
              aria-label="Headline"
              className={inputClass}
              placeholder="Senior Product Designer · Fintech · Design systems"
              value={profile.headline}
              onChange={(e) => patch({ headline: e.target.value })}
            />
          </div>
          <button
            type="button"
            onClick={headlineSuggestion}
            className="self-start rounded-full border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Suggest headline
          </button>

          <div className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            <span className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                About
                <AiButton
                  text={profile.about}
                  onResult={(text) => patch({ about: text })}
                  instruction="Rewrite this LinkedIn About section as a concise, first-person story with measurable results."
                  context={`${profile.headline} · ${profile.skills}`}
                  label="Improve"
                />
              </span>
              <span className={profile.about.trim().length < ABOUT_MIN ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}>
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
          </div>

          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
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
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Profile score</span>
              <span aria-label="Profile score" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {report.score}%
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full rounded-full bg-indigo-500" style={{ width: `${report.score}%` }} />
            </div>
            <ul className="mt-3 flex flex-col gap-2">
              {report.checks.map((check) => (
                <li key={check.id} className="flex items-start gap-2 text-sm">
                  <span className={check.pass ? 'mt-0.5 text-emerald-500' : 'mt-0.5 text-red-400'}>
                    {check.pass ? <Check size={15} /> : <X size={15} />}
                  </span>
                  <span>
                    <span className={check.pass ? 'text-slate-700 dark:text-slate-200' : 'font-medium text-slate-800 dark:text-slate-100'}>{check.label}</span>
                    {!check.pass ? <span className="block text-xs text-slate-400 dark:text-slate-500">{check.hint}</span> : null}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Top keywords</span>
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
                className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <Copy size={12} /> Copy
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {report.keywords.length ? (
                report.keywords.map((keyword) => (
                  <span key={keyword} className="rounded-full bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 text-[11px] text-indigo-700 dark:text-indigo-300">
                    {keyword}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 dark:text-slate-500">Add content to surface keywords.</span>
              )}
            </div>
            <p className="mt-3 text-[11px] text-slate-400 dark:text-slate-500">
              {report.verbs.length} action verbs · {report.quantified} measurable result(s)
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">AI review</span>
              <AiButton
                text={reviewText}
                onResult={setReview}
                instruction="Rewrite this LinkedIn profile into a polished recruiter-facing summary, then on a new line list three short, concrete suggestions to improve reach."
                context="LinkedIn profile optimisation"
                label="Review"
              />
            </div>
            {review ? (
              <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700 dark:text-slate-200">{review}</pre>
            ) : (
              <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
                Get an AI-written summary plus suggestions. Configure AI in settings to enable.
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default LinkedinOptimizerApp
