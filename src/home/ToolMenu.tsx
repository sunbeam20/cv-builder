import { useEffect, useRef, useState } from 'react'
import { ChevronDown, LayoutGrid } from 'lucide-react'
import { toolsByCategory } from './tools'
import { openTool } from './navigation'

/**
 * Topbar "Tools" dropdown: every registered tool grouped by category. Live
 * tools open on click; tools that are not built yet are shown, dimmed, as
 * "Soon" so the roadmap is visible.
 */
export function ToolMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const groups = toolsByCategory()

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
      >
        <LayoutGrid size={14} />
        Tools
        <ChevronDown size={13} className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="All tools"
          className="absolute right-0 z-40 mt-2 max-h-[70vh] w-72 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 shadow-xl"
        >
          {groups.map(({ category, tools }) => {
            const CategoryIcon = category.icon
            return (
              <div key={category.id} className="mb-1">
                <p className="flex items-center gap-1.5 px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  <CategoryIcon size={11} />
                  {category.label}
                </p>
                {tools.map((tool) => {
                  const Icon = tool.icon
                  const soon = tool.status === 'soon'
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setOpen(false)
                        openTool(tool.slug)
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Icon size={14} className={soon ? 'text-slate-300' : 'text-indigo-500'} />
                      <span
                        className={`flex-1 truncate text-xs font-medium ${
                          soon ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {tool.name}
                      </span>
                      {soon ? (
                        <span className="text-[9px] font-semibold text-slate-300">Soon</span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export default ToolMenu
