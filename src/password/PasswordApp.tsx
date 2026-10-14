import { useState } from 'react'
import { KeyRound, RefreshCw } from 'lucide-react'
import { ToolHeader } from '../components/ui/ToolHeader'
import { toast } from '../lib/toast'
import {
  DEFAULT_OPTIONS,
  LENGTH_MAX,
  LENGTH_MIN,
  generatePassphrase,
  generatePassword,
  passwordStrength,
  type PasswordOptions,
} from './generate'

const STRENGTH_STYLES = [
  { bar: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400' },
  { bar: 'bg-orange-500', text: 'text-orange-600' },
  { bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
  { bar: 'bg-lime-500', text: 'text-lime-600' },
  { bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
]

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 dark:text-indigo-400 focus:ring-indigo-500"
      />
      {label}
    </label>
  )
}

export function PasswordApp() {
  const [mode, setMode] = useState<'password' | 'passphrase'>('password')
  const [options, setOptions] = useState<PasswordOptions>(DEFAULT_OPTIONS)
  const [words, setWords] = useState(4)
  const [separator, setSeparator] = useState('-')
  const [value, setValue] = useState(() => generatePassword(DEFAULT_OPTIONS))

  const make = (m: typeof mode, o: PasswordOptions, w: number, s: string) =>
    m === 'password' ? generatePassword(o) : generatePassphrase(w, s || '-')

  const chooseMode = (m: typeof mode) => {
    setMode(m)
    setValue(make(m, options, words, separator))
  }

  const patch = (update: Partial<PasswordOptions>) => {
    const next = { ...options, ...update }
    setOptions(next)
    setValue(make(mode, next, words, separator))
  }

  const changeWords = (w: number) => {
    setWords(w)
    setValue(make(mode, options, w, separator))
  }

  const changeSeparator = (s: string) => {
    setSeparator(s)
    setValue(make(mode, options, words, s))
  }

  const regenerate = () => setValue(make(mode, options, words, separator))

  const strength = passwordStrength(value)
  const colors = STRENGTH_STYLES[strength.score]

  const copy = async () => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      toast.success('Copied to clipboard', { key: 'pw-copy' })
    } catch {
      toast.error('Couldn’t copy — select and copy manually')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800">
      <ToolHeader
        icon={KeyRound}
        title="Password Generator"
        subtitle="Create strong passwords and passphrases locally."
      />

      <main className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-6">
        <div className="inline-flex w-fit rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5 shadow-sm">
          {(['password', 'passphrase'] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => chooseMode(m)}
              className={`rounded-md px-4 py-1.5 text-xs font-medium capitalize transition ${
                mode === m ? 'bg-indigo-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <output className="min-w-0 flex-1 truncate rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-3 font-mono text-base text-slate-800 dark:text-slate-100">
              {value || '—'}
            </output>
            <button
              type="button"
              onClick={regenerate}
              aria-label="Generate another"
              title="Generate another"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <RefreshCw size={16} />
            </button>
            <button
              type="button"
              onClick={copy}
              className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-medium text-white hover:bg-indigo-700"
            >
              Copy
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className={`h-full rounded-full transition-all ${value ? colors.bar : ''}`}
                style={{ width: `${value ? ((strength.score + 1) / 5) * 100 : 0}%` }}
              />
            </div>
            <span className={`text-xs font-semibold ${value ? colors.text : 'text-slate-400 dark:text-slate-500'}`}>
              {value ? strength.label : '—'}
            </span>
            {value ? (
              <span className="text-[11px] text-slate-400 dark:text-slate-500">~{strength.entropy} bits</span>
            ) : null}
          </div>
        </section>

        {mode === 'password' ? (
          <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <label htmlFor="pw-length" className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Length
              </label>
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{options.length}</span>
            </div>
            <input
              id="pw-length"
              type="range"
              min={LENGTH_MIN}
              max={LENGTH_MAX}
              value={options.length}
              onChange={(e) => patch({ length: Number(e.target.value) })}
              className="mt-2 w-full accent-indigo-600"
            />

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Toggle
                label="Lowercase (a–z)"
                checked={options.lowercase}
                onChange={(v) => patch({ lowercase: v })}
              />
              <Toggle
                label="Uppercase (A–Z)"
                checked={options.uppercase}
                onChange={(v) => patch({ uppercase: v })}
              />
              <Toggle
                label="Numbers (0–9)"
                checked={options.numbers}
                onChange={(v) => patch({ numbers: v })}
              />
              <Toggle
                label="Symbols (!@#$…)"
                checked={options.symbols}
                onChange={(v) => patch({ symbols: v })}
              />
              <Toggle
                label="Avoid look-alike characters"
                checked={options.avoidAmbiguous}
                onChange={(v) => patch({ avoidAmbiguous: v })}
              />
            </div>
            {!options.lowercase &&
            !options.uppercase &&
            !options.numbers &&
            !options.symbols ? (
              <p className="mt-3 text-xs text-rose-600 dark:text-rose-400">Pick at least one character set.</p>
            ) : null}
          </section>
        ) : (
          <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <label htmlFor="pw-words" className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Words
              </label>
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{words}</span>
            </div>
            <input
              id="pw-words"
              type="range"
              min={3}
              max={8}
              value={words}
              onChange={(e) => changeWords(Number(e.target.value))}
              className="mt-2 w-full accent-indigo-600"
            />
            <label className="mt-5 block text-xs font-medium text-slate-600 dark:text-slate-300">
              Separator
              <input
                value={separator}
                onChange={(e) => changeSeparator(e.target.value.slice(0, 3))}
                className="mt-1 w-24 rounded-md border border-slate-200 dark:border-slate-700 px-2 py-1.5 text-sm outline-none focus:border-indigo-500"
              />
            </label>
          </section>
        )}

        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500">
          Generated with your browser’s secure RNG. Nothing is stored or sent anywhere.
        </p>
      </main>
    </div>
  )
}

export default PasswordApp
