import { useMemo, useState } from 'react'
import { Moon, Plus, Trash2 } from 'lucide-react'
import { ToolHeader } from '../components/ui/ToolHeader'
import { toast } from '../lib/toast'
import { useSleepStore } from './store'
import {
  QUALITY_LABELS,
  dateKey,
  durationMinutes,
  formatClock,
  formatDuration,
  isValidTime,
  sortByDateDesc,
  summarise,
} from './model'

const inputClass =
  'rounded-md border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500'

export function SleepApp() {
  const entries = useSleepStore((s) => s.entries)
  const addEntry = useSleepStore((s) => s.addEntry)
  const removeEntry = useSleepStore((s) => s.removeEntry)

  const today = dateKey(new Date())
  const [date, setDate] = useState(today)
  const [bed, setBed] = useState('23:00')
  const [wake, setWake] = useState('07:00')
  const [quality, setQuality] = useState(4)
  const [note, setNote] = useState('')

  const sorted = useMemo(() => sortByDateDesc(entries), [entries])
  const summary = useMemo(() => summarise(entries), [entries])
  const recent = useMemo(() => sorted.slice(0, 7), [sorted])
  const maxDuration = Math.max(1, ...recent.map((entry) => durationMinutes(entry.bed, entry.wake)))

  const submit = () => {
    if (!isValidTime(bed) || !isValidTime(wake)) {
      toast.error('Enter times as HH:MM')
      return
    }
    if (entries.some((entry) => entry.date === date)) {
      toast.error('A sleep entry already exists for that date')
      return
    }
    addEntry({ date, bed, wake, quality, note })
    setNote('')
    toast.success('Sleep logged')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ToolHeader icon={Moon} title="Sleep Tracker" subtitle="Log your sleep and spot your best rest patterns." />

      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
        <section className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Date
            <input aria-label="Date" type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Bed time
            <input aria-label="Bed time" type="time" className={inputClass} value={bed} onChange={(e) => setBed(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Wake time
            <input aria-label="Wake time" type="time" className={inputClass} value={wake} onChange={(e) => setWake(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Quality
            <select
              aria-label="Quality"
              className={inputClass}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value} · {QUALITY_LABELS[value]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-[10rem] flex-1 flex-col gap-1 text-xs font-medium text-slate-600">
            Note
            <input
              aria-label="Note"
              className={inputClass}
              value={note}
              placeholder="Woke up once"
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={submit}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            <Plus size={15} />
            Log sleep
          </button>
        </section>

        {summary ? (
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Avg sleep', value: formatDuration(summary.averageMinutes) },
              { label: 'Avg quality', value: `${summary.averageQuality}/5` },
              { label: 'Avg bedtime', value: formatClock(summary.averageBedtime) },
              { label: 'Avg wake', value: formatClock(summary.averageWake) },
            ].map((card) => (
              <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <p className="text-lg font-bold text-slate-800">{card.value}</p>
                <p className="text-[11px] text-slate-400">{card.label}</p>
              </div>
            ))}
          </section>
        ) : null}

        {recent.length > 0 ? (
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-xs font-medium text-slate-400">Last {recent.length} nights</h2>
            <div className="flex items-end gap-2" style={{ height: 120 }}>
              {[...recent].reverse().map((entry) => {
                const minutes = durationMinutes(entry.bed, entry.wake)
                return (
                  <div key={entry.id} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[10px] text-slate-400">{formatDuration(minutes)}</span>
                    <div
                      className="w-full rounded-t-md bg-indigo-500"
                      style={{ height: `${Math.round((minutes / maxDuration) * 80)}px` }}
                      title={`${entry.date}: ${formatDuration(minutes)}`}
                    />
                    <span className="text-[10px] text-slate-400">{entry.date.slice(5)}</span>
                  </div>
                )
              })}
            </div>
          </section>
        ) : null}

        <section className="flex flex-col gap-2">
          {sorted.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
              No sleep logged yet. Add your first night above.
            </p>
          ) : (
            sorted.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
              >
                <span className="w-24 shrink-0 text-xs font-medium text-slate-500">{entry.date}</span>
                <span className="text-sm text-slate-700">
                  {entry.bed} → {entry.wake}
                </span>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
                  {formatDuration(durationMinutes(entry.bed, entry.wake))}
                </span>
                <span className="text-xs text-slate-400">Q{entry.quality}</span>
                {entry.note ? <span className="truncate text-xs text-slate-400">{entry.note}</span> : null}
                <button
                  type="button"
                  aria-label={`Delete ${entry.date}`}
                  onClick={() => removeEntry(entry.id)}
                  className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  )
}

export default SleepApp
