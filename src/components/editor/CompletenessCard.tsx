import { CheckCircle2, Circle, TrendingUp } from 'lucide-react'
import { useResumeStore } from '../../store/resumeStore'
import { analyzeResume } from '../../lib/completeness'

const tone = (score: number): { bar: string; text: string } => {
  if (score >= 80) return { bar: 'bg-emerald-500', text: 'text-emerald-600' }
  if (score >= 50) return { bar: 'bg-amber-500', text: 'text-amber-600' }
  return { bar: 'bg-rose-500', text: 'text-rose-600' }
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
        <ul className="mt-3 flex flex-col gap-1.5">
          {missing.map((item) => (
            <li key={item.id} className="flex items-start gap-2 text-xs text-slate-600">
              <Circle size={12} className="mt-0.5 shrink-0 text-slate-300" />
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
