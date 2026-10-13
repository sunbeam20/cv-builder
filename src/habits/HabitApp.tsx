import { useMemo, useState } from 'react'
import { Flame, Plus, Repeat, Snowflake, Trash2, Trophy } from 'lucide-react'
import { ToolHeader } from '../components/ui/ToolHeader'
import { toast } from '../lib/toast'
import { useHabitsStore } from './store'
import {
  COLOR_STYLES,
  HABIT_COLORS,
  bestStreak,
  currentStreak,
  dateKey,
  recentDays,
  startOfDay,
  weeklyStats,
  type Habit,
  type HabitColor,
} from './model'

const EMOJI_PRESETS = ['✅', '💧', '🏃', '📚', '🧘', '🥗', '😴', '✍️', '🎸', '🧹', '💊', '🚭']
const selectClass =
  'rounded-md border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500'

function HabitCard({ habit }: { habit: Habit }) {
  const toggleDone = useHabitsStore((s) => s.toggleDone)
  const toggleFreeze = useHabitsStore((s) => s.toggleFreeze)
  const removeHabit = useHabitsStore((s) => s.removeHabit)
  const updateHabit = useHabitsStore((s) => s.updateHabit)

  const week = useMemo(() => weeklyStats(habit), [habit])
  const heat = useMemo(() => recentDays(habit, 35), [habit])
  const streak = currentStreak(habit)
  const best = bestStreak(habit)
  const style = COLOR_STYLES[habit.color]
  const todayKey = dateKey(startOfDay(new Date()))

  const onDelete = () => {
    toast.confirm({
      message: `Delete “${habit.name}”?`,
      description: 'This removes the habit and its history.',
      confirmLabel: 'Delete',
      tone: 'error',
      onConfirm: () => {
        removeHabit(habit.id)
        toast.success('Habit deleted')
      },
    })
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg text-xl ${style.bg}`}>
          <span className="drop-shadow">{habit.emoji}</span>
        </span>
        <div className="min-w-0 flex-1">
          <input
            value={habit.name}
            aria-label={`Rename ${habit.name}`}
            onChange={(e) => updateHabit(habit.id, { name: e.target.value })}
            className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-slate-800 outline-none"
          />
          <p className="text-[11px] text-slate-400">
            Target {habit.targetPerWeek}×/week · {week.completed} this week
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 text-xs font-semibold ${style.text}`}>
            <Flame size={13} />
            {streak}
          </span>
          <button
            type="button"
            aria-label={`Delete ${habit.name}`}
            onClick={onDelete}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-1">
        {week.days.map((day) => (
          <button
            key={day.key}
            type="button"
            aria-label={`${habit.name} ${day.key}${day.done ? ' done' : ''}`}
            aria-pressed={day.done}
            onClick={() => toggleDone(habit.id, day.key)}
            disabled={day.future}
            className={`flex h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg border text-[10px] font-medium transition disabled:opacity-30 ${
              day.done
                ? `${style.bg} border-transparent text-white`
                : day.frozen
                  ? 'border-sky-200 bg-sky-50 text-sky-500'
                  : day.today
                    ? 'border-slate-300 bg-slate-50 text-slate-600'
                    : 'border-slate-200 text-slate-400 hover:bg-slate-50'
            }`}
          >
            <span>{day.label}</span>
            {day.frozen ? <Snowflake size={11} /> : <span className="text-[9px]">{day.done ? '✓' : ''}</span>}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => toggleFreeze(habit.id, todayKey)}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-[11px] font-medium text-slate-500 hover:bg-slate-50"
        >
          <Snowflake size={13} />
          Freeze today
        </button>
        <div className="ml-auto flex items-center gap-0.5" aria-label={`${habit.name} last 5 weeks`}>
          {heat.map((day) => (
            <span
              key={day.key}
              title={day.key}
              className={`h-3.5 w-3.5 rounded-sm ${
                day.done ? style.bg : day.frozen ? 'bg-sky-200' : 'bg-slate-100'
              }`}
            />
          ))}
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
          <Trophy size={12} />
          best {best}
        </span>
      </div>
    </article>
  )
}

export function HabitApp() {
  const habits = useHabitsStore((s) => s.habits)
  const addHabit = useHabitsStore((s) => s.addHabit)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('✅')
  const [color, setColor] = useState<HabitColor>('indigo')
  const [target, setTarget] = useState(7)

  const submit = () => {
    if (!name.trim()) {
      toast.error('Name your habit first')
      return
    }
    addHabit({ name, emoji, color, targetPerWeek: target })
    setName('')
    toast.success('Habit added')
  }

  const totals = useMemo(() => {
    const best = habits.reduce((max, habit) => Math.max(max, bestStreak(habit)), 0)
    const doneToday = habits.filter((habit) => habit.done[dateKey(startOfDay(new Date()))]).length
    return { best, doneToday }
  }, [habits])

  return (
    <div className="min-h-screen bg-slate-50">
      <ToolHeader
        icon={Repeat}
        title="Habit Tracker"
        subtitle="Build streaks for the habits that matter to you."
      />

      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
        <section className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Habit
            <input
              aria-label="Habit name"
              value={name}
              placeholder="Read 20 pages"
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              className={`${selectClass} w-52`}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Icon
            <select aria-label="Icon" className={selectClass} value={emoji} onChange={(e) => setEmoji(e.target.value)}>
              {EMOJI_PRESETS.map((preset) => (
                <option key={preset} value={preset}>
                  {preset}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Per week
            <select
              aria-label="Per week"
              className={selectClass}
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7].map((option) => (
                <option key={option} value={option}>
                  {option}×
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Color
            <div className="flex items-center gap-1.5 py-1.5">
              {HABIT_COLORS.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-label={`Color ${option}`}
                  aria-pressed={color === option}
                  onClick={() => setColor(option)}
                  className={`h-6 w-6 rounded-full ${COLOR_STYLES[option].bg} ${
                    color === option ? 'ring-2 ring-slate-400 ring-offset-1' : ''
                  }`}
                />
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={submit}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            <Plus size={15} />
            Add habit
          </button>
        </section>

        {habits.length > 0 ? (
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
              <p className="text-lg font-bold text-slate-800">{habits.length}</p>
              <p className="text-[11px] text-slate-400">Active habits</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
              <p className="text-lg font-bold text-slate-800">{totals.doneToday}</p>
              <p className="text-[11px] text-slate-400">Done today</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
              <p className="text-lg font-bold text-slate-800">{totals.best}</p>
              <p className="text-[11px] text-slate-400">Best streak</p>
            </div>
          </section>
        ) : null}

        <section className="flex flex-col gap-3">
          {habits.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
              Add your first habit above to start building streaks.
            </p>
          ) : (
            habits.map((habit) => <HabitCard key={habit.id} habit={habit} />)
          )}
        </section>
      </main>
    </div>
  )
}

export default HabitApp
