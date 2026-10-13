import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useModalDismiss } from '../lib/useModalDismiss'
import { goHome } from '../home/navigation'
import { ToolMenu } from '../home/ToolMenu'
import { BRAND } from '../home/config'
import { toast } from '../lib/toast'
import { downloadBlob } from '../lib/helpers'
import { Field, IconButton, TextInput } from '../components/ui/inputs'
import {
  ACTIVITY_OPTIONS,
  BEVERAGE_IDS,
  CAFFEINE_CAP_MG,
  DEFAULT_QUICK_ML,
  beverageLabel,
  entriesCsv,
  evaluateChallenges,
  formatTime,
  formatVolume,
  goalCalculator,
  hydrationScore,
  insightsFor,
  loadEntries,
  loadTarget,
  loadUserGoal,
  newEntry,
  progressFor,
  saveEntries,
  saveTarget,
  saveUserGoal,
  smartReminderPolicy,
  VOLUME_UNIT_LABELS,
  type ActivityLevel,
  type ClimateFactor,
  type IntakeEntry,
  type PersistedTarget,
  type VolumeUnit,
} from './model'
import {
  ArrowLeft,
  BarChart3,
  Calculator,
  CheckCircle2,
  Circle,
  Citrus,
  ClipboardCopy,
  Coffee,
  CupSoda,
  Download,
  Droplets,
  Dumbbell,
  Leaf,
  Pencil,
  Plus,
  Trash2,
  Trophy,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const GOAL_MIN_ML = 500
const GOAL_MAX_ML = 10000
const AMOUNT_MIN_ML = 1
const AMOUNT_MAX_ML = 10000

const BEVERAGE_ICONS: Record<string, LucideIcon> = {
  water: Droplets,
  coffee: Coffee,
  tea: Leaf,
  juice: Citrus,
  soda: CupSoda,
  sports: Dumbbell,
}

const PRESETS_ML = [250, 330, 500, 1000]

const pluralDays = (current: number, best: number): string =>
  current === 1 ? `1 day · best ${best}` : `${current} days · best ${best}`

const pluralSparks = (count: number): string =>
  count === 1 ? '1 spark' : `${count} sparks`

function Card({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {children}
    </section>
  )
}

function Seg<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T
  options: { value: T; label: React.ReactNode }[]
  onChange: (value: T) => void
  label: string
}) {
  return (
    <Field label={label}>
      <div className="flex rounded-lg border border-slate-200 p-0.5">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={`flex flex-1 items-center justify-center rounded-md px-2 py-1.5 text-xs font-medium transition ${
              value === option.value
                ? 'bg-indigo-600 text-white'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </Field>
  )
}

const ghostButton =
  'inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'

function Dialog({
  open,
  onClose,
  title,
  icon,
  children,
  footer,
  width = 'max-w-md',
}: {
  open: boolean
  onClose: () => void
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  width?: string
}) {
  const dialogRef = useModalDismiss(open, onClose)
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`w-full ${width} rounded-xl bg-white p-5 shadow-xl outline-none`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <span className="text-indigo-600">{icon}</span>
            {title}
          </h2>
          <button
            type="button"
            aria-label={`Close ${title}`}
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex flex-col gap-3">{children}</div>
        {footer ? <div className="mt-5 flex items-center justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  )
}

function BeveragePicker({
  value,
  onChange,
}: {
  value: string
  onChange: (beverage: string) => void
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {BEVERAGE_IDS.map((id) => {
        const Icon = BEVERAGE_ICONS[id] ?? Droplets
        const active = value === id
        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(id)}
            className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-[11px] font-medium transition ${
              active
                ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Icon size={16} />
            {beverageLabel(id)}
          </button>
        )
      })}
    </div>
  )
}

interface AmountDialogProps {
  open: boolean
  onClose: () => void
  title: string
  initialAmountMl: number
  initialBeverage: string
  withBeverage: boolean
  onSave: (amountMl: number, beverage: string) => void
}

function AmountDialog({
  open,
  onClose,
  title,
  initialAmountMl,
  initialBeverage,
  withBeverage,
  onSave,
}: AmountDialogProps) {
  const [amount, setAmount] = useState(String(initialAmountMl))
  const [beverage, setBeverage] = useState(initialBeverage)
  const [error, setError] = useState<string | null>(null)
  const close = () => {
    setError(null)
    onClose()
  }
  const save = () => {
    const parsed = Number(amount)
    if (Number.isInteger(parsed) && parsed >= AMOUNT_MIN_ML && parsed <= AMOUNT_MAX_ML) {
      onSave(parsed, beverage)
      close()
    } else {
      setError(`Enter a value between 1 and ${AMOUNT_MAX_ML} ml`)
    }
  }
  return (
    <Dialog
      open={open}
      onClose={close}
      title={title}
      icon={<Droplets size={16} />}
      footer={
        <>
          <button type="button" onClick={close} className={ghostButton}>
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700"
          >
            Save
          </button>
        </>
      }
    >
      <Field label="Millilitres" hint={error ?? undefined}>
        <TextInput
          type="number"
          min={AMOUNT_MIN_ML}
          max={AMOUNT_MAX_ML}
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') save()
          }}
          aria-invalid={error !== null}
        />
      </Field>
      {withBeverage ? (
        <BeveragePicker value={beverage} onChange={setBeverage} />
      ) : null}
    </Dialog>
  )
}

interface BackfillDialogProps {
  open: boolean
  onClose: () => void
  initialAmountMl: number
  initialBeverage: string
  now: Date
  onSave: (amountMl: number, beverage: string, when: Date) => void
}

const BACKFILL_OFFSETS: { value: string; label: string; make: (now: Date) => Date }[] = [
  { value: '1h', label: '1 hour ago', make: (now) => new Date(now.getTime() - 3600_000) },
  { value: '3h', label: '3 hours ago', make: (now) => new Date(now.getTime() - 3 * 3600_000) },
  { value: '6h', label: '6 hours ago', make: (now) => new Date(now.getTime() - 6 * 3600_000) },
  {
    value: 'yesterday',
    label: 'Yesterday',
    make: (now) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, now.getHours(), now.getMinutes()),
  },
]

function BackfillDialog({ open, onClose, initialAmountMl, initialBeverage, now, onSave }: BackfillDialogProps) {
  const [amount, setAmount] = useState(String(initialAmountMl))
  const [beverage, setBeverage] = useState(initialBeverage)
  const [offset, setOffset] = useState(BACKFILL_OFFSETS[0])
  const [error, setError] = useState<string | null>(null)
  const close = () => {
    setError(null)
    onClose()
  }
  const save = (base: Date) => {
    const parsed = Number(amount)
    if (Number.isInteger(parsed) && parsed >= AMOUNT_MIN_ML && parsed <= AMOUNT_MAX_ML) {
      onSave(parsed, beverage, offset.make(base))
      close()
    } else {
      setError(`Enter a value between 1 and ${AMOUNT_MAX_ML} ml`)
    }
  }
  return (
    <Dialog
      open={open}
      onClose={close}
      title="Backfill"
      icon={<ArrowLeft size={16} />}
      footer={
        <button
          type="button"
          onClick={() => save(now)}
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700"
        >
          Save
        </button>
      }
    >
      <Field label="Millilitres" hint={error ?? undefined}>
        <TextInput
          type="number"
          min={AMOUNT_MIN_ML}
          max={AMOUNT_MAX_ML}
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          aria-invalid={error !== null}
        />
      </Field>
      <Field label="Beverage">
        <BeveragePicker value={beverage} onChange={setBeverage} />
      </Field>
      <Field label="Logged at">
        <div className="grid grid-cols-2 gap-2">
          {BACKFILL_OFFSETS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={offset.value === option.value}
              onClick={() => setOffset(option)}
              className={`rounded-md border px-2 py-1.5 text-xs font-medium transition ${
                offset.value === option.value
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </Field>
    </Dialog>
  )
}

interface GoalDialogProps {
  open: boolean
  onClose: () => void
  target: PersistedTarget
  onSave: (target: PersistedTarget) => void
}

function GoalDialog({ open, onClose, target, onSave }: GoalDialogProps) {
  const [amount, setAmount] = useState(String(target.targetMl))
  const [unit, setUnit] = useState<VolumeUnit>(target.unit)
  const [error, setError] = useState<string | null>(null)
  const close = () => {
    setError(null)
    onClose()
  }
  const save = () => {
    const parsed = Number(amount)
    if (Number.isInteger(parsed) && parsed >= GOAL_MIN_ML && parsed <= GOAL_MAX_ML) {
      onSave({ targetMl: parsed, unit })
      close()
    } else {
      setError(`Enter a value between ${GOAL_MIN_ML} and ${GOAL_MAX_ML} ml`)
    }
  }
  return (
    <Dialog
      open={open}
      onClose={close}
      title="Daily goal"
      icon={<Droplets size={16} />}
      footer={
        <>
          <button type="button" onClick={close} className={ghostButton}>
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700"
          >
            Save
          </button>
        </>
      }
    >
      <Field label="Millilitres" hint={error ?? undefined}>
        <TextInput
          type="number"
          min={GOAL_MIN_ML}
          max={GOAL_MAX_ML}
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') save()
          }}
          aria-invalid={error !== null}
        />
      </Field>
      <Seg
        label="Unit"
        value={unit}
        onChange={setUnit}
        options={(['ml', 'L', 'oz'] as VolumeUnit[]).map((value) => ({
          value,
          label: VOLUME_UNIT_LABELS[value],
        }))}
      />
    </Dialog>
  )
}

interface CalculatorDialogProps {
  open: boolean
  onClose: () => void
  initialGoal: { weightKg: number; age: number; activityLevel: ActivityLevel } | null
  onApply: (recommendedMl: number, goal: { weightKg: number; age: number; activityLevel: ActivityLevel }) => void
}

function CalculatorDialog({ open, onClose, initialGoal, onApply }: CalculatorDialogProps) {
  const [weight, setWeight] = useState(initialGoal ? String(initialGoal.weightKg) : '')
  const [age, setAge] = useState(initialGoal ? String(initialGoal.age) : '')
  const [activity, setActivity] = useState<ActivityLevel>(initialGoal?.activityLevel ?? 'sedentary')
  const [climate, setClimate] = useState<ClimateFactor>('mild')
  const [error, setError] = useState<string | null>(null)
  const weightKg = Number(weight)
  const ageYears = Number(age)
  const recommended = useMemo(() => {
    if (!weight || !age) return null
    const w = Number(weight)
    const a = Number(age)
    if (Number.isNaN(w) || Number.isNaN(a)) return null
    try {
      return goalCalculator(w, a, activity, climate).recommendedMl
    } catch {
      return null
    }
  }, [weight, age, activity, climate])
  const apply = () => {
    if (recommended === null || Number.isNaN(weightKg) || Number.isNaN(ageYears)) {
      setError('Enter a valid weight and age.')
      return
    }
    onApply(recommended, { weightKg, age: ageYears, activityLevel: activity })
    onClose()
  }
  return (
    <Dialog
      open={open}
      onClose={() => {
        setError(null)
        onClose()
      }}
      title="Goal calculator"
      icon={<Calculator size={16} />}
      footer={
        <>
          <button
            type="button"
            onClick={() => {
              setError(null)
              onClose()
            }}
            className={ghostButton}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={apply}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700"
          >
            Apply
          </button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="Weight (kg)">
          <TextInput
            type="number"
            value={weight}
            placeholder="70"
            onChange={(event) => setWeight(event.target.value)}
          />
        </Field>
        <Field label="Age">
          <TextInput
            type="number"
            value={age}
            placeholder="30"
            onChange={(event) => setAge(event.target.value)}
          />
        </Field>
      </div>
      <Seg<ActivityLevel>
        label="Activity"
        value={activity}
        onChange={setActivity}
        options={ACTIVITY_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
      />
      <Seg<ClimateFactor>
        label="Climate"
        value={climate}
        onChange={setClimate}
        options={[
          { value: 'mild', label: 'Mild' },
          { value: 'warm', label: 'Warm' },
          { value: 'hot', label: 'Hot' },
        ]}
      />
      {error ? <p className="text-xs font-medium text-red-500">{error}</p> : null}
      <p className="rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700">
        {recommended === null
          ? 'Enter your profile to see a recommendation.'
          : `Recommended goal: ${recommended} ml`}
      </p>
    </Dialog>
  )
}

interface InsightsDialogProps {
  open: boolean
  onClose: () => void
  entries: IntakeEntry[]
  target: PersistedTarget
  now: Date
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-semibold text-slate-800">{value}</span>
    </div>
  )
}

function InsightsDialog({ open, onClose, entries, target, now }: InsightsDialogProps) {
  const insights = useMemo(() => insightsFor(entries, target.targetMl, now), [entries, target.targetMl, now])
  const score = useMemo(
    () => hydrationScore(entries, target.targetMl, now),
    [entries, target.targetMl, now],
  )
  const challenges = useMemo(
    () => evaluateChallenges(entries, target.targetMl, now),
    [entries, target.targetMl, now],
  )
  const maxBar = Math.max(1, ...insights.lastSevenDaysMl)
  const dialogRef = useModalDismiss(open, onClose)
  if (!open) return null

  const copy = async (kind: 'summary' | 'csv') => {
    const text = kind === 'summary' ? exportSummary() : entriesCsv(entries)
    try {
      await navigator.clipboard.writeText(text)
      toast.success(kind === 'summary' ? 'Summary copied to clipboard' : 'CSV copied to clipboard')
      onClose()
    } catch {
      toast.error('Couldn’t copy', {
        description: 'Your browser blocked clipboard access.',
      })
    }
  }
  const exportSummary = () => {
    const streak = insights.streak
    const scoreText = score
    const day = now
    const pct = Math.round((insights.todayMl / target.targetMl) * 100)
    const most = insights.mostLoggedBeverage ? beverageLabel(insights.mostLoggedBeverage) : '—'
    return [
      `Hydration summary — ${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`,
      `Today: ${insights.todayMl} / ${target.targetMl} ml (${pct}%)`,
      `Score: ${scoreText}/100`,
      `Streak: ${streak.current} day(s) · best ${streak.best}`,
      `This week: ${insights.thisWeekMl} ml`,
      `Most logged: ${most}`,
    ].join('\n')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Insights"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-5 shadow-xl outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <BarChart3 size={16} className="text-indigo-600" />
            Insights
          </h2>
          <button
            type="button"
            aria-label="Close Insights"
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <StatRow label="Today" value={formatVolume(insights.todayMl, target.unit)} />
            <StatRow label="This week" value={formatVolume(insights.thisWeekMl, target.unit)} />
            <StatRow label="This month" value={formatVolume(insights.thisMonthMl, target.unit)} />
            <StatRow label="Average glass" value={formatVolume(insights.averageGlassMl, target.unit)} />
            <StatRow
              label="Most logged"
              value={insights.mostLoggedBeverage ? beverageLabel(insights.mostLoggedBeverage) : '—'}
            />
          </div>

          <div className="flex items-end gap-1 pt-2">
            {insights.lastSevenDaysMl.map((value, index) => (
              <div key={insights.weekLabels[index]} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-20 w-full items-end rounded bg-slate-100">
                  <div
                    className="w-full rounded bg-indigo-500"
                    style={{ height: `${Math.max(6, Math.round((value / maxBar) * 100))}%` }}
                    title={`${insights.weekLabels[index]} ${value} ml`}
                  />
                </div>
                <span className="text-[10px] text-slate-400">{insights.weekLabels[index]}</span>
              </div>
            ))}
          </div>

          <div className="pt-1">
            <StatRow label="Streak" value={pluralDays(insights.streak.current, insights.streak.best)} />
            <div className="flex items-center gap-1 py-1">
              {insights.streak.lastDaysHit.map((hit, index) => (
                <span
                  key={index}
                  title={hit ? 'Goal met' : 'Goal missed'}
                  className={`h-2.5 w-2.5 rounded-sm ${hit ? 'bg-indigo-500' : 'bg-slate-200'}`}
                />
              ))}
            </div>
            {insights.freezes.bank > 0 ? (
              <StatRow label="Freezes banked" value={pluralSparks(insights.freezes.bank)} />
            ) : null}
          </div>

          <StatRow label="Hydration score" value={`${score}/100`} />

          <div className="border-t border-slate-100 pt-3">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Trophy size={14} className="text-indigo-600" />
              Achievements
            </h3>
            {insights.achievements.length === 0 ? (
              <p className="py-1 text-xs text-slate-400">No badges earned yet</p>
            ) : (
              insights.achievements.map(() => null)
            )}
            {insights.achievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center gap-2 py-1">
                <CheckCircle2 size={14} className="shrink-0 text-indigo-500" />
                <span className="mr-auto text-xs text-slate-700">{achievement.title}</span>
                <span className="text-[11px] text-slate-400">
                  {new Date(achievement.unlockedAt).getDate()}{' '}
                  {new Date(achievement.unlockedAt).toLocaleString('en', { month: 'short' })}
                </span>
              </div>
            ))}
          </div>

          <div>
            <h3 className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Trophy size={14} className="text-indigo-600" />
              Challenges
            </h3>
            {challenges.map((challenge) => (
              <div key={challenge.id} className="flex items-center gap-2 py-1">
                {challenge.earned ? (
                  <CheckCircle2 size={14} className="shrink-0 text-indigo-500" />
                ) : (
                  <Circle size={14} className="shrink-0 text-slate-300" />
                )}
                <span className="mr-auto text-xs text-slate-700">{challenge.title}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    challenge.earned
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {challenge.earned ? 'Earned' : 'Open'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button type="button" onClick={() => void copy('summary')} className={ghostButton}>
            <ClipboardCopy size={14} />
            Copy summary
          </button>
          <button type="button" onClick={() => void copy('csv')} className={ghostButton}>
            <Download size={14} />
            Export CSV
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

interface HydrationAppProps {
  now?: () => Date
}

export function HydrationApp({ now = () => new Date() }: HydrationAppProps = {}) {
  const [entries, setEntries] = useState<IntakeEntry[]>(() => loadEntries())
  const [target, setTarget] = useState<PersistedTarget>(() => loadTarget())
  const [storedGoal, setStoredGoal] = useState<{ weightKg: number; age: number; activityLevel: ActivityLevel } | null>(
    () => loadUserGoal(),
  )
  const [beverage, setBeverage] = useState('water')
  const [quickMl, setQuickMl] = useState(DEFAULT_QUICK_ML)

  const [goalOpen, setGoalOpen] = useState(false)
  const [amountOpen, setAmountOpen] = useState(false)
  const [backfillOpen, setBackfillOpen] = useState(false)
  const [calculatorOpen, setCalculatorOpen] = useState(false)
  const [insightsOpen, setInsightsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const currentNow = now()
  const progress = useMemo(
    () => progressFor(entries, target.targetMl, currentNow),
    [entries, target.targetMl, currentNow],
  )
  const todayEntries = useMemo(
    () =>
      [...progress.todayEntries].sort(
        (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime(),
      ),
    [progress.todayEntries],
  )
  const paceDecision = useMemo(
    () =>
      progress.totalMl < target.targetMl
        ? smartReminderPolicy(currentNow, progress.totalMl, target.targetMl)
        : { shouldRemind: false, deficitMl: 0, reason: 'Goal already reached' },
    [currentNow, progress.totalMl, target.targetMl],
  )

  const persist = (next: IntakeEntry[]) => {
    setEntries(next)
    saveEntries(next)
  }

  const log = (entry: IntakeEntry, message?: string) => {
    persist([...entries, entry])
    if (message) toast.success(message, { key: 'hydrate' })
  }

  const updateEntry = (id: string, amountMl: number, beverageId: string) => {
    persist(
      entries.map((entry) =>
        entry.id === id
          ? { ...entry, amountMl, beverage: beverageId, updatedAt: new Date().toISOString() }
          : entry,
      ),
    )
    toast.success('Entry updated')
  }

  const deleteEntry = (entry: IntakeEntry) => {
    persist(entries.filter((item) => item.id !== entry.id))
    toast.success('Entry deleted')
  }

  const quickLog = (amountMl: number) => {
    log(
      newEntry(amountMl, beverage, currentNow),
      `${formatVolume(amountMl, target.unit)} logged`,
    )
  }

  const editingEntry = editingId ? entries.find((entry) => entry.id === editingId) ?? null : null

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-2.5">
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
            <Droplets size={16} />
          </span>
          <div className="mr-auto min-w-0">
            <h1 className="truncate text-sm font-semibold text-slate-800">Hydration Tracker</h1>
            <p className="hidden truncate text-[11px] text-slate-400 sm:block">
              Log water and stay on goal.
            </p>
          </div>
          <ToolMenu />
          <button
            type="button"
            onClick={() => {
              if (entries.length === 0) {
                toast.error('Nothing to export yet', {
                  description: 'Add some intake to your log first.',
                })
                return
              }
              downloadBlob(new Blob([entriesCsv(entries)], { type: 'text/csv' }), 'hydration-log.csv')
              toast.success('CSV downloaded')
            }}
            className={`${ghostButton} sm:inline-flex`}
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </header>

      <main className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-6">
        <Card>
          <p className="text-xs font-medium text-slate-500">Today</p>
          <p className="text-2xl font-semibold text-slate-900">
            {formatVolume(progress.totalMl, target.unit)} of{' '}
            <span className="text-slate-500">{formatVolume(target.targetMl, target.unit)}</span>
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all"
              style={{ width: `${progress.ratio * 100}%` }}
            />
          </div>
        </Card>

        {progress.caffeineMg > CAFFEINE_CAP_MG ? (
          <Card>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
                <Coffee size={16} />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Caffeine alert</h2>
                <p className="text-xs text-slate-500">
                  You had {progress.caffeineMg} mg of caffeine today — over the {CAFFEINE_CAP_MG} mg cap.
                </p>
              </div>
            </div>
          </Card>
        ) : null}

        {paceDecision.shouldRemind ? (
          <Card>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
                <BarChart3 size={16} />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Pace reminder</h2>
                <p className="text-xs text-slate-500">
                  You are {paceDecision.deficitMl} ml behind where you should be today — keep sipping.
                </p>
              </div>
            </div>
          </Card>
        ) : null}

        <Card>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-800">Daily goal</h2>
            <span className="text-sm font-semibold text-indigo-600">
              {formatVolume(target.targetMl, target.unit)}
            </span>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setGoalOpen(true)} className={ghostButton}>
                <Pencil size={14} />
                Edit
              </button>
              <button type="button" onClick={() => setCalculatorOpen(true)} className={ghostButton}>
                <Calculator size={14} />
                Goal calculator
              </button>
              <button type="button" onClick={() => setInsightsOpen(true)} className={ghostButton}>
                <BarChart3 size={14} />
                Insights
              </button>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-slate-800">Quick log</h2>
          <div className="mt-3">
            <BeveragePicker value={beverage} onChange={setBeverage} />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {PRESETS_ML.map((preset) => (
              <button
                key={preset}
                type="button"
                aria-pressed={quickMl === preset}
                onClick={() => {
                  setQuickMl(preset)
                  quickLog(preset)
                }}
                className={`rounded-lg border px-2 py-2 text-xs font-medium transition ${
                  quickMl === preset
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {formatVolume(preset, target.unit)}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button type="button" onClick={() => setAmountOpen(true)} className={ghostButton}>
              <Plus size={14} />
              Custom…
            </button>
            <button type="button" onClick={() => setBackfillOpen(true)} className={ghostButton}>
              <ArrowLeft size={14} />
              Backfill …
            </button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-800">Today</h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
              {todayEntries.length}
            </span>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {todayEntries.length === 0 ? (
              <p className="text-xs text-slate-400">No intake yet — add your first glass of water.</p>
            ) : (
              todayEntries.map((entry) => {
                const Icon = BEVERAGE_ICONS[entry.beverage] ?? Droplets
                const showBeverage = entry.beverage !== 'water'
                return (
                  <div key={entry.id} className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
                      <Icon size={15} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800">
                        {formatVolume(entry.amountMl, target.unit)}
                      </p>
                      <p className="truncate text-[11px] text-slate-400">
                        {showBeverage ? `${beverageLabel(entry.beverage)} · ${formatTime(entry.loggedAt)}` : formatTime(entry.loggedAt)}
                      </p>
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                      <IconButton title="Edit entry" onClick={() => setEditingId(entry.id)}>
                        <Pencil size={14} />
                      </IconButton>
                      <IconButton
                        title="Delete entry"
                        danger
                        onClick={() =>
                          toast.confirm({
                            message: 'Delete entry?',
                            description: `Remove this ${formatVolume(entry.amountMl, target.unit)} entry from your log.`,
                            confirmLabel: 'Delete',
                            tone: 'error',
                            onConfirm: () => deleteEntry(entry),
                          })
                        }
                      >
                        <Trash2 size={14} />
                      </IconButton>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Card>
      </main>

      <GoalDialog
        open={goalOpen}
        onClose={() => setGoalOpen(false)}
        target={target}
        onSave={(next) => {
          setTarget(next)
          saveTarget(next)
          toast.success('Daily goal updated')
        }}
      />
      <AmountDialog
        open={amountOpen}
        onClose={() => setAmountOpen(false)}
        title="Custom amount"
        initialAmountMl={quickMl}
        initialBeverage={beverage}
        withBeverage
        onSave={(amountMl, beverageId) =>
          log(
            newEntry(amountMl, beverageId, currentNow),
            `${formatVolume(amountMl, target.unit)} logged`,
          )
        }
      />
      <BackfillDialog
        open={backfillOpen}
        onClose={() => setBackfillOpen(false)}
        initialAmountMl={quickMl}
        initialBeverage={beverage}
        now={currentNow}
        onSave={(amountMl, beverageId) =>
          log(newEntry(amountMl, beverageId, currentNow), `Backfilled ${formatVolume(amountMl, target.unit)}`)
        }
      />
      <AmountDialog
        open={editingEntry !== null}
        onClose={() => setEditingId(null)}
        title="Edit entry"
        initialAmountMl={editingEntry?.amountMl ?? quickMl}
        initialBeverage={editingEntry?.beverage ?? beverage}
        withBeverage
        onSave={(amountMl, beverageId) => {
          if (editingId) updateEntry(editingId, amountMl, beverageId)
        }}
      />
      <CalculatorDialog
        open={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
        initialGoal={storedGoal}
        onApply={(recommendedMl, goal) => {
          setTarget({ ...target, targetMl: recommendedMl })
          saveTarget({ ...target, targetMl: recommendedMl })
          setStoredGoal(goal)
          saveUserGoal(goal)
          toast.success('Goal applied')
        }}
      />
      <InsightsDialog
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        entries={entries}
        target={target}
        now={currentNow}
      />
    </div>
  )
}

export default HydrationApp