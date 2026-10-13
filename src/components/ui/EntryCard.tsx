import type { ReactNode } from 'react'
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { IconButton } from './inputs'

interface EntryCardProps {
  title: string
  subtitle?: string
  onRemove: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  canMoveUp?: boolean
  canMoveDown?: boolean
  children: ReactNode
}

export function EntryCard({
  title,
  subtitle,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  children,
}: EntryCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/40 p-3">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-700">{title || 'Untitled'}</p>
          {subtitle ? <p className="truncate text-xs text-slate-400">{subtitle}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {onMoveUp ? (
            <IconButton onClick={onMoveUp} title="Move up" disabled={!canMoveUp}>
              <ChevronUp size={14} />
            </IconButton>
          ) : null}
          {onMoveDown ? (
            <IconButton onClick={onMoveDown} title="Move down" disabled={!canMoveDown}>
              <ChevronDown size={14} />
            </IconButton>
          ) : null}
          <IconButton onClick={onRemove} title="Remove" danger>
            <Trash2 size={14} />
          </IconButton>
        </div>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}
