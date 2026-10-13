import { useMemo, useState } from 'react'
import { GitCompare } from 'lucide-react'
import { ToolHeader } from '../components/ui/ToolHeader'
import { diffLines, diffStats, diffWords } from './diff'

type Mode = 'lines' | 'words'

const textareaClass =
  'h-48 w-full resize-y rounded-lg border border-slate-200 bg-white p-3 font-mono text-xs leading-relaxed text-slate-700 outline-none focus:border-indigo-500'

export function DiffApp() {
  const [original, setOriginal] = useState('')
  const [changed, setChanged] = useState('')
  const [mode, setMode] = useState<Mode>('lines')
  const [ignoreCase, setIgnoreCase] = useState(false)
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false)

  const rows = useMemo(
    () => diffLines(original, changed, { ignoreCase, ignoreWhitespace }),
    [original, changed, ignoreCase, ignoreWhitespace],
  )
  const words = useMemo(
    () => diffWords(original, changed, { ignoreCase, ignoreWhitespace }),
    [original, changed, ignoreCase, ignoreWhitespace],
  )
  const stats = useMemo(() => diffStats(rows), [rows])
  const identical = stats.added === 0 && stats.removed === 0

  return (
    <div className="min-h-screen bg-slate-50">
      <ToolHeader
        icon={GitCompare}
        title="Text Diff"
        subtitle="Compare two blocks of text and see what changed."
      />

      <main className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Original
            <textarea
              aria-label="Original text"
              className={textareaClass}
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              placeholder="Paste the original text here…"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Changed
            <textarea
              aria-label="Changed text"
              className={textareaClass}
              value={changed}
              onChange={(e) => setChanged(e.target.value)}
              placeholder="Paste the changed text here…"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
            {(['lines', 'words'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded-md px-3 py-1.5 font-medium capitalize transition ${
                  mode === m ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <label className="inline-flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={ignoreCase}
              onChange={(e) => setIgnoreCase(e.target.checked)}
            />
            Ignore case
          </label>
          <label className="inline-flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={ignoreWhitespace}
              onChange={(e) => setIgnoreWhitespace(e.target.checked)}
            />
            Ignore whitespace
          </label>
          <span className="ml-auto flex items-center gap-3">
            <span className="text-emerald-600">+{stats.added}</span>
            <span className="text-rose-600">−{stats.removed}</span>
            <span className="text-slate-400">{stats.unchanged} unchanged</span>
          </span>
        </div>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {original === '' && changed === '' ? (
            <p className="p-6 text-center text-sm text-slate-400">
              Paste text into both boxes to see the differences.
            </p>
          ) : identical ? (
            <p className="p-6 text-center text-sm text-emerald-600">The texts are identical.</p>
          ) : mode === 'lines' ? (
            <div className="font-mono text-xs leading-relaxed">
              {rows.map((row, index) => (
                <div
                  key={index}
                  className={`flex ${
                    row.type === 'add'
                      ? 'bg-emerald-50'
                      : row.type === 'remove'
                        ? 'bg-rose-50'
                        : 'bg-white'
                  }`}
                >
                  <span className="w-10 shrink-0 select-none px-2 py-0.5 text-right text-slate-300">
                    {row.aLine ?? ''}
                  </span>
                  <span className="w-10 shrink-0 select-none px-2 py-0.5 text-right text-slate-300">
                    {row.bLine ?? ''}
                  </span>
                  <span
                    className={`w-4 shrink-0 select-none text-center ${
                      row.type === 'add'
                        ? 'text-emerald-600'
                        : row.type === 'remove'
                          ? 'text-rose-600'
                          : 'text-transparent'
                    }`}
                  >
                    {row.type === 'add' ? '+' : row.type === 'remove' ? '−' : ''}
                  </span>
                  <span className="whitespace-pre-wrap break-words px-1 py-0.5 text-slate-700">
                    {row.text || '\u00a0'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed text-slate-700">
              {words.map((token, index) => (
                <span
                  key={index}
                  className={
                    token.type === 'add'
                      ? 'rounded bg-emerald-100 text-emerald-800'
                      : token.type === 'remove'
                        ? 'rounded bg-rose-100 text-rose-700 line-through'
                        : ''
                  }
                >
                  {token.text}
                </span>
              ))}
            </p>
          )}
        </section>
      </main>
    </div>
  )
}

export default DiffApp
