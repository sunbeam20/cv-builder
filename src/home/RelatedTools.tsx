import { useMemo } from 'react'
import { ArrowRight, LayoutGrid } from 'lucide-react'
import { relatedTools, type ToolDefinition } from './tools'
import { goHome, openTool } from './navigation'

/**
 * Footer shown under every tool so a page is never a dead end: a few related
 * tools (curated + same-category) plus a route back to the hub.
 */
export function RelatedTools({ tool }: { tool: ToolDefinition }) {
  const related = useMemo(() => relatedTools(tool, 3), [tool])
  if (related.length === 0) return null

  return (
    <section aria-label="Related tools" className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-10">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">More tools you might like</h2>
          <button
            type="button"
            onClick={() => goHome()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <LayoutGrid size={13} />
            All tools
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {related.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => openTool(item.slug)}
                className="flex flex-col gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Icon size={17} />
                </span>
                <span className="flex items-center gap-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {item.name}
                  <ArrowRight size={13} className="text-slate-300" />
                </span>
                <span className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{item.tagline}</span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default RelatedTools
