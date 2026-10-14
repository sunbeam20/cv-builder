import { useMemo, useState } from 'react'
import { Copy, Download, Eye, NotebookPen, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { ToolHeader } from '../components/ui/ToolHeader'
import { toast } from '../lib/toast'
import { downloadBlob, slug } from '../lib/helpers'
import { useNotesStore } from './store'
import { noteExcerpt, noteTitle, noteWords, sortNotes } from './model'
import { renderMarkdown } from './markdown'

type ViewMode = 'write' | 'split' | 'preview'

export function NotesApp() {
  const notes = useNotesStore((s) => s.notes)
  const addNote = useNotesStore((s) => s.addNote)
  const updateNote = useNotesStore((s) => s.updateNote)
  const removeNote = useNotesStore((s) => s.removeNote)

  const [activeId, setActiveId] = useState<string | null>(() => notes[0]?.id ?? null)
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<ViewMode>('split')

  const sorted = useMemo(() => sortNotes(notes), [notes])
  const filtered = useMemo(
    () =>
      sorted.filter((note) => {
        const haystack = `${noteTitle(note)} ${note.content}`.toLowerCase()
        return haystack.includes(query.trim().toLowerCase())
      }),
    [sorted, query],
  )
  const active = notes.find((note) => note.id === activeId) ?? null
  const html = useMemo(() => renderMarkdown(active?.content ?? ''), [active?.content])

  const createNew = () => {
    setActiveId(addNote('# New note\n\n'))
  }

  const remove = (id: string) => {
    toast.confirm({
      message: 'Delete this note?',
      tone: 'error',
      confirmLabel: 'Delete',
      onConfirm: () => {
        removeNote(id)
        if (activeId === id) setActiveId(null)
      },
    })
  }

  const exportNote = () => {
    if (!active) return
    downloadBlob(new Blob([active.content], { type: 'text/markdown' }), `${slug(noteTitle(active))}.md`)
  }

  const copy = async () => {
    if (!active) return
    try {
      await navigator.clipboard.writeText(active.content)
      toast.success('Markdown copied')
    } catch {
      toast.error('Clipboard unavailable')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800">
      <ToolHeader icon={NotebookPen} title="Markdown Notes" subtitle="Write in Markdown with a live preview and export." />

      <main className="mx-auto grid max-w-5xl gap-4 px-4 py-6 md:grid-cols-[16rem_1fr]">
        <aside className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                aria-label="Search notes"
                value={query}
                placeholder="Search"
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-7 pr-2 text-sm outline-none focus:border-indigo-500"
              />
            </div>
            <button
              type="button"
              aria-label="New note"
              onClick={createNew}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-indigo-600 text-white hover:bg-indigo-500"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="flex max-h-[60vh] flex-col gap-1.5 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="p-3 text-center text-xs text-slate-400 dark:text-slate-500">No notes match.</p>
            ) : (
              filtered.map((note) => (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => setActiveId(note.id)}
                  className={`rounded-lg border p-2 text-left transition ${
                    note.id === activeId
                      ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-950'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{noteTitle(note)}</p>
                  <p className="truncate text-[11px] text-slate-400 dark:text-slate-500">{noteExcerpt(note) || 'Empty note'}</p>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="flex min-h-[60vh] flex-col gap-3">
          {active ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5">
                  {(['write', 'split', 'preview'] as ViewMode[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={mode === option}
                      onClick={() => setMode(option)}
                      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium capitalize ${
                        mode === option ? 'bg-indigo-600 text-white' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {option === 'write' ? <Pencil size={12} /> : <Eye size={12} />}
                      {option}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500">{noteWords(active)} words</span>
                <div className="ml-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={copy}
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Copy size={13} /> Copy
                  </button>
                  <button
                    type="button"
                    onClick={exportNote}
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Download size={13} /> .md
                  </button>
                  <button
                    type="button"
                    aria-label="Delete note"
                    onClick={() => remove(active.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-red-300 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className={`grid flex-1 gap-3 ${mode === 'split' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
                {mode !== 'preview' ? (
                  <textarea
                    aria-label="Markdown"
                    value={active.content}
                    onChange={(e) => updateNote(active.id, e.target.value)}
                    spellCheck={false}
                    className="min-h-[50vh] w-full resize-y rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 font-mono text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500"
                  />
                ) : null}
                {mode !== 'write' ? (
                  <div
                    aria-label="Preview"
                    className="markdown-body min-h-[50vh] overflow-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm text-slate-700 dark:text-slate-200"
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                ) : null}
              </div>
            </>
          ) : (
            <p className="grid flex-1 place-items-center rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-8 text-center text-sm text-slate-400 dark:text-slate-500">
              Select a note or create a new one.
            </p>
          )}
        </section>
      </main>
    </div>
  )
}

export default NotesApp
