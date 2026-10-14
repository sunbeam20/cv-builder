import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { CornerDownLeft, Search } from 'lucide-react'
import { CATEGORY_BY_ID, LIVE_TOOLS, searchTools, type ToolDefinition } from './tools'
import { openTool } from './navigation'

const LIST_ID = 'tool-search-results'

/**
 * Topbar tool search: an input with a results popover. Typing filters all tools
 * by name, tagline, slug, category, and features; focusing with no query offers
 * a quick-open list of live tools. Fully keyboard driven (↑ ↓ Enter Escape).
 */
export function ToolSearch({ className = '' }: { className?: string }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const results = useMemo<ToolDefinition[]>(
    () => (query.trim() ? searchTools(query) : LIVE_TOOLS),
    [query],
  )

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

  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setActive((i) => Math.min(i + 1, results.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (event.key === 'Enter') {
      const tool = results[active]
      if (tool) {
        event.preventDefault()
        choose(tool)
      }
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Search size={14} className="pointer-events-none absolute left-2.5 top-[9px] text-slate-400 dark:text-slate-500" />
      <input
        type="search"
        role="combobox"
        aria-expanded={open}
        aria-controls={LIST_ID}
        aria-autocomplete="list"
        aria-label="Search tools"
        placeholder="Search tools…"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setActive(0)
          setOpen(true)
        }}
        onFocus={() => {
          setActive(0)
          setOpen(true)
        }}
        onKeyDown={onKeyDown}
        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-8 pr-3 text-xs text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />

      {open ? (
        <div
          id={LIST_ID}
          role="listbox"
          aria-label="Tool results"
          className="absolute right-0 z-40 mt-2 max-h-80 w-full min-w-[16rem] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 shadow-xl"
        >
          {results.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
              No tools match “{query}”.
            </p>
          ) : (
            <>
              {!query.trim() ? (
                <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Quick open
                </p>
              ) : null}
              {results.map((tool, index) => {
                const Icon = tool.icon
                const label = CATEGORY_BY_ID.get(tool.category)?.label
                const soon = tool.status === 'soon'
                return (
                  <button
                    key={tool.id}
                    type="button"
                    role="option"
                    aria-selected={index === active}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => choose(tool)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition ${
                      index === active ? 'bg-indigo-50 dark:bg-indigo-950' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span
                      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                        soon ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500' : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                      }`}
                    >
                      <Icon size={14} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
                          {tool.name}
                        </span>
                        {soon ? (
                          <span className="rounded bg-slate-100 dark:bg-slate-800 px-1 py-0.5 text-[9px] font-semibold text-slate-400 dark:text-slate-500">
                            Soon
                          </span>
                        ) : null}
                      </span>
                      <span className="block truncate text-[11px] text-slate-400 dark:text-slate-500">
                        {label} · {tool.tagline}
                      </span>
                    </span>
                    {index === active ? (
                      <CornerDownLeft size={13} className="shrink-0 text-slate-300" />
                    ) : null}
                  </button>
                )
              })}
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default ToolSearch
