import { useMemo, useState } from 'react'
import { Copy, Mail, Plus, Printer, Trash2, FileDown } from 'lucide-react'
import { ToolHeader } from '../components/ui/ToolHeader'
import { toast } from '../lib/toast'
import { downloadBlob, slug } from '../lib/helpers'
import { useCoverStore } from './store'
import {
  SAMPLE_BODY,
  TONE_SNIPPETS,
  letterTitle,
  letterWordCount,
  renderLetter,
  sortLetters,
  type CoverLetter,
} from './model'
import { AiButton } from '../components/ui/AiButton'

const inputClass =
  'w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-2 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500'

export function CoverLetterApp() {
  const letters = useCoverStore((s) => s.letters)
  const addLetter = useCoverStore((s) => s.addLetter)
  const updateLetter = useCoverStore((s) => s.updateLetter)
  const removeLetter = useCoverStore((s) => s.removeLetter)

  const sorted = useMemo(() => sortLetters(letters), [letters])
  const [activeId, setActiveId] = useState<string | null>(() => letters[0]?.id ?? null)
  const active = letters.find((letter) => letter.id === activeId) ?? null
  const text = active ? renderLetter(active) : ''

  const patch = (updater: Partial<CoverLetter>) => {
    if (activeId) updateLetter(activeId, updater)
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Letter copied')
    } catch {
      toast.error('Clipboard unavailable')
    }
  }

  const field = (label: string, key: keyof CoverLetter & ('company' | 'jobTitle' | 'hiringManager' | 'date' | 'closing'), placeholder = '') => (
    <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
      {label}
      <input
        aria-label={label}
        className={inputClass}
        placeholder={placeholder}
        value={(active?.[key] as string) ?? ''}
        onChange={(e) => patch({ [key]: e.target.value })}
      />
    </label>
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800">
      <ToolHeader icon={Mail} title="Cover Letter Builder" subtitle="Write a tailored cover letter with reusable snippets." />

      <main className="mx-auto grid max-w-5xl gap-4 px-4 py-6 md:grid-cols-[15rem_1fr]">
        <aside className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setActiveId(addLetter())}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            <Plus size={15} /> New letter
          </button>
          <div className="flex flex-col gap-1.5">
            {sorted.map((letter) => (
              <button
                key={letter.id}
                type="button"
                onClick={() => setActiveId(letter.id)}
                className={`rounded-lg border p-2 text-left text-sm ${
                  letter.id === activeId ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-950' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <p className="truncate font-medium text-slate-800 dark:text-slate-100">{letterTitle(letter)}</p>
                <p className="truncate text-[11px] text-slate-400 dark:text-slate-500">{letter.date}</p>
              </button>
            ))}
          </div>
        </aside>

        <section className="flex flex-col gap-4">
          {active ? (
            <>
              <div className="grid gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm sm:grid-cols-2">
                {field('Job title', 'jobTitle', 'Product Designer')}
                {field('Company', 'company', 'Acme Inc.')}
                {field('Hiring manager', 'hiringManager', 'Alex Doe')}
                {field('Date', 'date')}
                <div className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 sm:col-span-2">
                  <span className="flex items-center justify-between">
                    <span>Style</span>
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                      <span>Font</span>
                      <select
                        aria-label="Font"
                        className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs"
                        value={active.font}
                        onChange={(e) => patch({ font: e.target.value as 'sans' | 'serif' })}
                      >
                        <option value="sans">Sans</option>
                        <option value="serif">Serif</option>
                      </select>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                      <span>Accent</span>
                      <input
                        aria-label="Accent color"
                        type="color"
                        className="h-8 w-12 rounded border border-slate-200 dark:border-slate-700"
                        value={active.accent}
                        onChange={(e) => patch({ accent: e.target.value })}
                      />
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                      <span>Margin (pt)</span>
                      <input
                        aria-label="Margin"
                        type="number"
                        min={10}
                        max={120}
                        className="w-20 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs"
                        value={active.margin}
                        onChange={(e) => patch({ margin: Number(e.target.value) })}
                      />
                    </label>
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 sm:col-span-2">
                  <span className="flex items-center justify-between">
                    <span>Opening</span>
                    <AiButton
                      text={active.opening}
                      onResult={(text) => patch({ opening: text })}
                      instruction="Rewrite the cover letter opening to be tailored, professional and compelling."
                      context={`${active.jobTitle} at ${active.company}`}
                      label="Improve"
                    />
                  </span>
                  <textarea
                    aria-label="Opening"
                    rows={2}
                    className={`${inputClass} resize-y`}
                    value={active.opening}
                    onChange={(e) => patch({ opening: e.target.value })}
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 sm:col-span-2">
                  {TONE_SNIPPETS.map((tone) => (
                    <button
                      key={tone.id}
                      type="button"
                      onClick={() => patch({ opening: tone.opening })}
                      className="rounded-full border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      {tone.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => patch({ body: SAMPLE_BODY })}
                    className="rounded-full border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Sample body
                  </button>
                </div>
                <div className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 sm:col-span-2">
                  <span className="flex items-center justify-between">
                    <span>Body</span>
                    <AiButton
                      text={active.body}
                      onResult={(text) => patch({ body: text })}
                      instruction="Rewrite the cover letter body to be concise, specific with measurable results, and aligned to the job."
                      context={`${active.jobTitle} at ${active.company}`}
                      label="Improve"
                    />
                  </span>
                  <textarea
                    aria-label="Body"
                    rows={8}
                    className={`${inputClass} resize-y`}
                    value={active.body}
                    onChange={(e) => patch({ body: e.target.value })}
                  />
                </div>
                {field('Closing', 'closing')}
                <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                  Your name
                  <input
                    aria-label="Your name"
                    className={inputClass}
                    value={active.sender.name}
                    onChange={(e) => patch({ sender: { ...active.sender, name: e.target.value } })}
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                  Email
                  <input
                    aria-label="Sender email"
                    className={inputClass}
                    value={active.sender.email}
                    onChange={(e) => patch({ sender: { ...active.sender, email: e.target.value } })}
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                  Phone
                  <input
                    aria-label="Sender phone"
                    className={inputClass}
                    value={active.sender.phone}
                    onChange={(e) => patch({ sender: { ...active.sender, phone: e.target.value } })}
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                  Location
                  <input
                    aria-label="Sender location"
                    className={inputClass}
                    value={active.sender.location}
                    onChange={(e) => patch({ sender: { ...active.sender, location: e.target.value } })}
                  />
                </label>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-2">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                    Preview · {letterWordCount(active)} words
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={copy}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Copy size={13} /> Copy
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const [{ pdf }, { CoverLetterPdf }] = await Promise.all([
                            import('@react-pdf/renderer'),
                            import('./CoverLetterPdf'),
                          ])
                          const blob = await pdf(<CoverLetterPdf letter={active} />).toBlob()
                          downloadBlob(blob, `${slug(letterTitle(active))}.pdf`)
                        } catch {
                          toast.error('Failed to export PDF')
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <FileDown size={13} /> Export PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadBlob(new Blob([text], { type: 'text/plain' }), `${slug(letterTitle(active))}.txt`)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Download .txt
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Printer size={13} /> Print
                    </button>
                    <button
                      type="button"
                      aria-label="Delete letter"
                      onClick={() => {
                        toast.confirm({
                          message: 'Delete this letter?',
                          tone: 'error',
                          confirmLabel: 'Delete',
                          onConfirm: () => {
                            removeLetter(active.id)
                            setActiveId(null)
                          },
                        })
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-red-300 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <pre className="whitespace-pre-wrap p-4 font-sans text-sm leading-relaxed text-slate-700 dark:text-slate-200">{text}</pre>
              </div>
            </>
          ) : (
            <p className="grid place-items-center rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-8 text-center text-sm text-slate-400 dark:text-slate-500">
              Create a letter to get started.
            </p>
          )}
        </section>
      </main>
    </div>
  )
}

export default CoverLetterApp
