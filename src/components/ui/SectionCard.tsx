import type { ReactNode } from 'react'
import { useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'

interface SectionCardProps {
  title: string
  count?: number
  onAdd?: () => void
  addLabel?: string
  children: ReactNode
  defaultOpen?: boolean
}

export function SectionCard({
  title,
  count,
  onAdd,
  addLabel = 'Add',
  children,
  defaultOpen = true,
}: SectionCardProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
      <header className="flex items-center justify-between gap-2 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex flex-1 items-center gap-2 text-left"
          aria-expanded={open}
        >
          <ChevronDown
            size={16}
            className={`text-slate-400 dark:text-slate-500 transition-transform ${open ? '' : '-rotate-90'}`}
          />
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</span>
          {typeof count === 'number' ? (
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {count}
            </span>
          ) : null}
        </button>
        {onAdd ? (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700"
          >
            <Plus size={14} />
            {addLabel}
          </button>
        ) : null}
      </header>
      {open ? <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-4">{children}</div> : null}
    </section>
  )
}
