import { useEffect, useMemo, useRef, useState } from 'react'
import { CornerDownLeft, Search } from 'lucide-react'
import { CATEGORY_BY_ID, searchTools, type ToolDefinition } from './tools'
import { openTool } from './navigation'

/** Quick intents surfaced as one-tap chips below the prompt. */
const EXAMPLES: { label: string; slug: string }[] = [
  { label: 'Build my CV', slug: 'cv' },
  { label: 'Split a bill', slug: 'split' },
  { label: 'Make a favicon', slug: 'favicon' },
  { label: 'Write a cover letter', slug: 'cover-letter' },
  { label: 'Track applications', slug: 'jobs' },
]

/**
 * "What do you want to do?" entry point: a plain-language search over the tool
 * registry (intent aliases included) with example chips that jump straight in.
 */
export function HeroPrompt() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const results = useMemo(() => searchTools(query).slice(0, 4), [query])

  useEffect(() => {
    if (!open) return
    const onDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const choose = (tool: ToolDefinition) => {
    setOpen(false)
    setQuery('')
    openTool(tool.slug)
  }

  return (
    <div ref={containerRef} className="relative mt-6 max-w-xl">
      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">What do you want to do?</p>
      <div className="relative mt-2">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        <input
          type="search"
          aria-label="What do you want to do?"
          placeholder="Describe a task — e.g. split a bill, make a logo…"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 pl-9 pr-3 text-sm text-slate-700 dark:text-slate-200 shadow-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />

        {open && query.trim() ? (
          <div
            role="listbox"
            aria-label="Suggested tools"
            className="absolute left-0 right-0 z-40 mt-2 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 shadow-xl"
          >
            {results.length ? (
              results.map((tool) => {
                const Icon = tool.icon
                const category = CATEGORY_BY_ID.get(tool.category)?.label
                return (
                  <button
                    key={tool.id}
                    type="button"
                    role="option"
                    aria-selected={false}
                    onClick={() => choose(tool)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                      <Icon size={14} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-slate-800 dark:text-slate-100">{tool.name}</span>
                      <span className="block truncate text-[11px] text-slate-400 dark:text-slate-500">
                        {category} · {tool.tagline}
                      </span>
                    </span>
                    <CornerDownLeft size={13} className="shrink-0 text-slate-300" />
                  </button>
                )
              })
            ) : (
              <p className="px-3 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
                No match — try “CV”, “invoice”, or “favicon”.
              </p>
            )}
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example.slug}
            type="button"
            onClick={() => openTool(example.slug)}
            className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 transition hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            {example.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default HeroPrompt
