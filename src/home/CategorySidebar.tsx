import { useState } from 'react'
import { ChevronDown, Home, LayoutGrid } from 'lucide-react'
import { BRAND } from './config'
import { goHome, openTool } from './navigation'
import { ThemeToggle } from './ThemeToggle'
import { toolsByCategory } from './tools'

const headerClass =
  'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300 transition hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-700 dark:hover:text-indigo-300'

const toolClass =
  'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-slate-600 dark:text-slate-300 transition hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-700 dark:hover:text-indigo-300'

/**
 * Full-height navigation rail pinned to the left edge on large screens. Each
 * category is a collapsible dropdown listing its tools; content is offset to
 * make room for the rail.
 */
export function CategorySidebar() {
  const groups = toolsByCategory()
  const total = groups.reduce((sum, group) => sum + group.tools.length, 0)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 lg:flex">
      <button
        type="button"
        onClick={() => goHome()}
        className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 px-4 py-4 text-sm font-semibold text-slate-800 dark:text-slate-100 transition hover:text-indigo-700 dark:hover:text-indigo-300"
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <Home size={15} />
        </span>
        {BRAND}
      </button>

      <nav aria-label="Tool categories" className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        <p className="px-2.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Categories
        </p>
        <button
          type="button"
          onClick={() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          className={headerClass}
        >
          <LayoutGrid size={14} className="shrink-0" />
          <span className="flex-1">All tools</span>
          <span className="text-slate-400 dark:text-slate-500">{total}</span>
        </button>

        {groups.map(({ category, tools }) => {
          const Icon = category.icon
          const open = expanded.has(category.id)
          return (
            <div key={category.id}>
              <button
                type="button"
                aria-expanded={open}
                onClick={() => toggle(category.id)}
                className={headerClass}
              >
                <Icon size={14} className="shrink-0" />
                <span className="flex-1 truncate">{category.label}</span>
                <span className="text-slate-400 dark:text-slate-500">{tools.length}</span>
                <ChevronDown size={13} className={`shrink-0 transition ${open ? 'rotate-180' : ''}`} />
              </button>

              {open ? (
                <ul className="mb-1 ml-3 flex flex-col gap-0.5 border-l border-slate-200 dark:border-slate-700 pl-2">
                  {tools.map((tool) => {
                    const ToolIcon = tool.icon
                    const soon = tool.status === 'soon'
                    return (
                      <li key={tool.id}>
                        <button
                          type="button"
                          disabled={soon}
                          aria-disabled={soon}
                          onClick={() => !soon && openTool(tool.slug)}
                          className={`${toolClass} ${soon ? 'cursor-not-allowed opacity-50' : ''}`}
                        >
                          <ToolIcon size={13} className="shrink-0 text-slate-400 dark:text-slate-500" />
                          <span className="flex-1 truncate">{tool.name}</span>
                          {soon ? (
                            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                              soon
                            </span>
                          ) : null}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              ) : null}
            </div>
          )
        })}
      </nav>

      <div className="flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 px-4 py-3">
        <span className="text-[10px] leading-relaxed text-slate-400 dark:text-slate-500">
          Everything runs on your device.
        </span>
        <ThemeToggle />
      </div>
    </aside>
  )
}

export default CategorySidebar
