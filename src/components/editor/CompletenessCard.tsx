import { CheckCircle2, Circle, TrendingUp } from 'lucide-react'
import { useResumeStore } from '../../store/resumeStore'
import { analyzeResume } from '../../lib/completeness'
import { scrollToSection } from '../../lib/helpers'

const tone = (score: number): { bar: string; text: string } => {
  if (score >= 80) return { bar: 'bg-emerald-500', text: 'text-emerald-600' }
  if (score >= 50) return { bar: 'bg-amber-500', text: 'text-amber-600' }
  return { bar: 'bg-rose-500', text: 'text-rose-600' }
}

const ANCHOR_FOR_CHECK: Record<string, string> = {
  name: 'section-profile',
  headline: 'section-profile',
  email: 'section-profile',
  phone: 'section-profile',
  location: 'section-profile',
  links: 'section-profile',
  summary: 'section-profile',
  experience: 'section-experience',
  bullets: 'section-experience',
  quantified: 'section-experience',
  education: 'section-education',
  skills: 'section-skills',
  extras: 'section-projects',
}

export function CompletenessCard() {
  const resume = useResumeStore((s) => s.resume)
  const { score, missing } = analyzeResume(resume)
  const colors = tone(score)

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <TrendingUp size={16} className="text-indigo-600" />
          Résumé strength
        </h2>
        <span className={`text-sm font-bold ${colors.text}`}>{score}%</span>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all ${colors.bar}`}
          style={{ width: `${score}%` }}
        />
      </div>

      {missing.length === 0 ? (
        <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
          <CheckCircle2 size={14} />
          Looks great — nothing left to add.
        </p>
      ) : (
        <>
          <p className="mt-3 text-[11px] font-medium text-slate-400">
            Tap an item to jump to that section.
          </p>
          <ul className="mt-1.5 flex flex-col gap-1">
            {missing.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => scrollToSection(ANCHOR_FOR_CHECK[item.id] ?? 'section-profile')}
                  className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-xs text-slate-600 transition hover:bg-slate-50 hover:text-indigo-700"
                >
                  <Circle size={12} className="shrink-0 text-slate-300" />
                  <span className="flex-1">{item.label}</span>
                  <span className="text-slate-300">→</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}