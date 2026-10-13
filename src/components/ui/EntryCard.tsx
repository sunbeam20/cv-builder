import type { ReactNode } from 'react'
import { Trash2 } from 'lucide-react'
import { IconButton } from './inputs'

interface EntryCardProps {
  title: string
  subtitle?: string
  handle?: ReactNode
  onRemove: () => void
  children: ReactNode
}

export function EntryCard({ title, subtitle, handle, onRemove, children }: EntryCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/40 p-3">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {handle}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-700">{title || 'Untitled'}</p>
            {subtitle ? <p className="truncate text-xs text-slate-400">{subtitle}</p> : null}
          </div>
        </div>
        <IconButton onClick={onRemove} title="Remove" danger>
          <Trash2 size={14} />
        </IconButton>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}
