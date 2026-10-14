import type { ReactNode } from 'react'
import {
  Archive,
  ArchiveRestore,
  Clock,
  Copy,
  ExternalLink,
  MapPin,
  Pencil,
  Star,
  Trash2,
  TriangleAlert,
} from 'lucide-react'
import type { Application, ApplicationStatus } from '../types'
import { APPLICATION_STATUSES, STATUS_LABELS } from '../lib/applications'
import { followUpInfo, isStale, relativeTime } from './model'

const STATUS_PILL: Record<ApplicationStatus, string> = {
  wishlist: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
  applied: 'bg-sky-100 text-sky-700',
  interview: 'bg-amber-100 text-amber-700',
  offer: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
}

export function Stars({
  value,
  onChange,
  size = 13,
}: {
  value: number
  onChange?: (priority: number) => void
  size?: number
}) {
  return (
    <span className="inline-flex items-center">
      {[1, 2, 3].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`Set priority ${n}`}
          aria-pressed={value >= n}
          disabled={!onChange}
          onClick={() => onChange?.(value === n ? 0 : n)}
          className={`${value >= n ? 'text-amber-400' : 'text-slate-300'} ${
            onChange ? 'hover:text-amber-500' : ''
          } disabled:cursor-default`}
        >
          <Star size={size} fill={value >= n ? 'currentColor' : 'none'} />
        </button>
      ))}
    </span>
  )
}

export function FollowUpBadge({ app, now }: { app: Application; now: Date }) {
  const info = followUpInfo(app, now)
  if (info.state === 'none') return null
  const tone =
    info.state === 'overdue'
      ? 'bg-rose-100 text-rose-700'
      : info.state === 'today'
        ? 'bg-amber-100 text-amber-700'
        : info.state === 'soon'
          ? 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${tone}`}>
      <Clock size={10} />
      {info.label}
    </span>
  )
}

function TagList({ tags, max }: { tags: string[]; max?: number }) {
  if (tags.length === 0) return null
  const shown = max ? tags.slice(0, max) : tags
  const extra = max ? tags.length - shown.length : 0
  return (
    <span className="flex flex-wrap gap-1">
      {shown.map((tag) => (
        <span key={tag} className="rounded bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
          {tag}
        </span>
      ))}
      {extra > 0 ? <span className="text-[10px] text-slate-400 dark:text-slate-500">+{extra}</span> : null}
    </span>
  )
}

/** Compact card used by the board columns. */
export function BoardCard({
  app,
  now,
  onOpen,
  handle,
}: {
  app: Application
  now: Date
  onOpen: () => void
  handle?: ReactNode
}) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 shadow-sm">
      <div className="flex items-start gap-1.5">
        {handle}
        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
          <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">{app.company || 'Untitled'}</p>
          <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{app.role || 'No role'}</p>
        </button>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        <Stars value={app.priority} size={11} />
        <FollowUpBadge app={app} now={now} />
        {isStale(app, now) ? (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-50 dark:bg-rose-950 px-1.5 py-0.5 text-[10px] font-medium text-rose-600 dark:text-rose-400">
            <TriangleAlert size={10} />
            stale
          </span>
        ) : null}
      </div>
      {app.tags.length > 0 ? (
        <div className="mt-1.5">
          <TagList tags={app.tags} max={2} />
        </div>
      ) : null}
    </div>
  )
}

export interface ApplicationCardProps {
  app: Application
  now: Date
  selected?: boolean
  onToggleSelect?: () => void
  onOpen: () => void
  onStatusChange: (status: ApplicationStatus) => void
  onStar: (priority: number) => void
  onDuplicate: () => void
  onArchive: () => void
  onDelete: () => void
}

/** Full card used by the list view. */
export function ApplicationCard({
  app,
  now,
  selected = false,
  onToggleSelect,
  onOpen,
  onStatusChange,
  onStar,
  onDuplicate,
  onArchive,
  onDelete,
}: ApplicationCardProps) {
  const stale = isStale(app, now)
  const updated = relativeTime(app.updatedAt || app.date, now)
  const href = app.url ? (app.url.startsWith('http') ? app.url : `https://${app.url}`) : ''

  return (
    <div
      className={`rounded-lg border bg-white dark:bg-slate-900 p-3 shadow-sm transition ${
        selected ? 'border-indigo-300 ring-1 ring-indigo-200' : 'border-slate-200 dark:border-slate-700'
      }`}
    >
      <div className="flex items-start gap-2.5">
        {onToggleSelect ? (
          <input
            type="checkbox"
            aria-label={`Select ${app.company || app.role || 'application'}`}
            checked={selected}
            onChange={onToggleSelect}
            className="mt-1"
          />
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpen}
              className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              {app.company || 'Untitled'}
            </button>
            <select
              aria-label={`Status for ${app.company || app.role || 'application'}`}
              value={app.status}
              onChange={(e) => onStatusChange(e.target.value as ApplicationStatus)}
              className={`rounded-full border-0 px-2 py-0.5 text-[11px] font-medium outline-none ${STATUS_PILL[app.status]}`}
            >
              {APPLICATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <Stars value={app.priority} onChange={onStar} />
            <FollowUpBadge app={app} now={now} />
            {stale ? (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-50 dark:bg-rose-950 px-1.5 py-0.5 text-[10px] font-medium text-rose-600 dark:text-rose-400">
                <TriangleAlert size={10} />
                stale
              </span>
            ) : null}
            {app.archived ? (
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                archived
              </span>
            ) : null}
          </div>

          <p className="mt-0.5 truncate text-xs text-slate-600 dark:text-slate-300">
            {app.role || 'No role'}
            {app.location ? (
              <span className="text-slate-400 dark:text-slate-500">
                {' '}
                · <MapPin size={10} className="inline" /> {app.location}
              </span>
            ) : null}
            {app.salary ? <span className="text-slate-400 dark:text-slate-500"> · {app.salary}</span> : null}
            {app.source ? <span className="text-slate-400 dark:text-slate-500"> · via {app.source}</span> : null}
          </p>

          {app.tags.length > 0 ? (
            <div className="mt-1.5">
              <TagList tags={app.tags} />
            </div>
          ) : null}

          {app.notes ? (
            <p className="mt-1.5 line-clamp-2 whitespace-pre-wrap text-[11px] text-slate-500 dark:text-slate-400">{app.notes}</p>
          ) : null}

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-slate-400 dark:text-slate-500">
            {app.date ? <span>Applied {app.date}</span> : null}
            {updated ? <span>Updated {updated}</span> : null}
            {app.contactName ? <span>Contact: {app.contactName}</span> : null}
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-0.5 font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <ExternalLink size={10} />
                Posting
              </a>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label={`Edit ${app.company || app.role || 'application'}`}
            title="Edit"
            onClick={onOpen}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <Pencil size={13} />
          </button>
          <button
            type="button"
            aria-label={`Duplicate ${app.company || app.role || 'application'}`}
            title="Duplicate"
            onClick={onDuplicate}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <Copy size={13} />
          </button>
          <button
            type="button"
            aria-label={app.archived ? 'Unarchive' : 'Archive'}
            title={app.archived ? 'Unarchive' : 'Archive'}
            onClick={onArchive}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950 hover:text-amber-600 dark:hover:text-amber-400"
          >
            {app.archived ? <ArchiveRestore size={13} /> : <Archive size={13} />}
          </button>
          <button
            type="button"
            aria-label={`Remove ${app.company || app.role || 'application'}`}
            title="Delete"
            onClick={onDelete}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ApplicationCard
