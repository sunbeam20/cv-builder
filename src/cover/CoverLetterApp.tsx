import { useMemo, useState } from 'react'
import { Copy, Mail, Plus, Printer, Trash2 } from 'lucide-react'
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

const inputClass =
  'w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500'

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
    <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
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
    <div className="min-h-screen bg-slate-50">
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
                  letter.id === activeId ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <p className="truncate font-medium text-slate-800">{letterTitle(letter)}</p>
                <p className="truncate text-[11px] text-slate-400">{letter.date}</p>
              </button>
            ))}
          </div>
        </aside>

        <section className="flex flex-col gap-4">
          {active ? (
            <>
              <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2">
                {field('Job title', 'jobTitle', 'Product Designer')}
                {field('Company', 'company', 'Acme Inc.')}
                {field('Hiring manager', 'hiringManager', 'Alex Doe')}
                {field('Date', 'date')}
                <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 sm:col-span-2">
                  Opening
                  <textarea
                    aria-label="Opening"
                    rows={2}
                    className={`${inputClass} resize-y`}
                    value={active.opening}
                    onChange={(e) => patch({ opening: e.target.value })}
                  />
                </label>
                <div className="flex flex-wrap gap-1.5 sm:col-span-2">
                  {TONE_SNIPPETS.map((tone) => (
                    <button
                      key={tone.id}
                      type="button"
                      onClick={() => patch({ opening: tone.opening })}
                      className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50"
                    >
                      {tone.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => patch({ body: SAMPLE_BODY })}
                    className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50"
                  >
                    Sample body
                  </button>
                </div>
                <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 sm:col-span-2">
                  Body
                  <textarea
                    aria-label="Body"
                    rows={8}
                    className={`${inputClass} resize-y`}
                    value={active.body}
                    onChange={(e) => patch({ body: e.target.value })}
                  />
                </label>
                {field('Closing', 'closing')}
                <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                  Your name
                  <input
                    aria-label="Your name"
                    className={inputClass}
                    value={active.sender.name}
                    onChange={(e) => patch({ sender: { ...active.sender, name: e.target.value } })}
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                  Email
                  <input
                    aria-label="Sender email"
                    className={inputClass}
                    value={active.sender.email}
                    onChange={(e) => patch({ sender: { ...active.sender, email: e.target.value } })}
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                  Phone
                  <input
                    aria-label="Sender phone"
                    className={inputClass}
                    value={active.sender.phone}
                    onChange={(e) => patch({ sender: { ...active.sender, phone: e.target.value } })}
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                  Location
                  <input
                    aria-label="Sender location"
                    className={inputClass}
                    value={active.sender.location}
                    onChange={(e) => patch({ sender: { ...active.sender, location: e.target.value } })}
                  />
                </label>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
                  <span className="text-xs font-medium text-slate-400">
                    Preview · {letterWordCount(active)} words
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={copy}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <Copy size={13} /> Copy
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadBlob(new Blob([text], { type: 'text/plain' }), `${slug(letterTitle(active))}.txt`)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Download
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
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
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <pre className="whitespace-pre-wrap p-4 font-sans text-sm leading-relaxed text-slate-700">{text}</pre>
              </div>
            </>
          ) : (
            <p className="grid place-items-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
              Create a letter to get started.
            </p>
          )}
        </section>
      </main>
    </div>
  )
}

export default CoverLetterApp
