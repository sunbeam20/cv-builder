import { useMemo, useState } from 'react'
import { Smile, Trash2 } from 'lucide-react'
import { ToolHeader } from '../components/ui/ToolHeader'
import { toast } from '../lib/toast'
import { useMoodStore } from './store'
import {
  MOODS,
  MOOD_TAGS,
  dateKey,
  moodMeta,
  sortByDateDesc,
  summarise,
  trend,
} from './model'

const inputClass =
  'rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-2 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500'

export function MoodApp() {
  const entries = useMoodStore((s) => s.entries)
  const addEntry = useMoodStore((s) => s.addEntry)
  const removeEntry = useMoodStore((s) => s.removeEntry)

  const today = dateKey(new Date())
  const [date, setDate] = useState(today)
  const [mood, setMood] = useState(4)
  const [tags, setTags] = useState<string[]>([])
  const [gratitude, setGratitude] = useState('')
  const [note, setNote] = useState('')

  const sorted = useMemo(() => sortByDateDesc(entries), [entries])
  const summary = useMemo(() => summarise(entries), [entries])
  const series = useMemo(() => trend(entries, 14), [entries])

  const toggleTag = (tag: string) =>
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))

  const submit = () => {
    if (entries.some((entry) => entry.date === date)) {
      toast.error('You already journaled that day')
      return
    }
    addEntry({
      date,
      mood,
      tags,
      gratitude: gratitude.split('\n'),
      note,
    })
    setGratitude('')
    setNote('')
    setTags([])
    toast.success('Journal saved')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800">
      <ToolHeader
        icon={Smile}
        title="Mood & Gratitude Journal"
        subtitle="A private space to log mood and what you’re grateful for."
      />

      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
        <section className="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
              Date
              <input aria-label="Date" type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <div className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
              Mood
              <div className="flex gap-1" role="radiogroup" aria-label="Mood">
                {MOODS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={mood === option.value}
                    aria-label={option.label}
                    onClick={() => setMood(option.value)}
                    className={`grid h-10 w-10 place-items-center rounded-lg border text-xl transition ${
                      mood === option.value
                        ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {option.emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {MOOD_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                aria-pressed={tags.includes(tag)}
                onClick={() => toggleTag(tag)}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                  tags.includes(tag)
                    ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            Grateful for…
            <textarea
              aria-label="Grateful for"
              rows={2}
              placeholder="One thing per line"
              className={`${inputClass} resize-y`}
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            Notes
            <textarea
              aria-label="Notes"
              rows={2}
              className={`${inputClass} resize-y`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={submit}
            className="self-start rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Save entry
          </button>
        </section>

        {summary ? (
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Entries', value: String(summary.count) },
              { label: 'Avg mood', value: summary.average.toFixed(1) },
              { label: 'Journal streak', value: `${summary.streak}d` },
              { label: 'Top tag', value: summary.topTags[0]?.tag ?? '—' },
            ].map((card) => (
              <div key={card.label} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 shadow-sm">
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{card.value}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">{card.label}</p>
              </div>
            ))}
          </section>
        ) : null}

        {series.length > 1 ? (
          <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <h2 className="mb-3 text-xs font-medium text-slate-400 dark:text-slate-500">Mood trend</h2>
            <div className="flex items-end gap-1" style={{ height: 90 }}>
              {series.map((entry) => (
                <div
                  key={entry.id}
                  className="flex-1 rounded-t bg-indigo-400"
                  style={{ height: `${(entry.mood / 5) * 80}px` }}
                  title={`${entry.date}: ${moodMeta(entry.mood).label}`}
                />
              ))}
            </div>
          </section>
        ) : null}

        <section className="flex flex-col gap-2">
          {sorted.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-8 text-center text-sm text-slate-400 dark:text-slate-500">
              Nothing journaled yet. Log how today felt above.
            </p>
          ) : (
            sorted.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xl" aria-hidden="true">
                    {moodMeta(entry.mood).emoji}
                  </span>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{entry.date}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">{moodMeta(entry.mood).label}</span>
                  {entry.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                      {tag}
                    </span>
                  ))}
                  <button
                    type="button"
                    aria-label={`Delete ${entry.date}`}
                    onClick={() => removeEntry(entry.id)}
                    className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {entry.gratitude.length > 0 ? (
                  <ul className="mt-2 list-inside list-disc text-xs text-slate-500 dark:text-slate-400">
                    {entry.gratitude.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                ) : null}
                {entry.note ? <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{entry.note}</p> : null}
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  )
}

export default MoodApp
