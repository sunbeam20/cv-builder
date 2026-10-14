import { useMemo, useState } from 'react'
import { Copy, RefreshCw, Type } from 'lucide-react'
import { ToolHeader } from '../components/ui/ToolHeader'
import { generateLorem, type LoremMode, type LoremUnit } from './lorem'

const selectClass =
  'rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-2 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500'

/** Small deterministic PRNG so "Shuffle" produces a fresh, reproducible roll. */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function LoremApp() {
  const [unit, setUnit] = useState<LoremUnit>('paragraphs')
  const [count, setCount] = useState(3)
  const [mode, setMode] = useState<LoremMode>('classic')
  const [startWithLorem, setStartWithLorem] = useState(true)
  const [seed, setSeed] = useState(0)
  const [copied, setCopied] = useState(false)

  const rng = useMemo(() => mulberry32(seed + 1), [seed])
  const text = useMemo(
    () => generateLorem({ count, unit, mode, startWithLorem, rng }),
    [count, unit, mode, startWithLorem, rng],
  )

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800">
      <ToolHeader
        icon={Type}
        title="Lorem Ipsum Generator"
        subtitle="Placeholder text by words, sentences, or paragraphs."
      />

      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
        <section className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            Unit
            <select
              aria-label="Unit"
              className={selectClass}
              value={unit}
              onChange={(e) => setUnit(e.target.value as LoremUnit)}
            >
              <option value="paragraphs">Paragraphs</option>
              <option value="sentences">Sentences</option>
              <option value="words">Words</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            How many
            <input
              aria-label="How many"
              type="number"
              min={1}
              max={200}
              className={`${selectClass} w-24`}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            Flavour
            <select
              aria-label="Flavour"
              className={selectClass}
              value={mode}
              onChange={(e) => setMode(e.target.value as LoremMode)}
            >
              <option value="classic">Classic Latin</option>
              <option value="modern">Modern English</option>
            </select>
          </label>

          <label className="inline-flex items-center gap-1.5 pb-2 text-xs text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={startWithLorem}
              onChange={(e) => setStartWithLorem(e.target.checked)}
            />
            Start with “Lorem ipsum…”
          </label>

          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <RefreshCw size={14} />
            Shuffle
          </button>
        </section>

        <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-2">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Output</span>
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950"
            >
              <Copy size={13} />
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p
            aria-label="Generated text"
            className="whitespace-pre-wrap p-4 text-sm leading-relaxed text-slate-700 dark:text-slate-200"
          >
            {text}
          </p>
        </section>
      </main>
    </div>
  )
}

export default LoremApp
