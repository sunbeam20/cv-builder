import { useMemo, useState } from 'react'
import { Braces, Copy, Download } from 'lucide-react'
import { ToolHeader } from '../components/ui/ToolHeader'
import { toast } from '../lib/toast'
import { downloadBlob } from '../lib/helpers'
import { csvToJson, formatJson, jsonToCsv, minifyJson, type JsonResult } from './model'

type Mode = 'format' | 'minify' | 'json-csv' | 'csv-json'

const MODES: { id: Mode; label: string }[] = [
  { id: 'format', label: 'Format JSON' },
  { id: 'minify', label: 'Minify JSON' },
  { id: 'json-csv', label: 'JSON → CSV' },
  { id: 'csv-json', label: 'CSV → JSON' },
]

const SAMPLE = '[\n  { "name": "Ada", "role": "Engineer" },\n  { "name": "Linus", "role": "Maintainer" }\n]'

export function JsonApp() {
  const [mode, setMode] = useState<Mode>('format')
  const [input, setInput] = useState(SAMPLE)

  const result: JsonResult = useMemo(() => {
    if (mode === 'format') return formatJson(input)
    if (mode === 'minify') return minifyJson(input)
    if (mode === 'json-csv') return jsonToCsv(input)
    return csvToJson(input)
  }, [mode, input])

  const output = result.ok && typeof result.value === 'string' ? result.value : ''

  const copy = async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      toast.success('Copied to clipboard')
    } catch {
      toast.error('Clipboard unavailable')
    }
  }

  const download = () => {
    if (!output) return
    const isCsv = mode === 'json-csv'
    downloadBlob(new Blob([output], { type: isCsv ? 'text/csv' : 'application/json' }), isCsv ? 'data.csv' : 'data.json')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ToolHeader icon={Braces} title="JSON & CSV Studio" subtitle="Format, validate, and convert between JSON and CSV." />

      <main className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6">
        <div className="inline-flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-white p-1">
          {MODES.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={mode === option.id}
              onClick={() => setMode(option.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                mode === option.id ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Input</span>
              <button
                type="button"
                onClick={() => setInput(mode === 'csv-json' ? 'name,role\nAda,Engineer' : SAMPLE)}
                className="text-xs text-slate-400 hover:text-indigo-600"
              >
                Load sample
              </button>
            </div>
            <textarea
              aria-label="Input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              className="min-h-[45vh] w-full resize-y rounded-xl border border-slate-200 bg-white p-4 font-mono text-sm text-slate-700 outline-none focus:border-indigo-500"
            />
          </section>

          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Output</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copy}
                  disabled={!output}
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  <Copy size={13} /> Copy
                </button>
                <button
                  type="button"
                  onClick={download}
                  disabled={!output}
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  <Download size={13} /> Download
                </button>
              </div>
            </div>
            {result.ok ? (
              <textarea
                aria-label="Output"
                readOnly
                value={output}
                spellCheck={false}
                className="min-h-[45vh] w-full resize-y rounded-xl border border-emerald-200 bg-white p-4 font-mono text-sm text-slate-700 outline-none"
              />
            ) : (
              <p
                role="alert"
                className="min-h-[45vh] rounded-xl border border-red-200 bg-red-50 p-4 font-mono text-sm text-red-600"
              >
                {result.error}
              </p>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default JsonApp
