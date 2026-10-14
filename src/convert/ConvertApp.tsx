import { useMemo, useState } from 'react'
import { ArrowRightLeft, Ruler } from 'lucide-react'
import { ToolHeader } from '../components/ui/ToolHeader'
import { CATEGORY_META, UNITS, convertUnit, formatNumber, type UnitCategory } from './convert'

const selectClass =
  'w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-2 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500'

export function ConvertApp() {
  const [categoryId, setCategoryId] = useState<UnitCategory>('length')
  const category = CATEGORY_META.find((c) => c.id === categoryId) ?? CATEGORY_META[0]
  const [from, setFrom] = useState(category.defaultFrom)
  const [to, setTo] = useState(category.defaultTo)
  const [value, setValue] = useState('1')

  const result = useMemo(() => {
    const parsed = Number(value)
    if (value.trim() === '' || Number.isNaN(parsed)) return '—'
    return formatNumber(convertUnit(categoryId, from, to, parsed))
  }, [categoryId, from, to, value])

  const chooseCategory = (id: UnitCategory) => {
    const meta = CATEGORY_META.find((c) => c.id === id) ?? CATEGORY_META[0]
    setCategoryId(id)
    setFrom(meta.defaultFrom)
    setTo(meta.defaultTo)
  }

  const swap = () => {
    setFrom(to)
    setTo(from)
  }

  const units = UNITS[categoryId]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800">
      <ToolHeader icon={Ruler} title="Unit Converter" subtitle="Convert common units instantly, offline." />

      <main className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-6">
        <div className="flex flex-wrap gap-2">
          {CATEGORY_META.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => chooseCategory(c.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                c.id === categoryId
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
              From
              <select
                aria-label="From unit"
                className={selectClass}
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label}
                  </option>
                ))}
              </select>
              <input
                aria-label="Value"
                inputMode="decimal"
                className="mt-1 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-2 text-lg font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </label>

            <button
              type="button"
              onClick={swap}
              aria-label="Swap units"
              title="Swap units"
              className="mx-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 sm:mb-6"
            >
              <ArrowRightLeft size={15} />
            </button>

            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
              To
              <select
                aria-label="To unit"
                className={selectClass}
                value={to}
                onChange={(e) => setTo(e.target.value)}
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label}
                  </option>
                ))}
              </select>
              <output className="mt-1 block w-full truncate rounded-md border border-indigo-100 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-2 text-lg font-semibold text-indigo-700 dark:text-indigo-300">
                {result}
              </output>
            </label>
          </div>
        </section>

        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500">
          US customary for volume and area; binary (1024) units for storage.
        </p>
      </main>
    </div>
  )
}

export default ConvertApp
