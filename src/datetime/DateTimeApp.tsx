import { useMemo, useState, type ReactNode } from 'react'
import { CalendarClock } from 'lucide-react'
import { ToolHeader } from '../components/ui/ToolHeader'
import {
  addToDate,
  calculateAge,
  diffDates,
  formatInTimeZone,
  listTimezones,
  parseDateInput,
  toDateInput,
} from './model'

type Tab = 'diff' | 'age' | 'add' | 'zones'

const TABS: { id: Tab; label: string }[] = [
  { id: 'diff', label: 'Date difference' },
  { id: 'age', label: 'Age' },
  { id: 'add', label: 'Add / subtract' },
  { id: 'zones', label: 'Time zones' },
]

const inputClass =
  'rounded-md border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500'

const Card = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">{children}</div>
)

export function DateTimeApp() {
  const [tab, setTab] = useState<Tab>('diff')
  const today = toDateInput(new Date())

  const [diffFrom, setDiffFrom] = useState(today)
  const [diffTo, setDiffTo] = useState(toDateInput(new Date(Date.now() + 30 * 86_400_000)))
  const [birth, setBirth] = useState('1990-01-01')
  const [base, setBase] = useState(today)
  const [offset, setOffset] = useState({ years: 0, months: 0, weeks: 0, days: 7 })
  const [localDateTime, setLocalDateTime] = useState(`${today}T09:00`)
  const [targetZone, setTargetZone] = useState('America/New_York')

  const zones = useMemo(() => listTimezones(), [])
  const localZone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    } catch {
      return 'UTC'
    }
  }, [])

  const fromDate = parseDateInput(diffFrom)
  const toDate = parseDateInput(diffTo)
  const diff = fromDate && toDate ? diffDates(fromDate, toDate) : null

  const birthDate = parseDateInput(birth)
  const age = birthDate ? calculateAge(birthDate) : null

  const baseDate = parseDateInput(base)
  const added = baseDate ? addToDate(baseDate, offset) : null

  const converted = localDateTime ? formatInTimeZone(new Date(localDateTime), targetZone) : ''

  return (
    <div className="min-h-screen bg-slate-50">
      <ToolHeader icon={CalendarClock} title="Date & Time Tools" subtitle="Work out date differences, ages, and time zones." />

      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
        <div className="inline-flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-white p-1">
          {TABS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={tab === option.id}
              onClick={() => setTab(option.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                tab === option.id ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {tab === 'diff' ? (
          <Card>
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                From
                <input aria-label="From date" type="date" className={inputClass} value={diffFrom} onChange={(e) => setDiffFrom(e.target.value)} />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                To
                <input aria-label="To date" type="date" className={inputClass} value={diffTo} onChange={(e) => setDiffTo(e.target.value)} />
              </label>
            </div>
            {diff ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: 'Total days', value: diff.totalDays },
                  { label: 'Weeks', value: diff.totalWeeks },
                  { label: 'Weekend days', value: diff.weekendDays },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg bg-slate-50 p-3">
                    <p className="text-lg font-bold text-slate-800">{item.value}</p>
                    <p className="text-[11px] text-slate-400">{item.label}</p>
                  </div>
                ))}
                <div className="rounded-lg bg-indigo-50 p-3">
                  <p className="text-lg font-bold text-indigo-700">
                    {diff.years}y {diff.months}m {diff.days}d
                  </p>
                  <p className="text-[11px] text-indigo-400">Calendar span</p>
                </div>
              </div>
            ) : null}
          </Card>
        ) : null}

        {tab === 'age' ? (
          <Card>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
              Date of birth
              <input aria-label="Date of birth" type="date" className={`${inputClass} w-48`} value={birth} onChange={(e) => setBirth(e.target.value)} />
            </label>
            {age ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: 'Age', value: `${age.years}y ${age.months}m ${age.days}d` },
                  { label: 'Total days', value: age.totalDays.toLocaleString() },
                  { label: 'Next birthday', value: `${age.nextBirthdayIn}d` },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg bg-slate-50 p-3">
                    <p className="text-base font-bold text-slate-800">{item.value}</p>
                    <p className="text-[11px] text-slate-400">{item.label}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </Card>
        ) : null}

        {tab === 'add' ? (
          <Card>
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                Starting date
                <input aria-label="Starting date" type="date" className={inputClass} value={base} onChange={(e) => setBase(e.target.value)} />
              </label>
              {(['years', 'months', 'weeks', 'days'] as const).map((key) => (
                <label key={key} className="flex flex-col gap-1 text-xs font-medium capitalize text-slate-600">
                  {key}
                  <input
                    aria-label={key}
                    type="number"
                    className={`${inputClass} w-20`}
                    value={offset[key]}
                    onChange={(e) => setOffset((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                  />
                </label>
              ))}
            </div>
            {added ? (
              <p aria-label="Result date" className="rounded-lg bg-indigo-50 p-3 text-lg font-bold text-indigo-700">
                {toDateInput(added)}
              </p>
            ) : null}
          </Card>
        ) : null}

        {tab === 'zones' ? (
          <Card>
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                Local time ({localZone})
                <input
                  aria-label="Local time"
                  type="datetime-local"
                  className={inputClass}
                  value={localDateTime}
                  onChange={(e) => setLocalDateTime(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                Target zone
                <select aria-label="Target zone" className={inputClass} value={targetZone} onChange={(e) => setTargetZone(e.target.value)}>
                  {zones.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p aria-label="Converted time" className="rounded-lg bg-indigo-50 p-3 text-lg font-bold text-indigo-700">
              {converted}
            </p>
          </Card>
        ) : null}
      </main>
    </div>
  )
}

export default DateTimeApp
