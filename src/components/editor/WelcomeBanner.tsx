import { ArrowRight, FileText, PencilLine, Sparkles } from 'lucide-react'
import { useResumeStore } from '../../store/resumeStore'
import { resumeHasContent, scrollToSection } from '../../lib/helpers'

const TIPS = [
  'Start with your name and a target role — everything else builds on it.',
  'Add roles and let each highlight describe the impact you made.',
  'Use the template picker and Design panel to match the look you want.',
]

export function WelcomeBanner() {
  const resume = useResumeStore((s) => s.resume)
  const loadSample = useResumeStore((s) => s.loadSample)

  if (resumeHasContent(resume)) return null

  return (
    <section className="rounded-xl border border-indigo-100 dark:border-indigo-900 bg-gradient-to-br from-indigo-50 dark:from-indigo-950 to-white dark:to-slate-900 p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
        <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400" />
        Build your CV in a few minutes
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        Your work is saved automatically in this browser — no account needed. Fill in the form on
        the left and watch the page update live on the right.
      </p>

      <ul className="mt-3 flex flex-col gap-1.5">
        {TIPS.map((tip) => (
          <li key={tip} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-indigo-400" />
            {tip}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => scrollToSection('section-profile')}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-medium text-white transition hover:bg-indigo-700"
        >
          <PencilLine size={14} />
          Start with my details
        </button>
        <button
          type="button"
          onClick={() => loadSample()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <FileText size={14} />
          Load example data
          <ArrowRight size={13} />
        </button>
      </div>
    </section>
  )
}