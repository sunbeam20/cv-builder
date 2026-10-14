import { useMemo, useState } from 'react'
import { Check, Copy, Palette } from 'lucide-react'
import { ToolHeader } from '../components/ui/ToolHeader'
import {
  contrastRatio,
  generateRamp,
  parseHex,
  rgbToHex,
  toCssVariables,
  toTailwind,
  wcagLevel,
} from './color'

type OutputFormat = 'css' | 'tailwind'

function Swatch({ hex, label, onPick }: { hex: string; label: string; onPick?: (hex: string) => void }) {
  const copy = () => {
    void navigator.clipboard.writeText(hex)
  }
  return (
    <button
      type="button"
      onClick={onPick ? () => onPick(hex) : copy}
      title={hex}
      className="flex flex-col items-stretch overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 text-left shadow-sm"
    >
      <span className="h-16 w-full" style={{ backgroundColor: hex }} />
      <span className="bg-white dark:bg-slate-900 px-2 py-1">
        <span className="block text-[10px] font-medium text-slate-400 dark:text-slate-500">{label}</span>
        <span className="block font-mono text-[11px] text-slate-600 dark:text-slate-300">{hex}</span>
      </span>
    </button>
  )
}

export function ColorApp() {
  const [baseHex, setBaseHex] = useState('#4f46e5')
  const [fgHex, setFgHex] = useState('#ffffff')
  const [bgHex, setBgHex] = useState('#4f46e5')
  const [format, setFormat] = useState<OutputFormat>('css')
  const [copied, setCopied] = useState(false)

  const base = useMemo(() => parseHex(baseHex) ?? { r: 79, g: 70, b: 229 }, [baseHex])
  const ramp = useMemo(() => generateRamp(base), [base])
  const output = useMemo(
    () => (format === 'css' ? toCssVariables(ramp) : toTailwind(ramp)),
    [format, ramp],
  )

  const fg = parseHex(fgHex)
  const bg = parseHex(bgHex)
  const ratio = fg && bg ? contrastRatio(fg, bg) : null
  const level = ratio !== null ? wcagLevel(ratio) : null

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800">
      <ToolHeader
        icon={Palette}
        title="Color Studio"
        subtitle="Build palettes and check accessibility contrast."
      />

      <main className="mx-auto flex max-w-4xl flex-col gap-5 px-4 py-6">
        <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex flex-wrap items-end gap-4">
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
              Base color
              <span className="flex items-center gap-2">
                <input
                  type="color"
                  aria-label="Base color picker"
                  value={parseHex(baseHex) ? baseHex : '#4f46e5'}
                  onChange={(e) => setBaseHex(e.target.value)}
                  className="h-9 w-10 cursor-pointer rounded border border-slate-200 dark:border-slate-700"
                />
                <input
                  aria-label="Base color hex"
                  value={baseHex}
                  onChange={(e) => setBaseHex(e.target.value)}
                  className="w-28 rounded-md border border-slate-200 dark:border-slate-700 px-2.5 py-2 font-mono text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500"
                />
              </span>
            </label>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-11">
            {ramp.map((entry) => (
              <Swatch key={entry.step} hex={entry.hex} label={String(entry.step)} />
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Contrast checker</h2>
          <div className="flex flex-wrap items-end gap-4">
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
              Text
              <input
                aria-label="Text color"
                value={fgHex}
                onChange={(e) => setFgHex(e.target.value)}
                className="w-28 rounded-md border border-slate-200 dark:border-slate-700 px-2.5 py-2 font-mono text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
              Background
              <input
                aria-label="Background color"
                value={bgHex}
                onChange={(e) => setBgHex(e.target.value)}
                className="w-28 rounded-md border border-slate-200 dark:border-slate-700 px-2.5 py-2 font-mono text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500"
              />
            </label>
            <div
              className="flex h-16 flex-1 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 px-4 text-sm font-medium"
              style={{
                color: fg ? rgbToHex(fg) : '#000',
                backgroundColor: bg ? rgbToHex(bg) : '#fff',
              }}
            >
              The quick brown fox
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {ratio !== null ? `${ratio.toFixed(2)}:1` : '—'}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  level === 'Fail'
                    ? 'bg-rose-100 text-rose-700'
                    : level
                      ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {level ?? 'Invalid'}
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-2">
            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5">
              {(['css', 'tailwind'] as OutputFormat[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition ${
                    format === f ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {f === 'css' ? 'CSS variables' : 'Tailwind'}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={copyOutput}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-200">
            {output}
          </pre>
        </section>

        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500">
          Click any swatch to copy its hex. Contrast follows the WCAG 2.1 formula.
        </p>
      </main>
    </div>
  )
}

export default ColorApp
