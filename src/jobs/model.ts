import type { Application, ApplicationStatus } from '../types'
import { APPLICATION_STATUSES, STATUS_LABELS } from '../lib/applications'
import { uid } from '../lib/helpers'

/* ------------------------------------------------------------------ dates */

export function parseDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (!match) return null
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(date.getTime()) ? null : date
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/** Whole days from `from` to `to` (positive when `to` is later). */
export function daysBetween(from: Date, to: Date): number {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / 86_400_000)
}

export function appliedDate(app: Application): Date | null {
  const parsed = parseDateOnly(app.date)
  if (parsed) return parsed
  if (app.createdAt) {
    const d = new Date(app.createdAt)
    if (!Number.isNaN(d.getTime())) return d
  }
  return null
}

export function updatedDate(app: Application): Date | null {
  if (app.updatedAt) {
    const d = new Date(app.updatedAt)
    if (!Number.isNaN(d.getTime())) return d
  }
  return appliedDate(app)
}

export function formatDate(value: string): string {
  if (!value) return ''
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? parseDateOnly(value) : new Date(value)
  if (!date || Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function relativeTime(value: string, now: Date = new Date()): string {
  if (!value) return ''
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? parseDateOnly(value) : new Date(value)
  if (!date || Number.isNaN(date.getTime())) return ''
  const diff = daysBetween(date, now)
  if (diff === 0) return 'today'
  if (diff < 0) {
    const soon = -diff
    return soon === 1 ? 'tomorrow' : `in ${soon} days`
  }
  if (diff === 1) return 'yesterday'
  if (diff < 7) return `${diff} days ago`
  if (diff < 30) {
    const weeks = Math.round(diff / 7)
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`
  }
  if (diff < 365) {
    const months = Math.round(diff / 30)
    return `${months} month${months === 1 ? '' : 's'} ago`
  }
  const years = Math.round(diff / 365)
  return `${years} year${years === 1 ? '' : 's'} ago`
}

/* --------------------------------------------------------------- priority */

export const MAX_PRIORITY = 3

export function priorityLabel(priority: number): string {
  if (priority >= 3) return 'High'
  if (priority === 2) return 'Medium'
  if (priority === 1) return 'Low'
  return 'None'
}

/* ------------------------------------------------------------- normalize */

/** Fill in any fields missing from an older or partial record. */
export function normalizeApplication(raw: Partial<Application>): Application {
  const now = new Date().toISOString()
  const status =
    raw.status && APPLICATION_STATUSES.includes(raw.status) ? raw.status : 'wishlist'
  const createdAt = raw.createdAt || raw.date || now
  const history =
    Array.isArray(raw.history) && raw.history.length > 0
      ? raw.history
      : [{ id: uid(), status, at: createdAt }]
  return {
    id: raw.id ?? uid(),
    company: raw.company ?? '',
    role: raw.role ?? '',
    location: raw.location ?? '',
    url: raw.url ?? '',
    status,
    date: raw.date ?? '',
    notes: raw.notes ?? '',
    salary: raw.salary ?? '',
    source: raw.source ?? '',
    priority: typeof raw.priority === 'number' ? raw.priority : 0,
    contactName: raw.contactName ?? '',
    contactEmail: raw.contactEmail ?? '',
    followUpDate: raw.followUpDate ?? '',
    tags: Array.isArray(raw.tags) ? raw.tags.filter((tag) => tag.trim() !== '') : [],
    description: raw.description ?? '',
    resumeVersion: raw.resumeVersion ?? '',
    createdAt,
    updatedAt: raw.updatedAt ?? createdAt,
    history,
    archived: Boolean(raw.archived),
  }
}

/* --------------------------------------------------------------- follow-up */

export type FollowUpState = 'none' | 'overdue' | 'today' | 'soon' | 'scheduled'

export interface FollowUpInfo {
  state: FollowUpState
  /** Days until the follow-up (negative when overdue); null when unset. */
  days: number | null
  label: string
}

export function followUpInfo(app: Application, now: Date = new Date(), soonDays = 3): FollowUpInfo {
  const date = parseDateOnly(app.followUpDate)
  if (!date) return { state: 'none', days: null, label: '' }
  const days = daysBetween(now, date)
  if (days < 0) {
    const overdue = -days
    return { state: 'overdue', days, label: `${overdue}d overdue` }
  }
  if (days === 0) return { state: 'today', days, label: 'Due today' }
  if (days <= soonDays) return { state: 'soon', days, label: `Due in ${days}d` }
  return { state: 'scheduled', days, label: formatDate(app.followUpDate) }
}

/** Applications that are actively waiting on a response. */
export function isOpen(app: Application): boolean {
  return !app.archived && (app.status === 'applied' || app.status === 'interview')
}

export function isStale(app: Application, now: Date = new Date(), days = 14): boolean {
  if (!isOpen(app) || app.status !== 'applied') return false
  const date = updatedDate(app)
  if (!date) return false
  return daysBetween(date, now) >= days
}

/* ---------------------------------------------------------------- counts */

export function countByStatus(apps: Application[]): Record<ApplicationStatus, number> {
  const counts = {
    wishlist: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
  } as Record<ApplicationStatus, number>
  for (const app of apps) counts[app.status] += 1
  return counts
}

export function collectTags(apps: Application[]): string[] {
  const tags = new Set<string>()
  for (const app of apps) {
    for (const tag of app.tags) {
      const trimmed = tag.trim()
      if (trimmed) tags.add(trimmed)
    }
  }
  return [...tags].sort((a, b) => a.localeCompare(b))
}

/* ---------------------------------------------------------------- filter */

export interface ApplicationFilters {
  query?: string
  status?: ApplicationStatus | 'all'
  tag?: string | null
  starredOnly?: boolean
  followUpOnly?: boolean
  needsAttention?: boolean
  includeArchived?: boolean
}

export function filterApplications(
  apps: Application[],
  filters: ApplicationFilters = {},
): Application[] {
  const {
    query = '',
    status = 'all',
    tag = null,
    starredOnly = false,
    followUpOnly = false,
    needsAttention = false,
    includeArchived = false,
  } = filters
  const q = query.trim().toLowerCase()

  return apps.filter((app) => {
    if (!includeArchived && app.archived) return false
    if (status !== 'all' && app.status !== status) return false
    if (starredOnly && app.priority <= 0) return false
    if (tag && !app.tags.includes(tag)) return false
    if (followUpOnly) {
      const info = followUpInfo(app)
      if (info.state !== 'overdue' && info.state !== 'today') return false
    }
    if (needsAttention) {
      const info = followUpInfo(app)
      const due = info.state === 'overdue' || info.state === 'today'
      if (!due && !isStale(app)) return false
    }
    if (!q) return true
    const haystack = [
      app.company,
      app.role,
      app.location,
      app.notes,
      app.source,
      app.salary,
      app.contactName,
      app.contactEmail,
      app.resumeVersion,
      app.description,
      app.tags.join(' '),
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
}

/* ------------------------------------------------------------------ sort */

export type SortKey =
  | 'updated-desc'
  | 'updated-asc'
  | 'applied-desc'
  | 'applied-asc'
  | 'priority-desc'
  | 'followup-asc'
  | 'company-asc'
  | 'company-desc'

export const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: 'updated-desc', label: 'Recently updated' },
  { value: 'applied-desc', label: 'Newest applied' },
  { value: 'applied-asc', label: 'Oldest applied' },
  { value: 'priority-desc', label: 'Priority' },
  { value: 'followup-asc', label: 'Follow-up date' },
  { value: 'company-asc', label: 'Company A–Z' },
  { value: 'company-desc', label: 'Company Z–A' },
]

export type JobViewMode = 'list' | 'board'

/** A named snapshot of the tracker's filter/sort/view state, persisted locally. */
export interface SavedView extends Required<ApplicationFilters> {
  id: string
  name: string
  sort: SortKey
  view: JobViewMode
}

export function sortApplications(apps: Application[], key: SortKey): Application[] {
  const time = (value: string): number => {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? 0 : d.getTime()
  }
  const appliedTime = (app: Application): number => appliedDate(app)?.getTime() ?? 0
  const followTime = (app: Application): number =>
    parseDateOnly(app.followUpDate)?.getTime() ?? Number.POSITIVE_INFINITY

  return [...apps].sort((a, b) => {
    switch (key) {
      case 'updated-asc':
        return time(a.updatedAt) - time(b.updatedAt)
      case 'applied-desc':
        return appliedTime(b) - appliedTime(a)
      case 'applied-asc':
        return appliedTime(a) - appliedTime(b)
      case 'priority-desc':
        return b.priority - a.priority || time(b.updatedAt) - time(a.updatedAt)
      case 'followup-asc':
        return followTime(a) - followTime(b)
      case 'company-asc':
        return a.company.localeCompare(b.company)
      case 'company-desc':
        return b.company.localeCompare(a.company)
      case 'updated-desc':
      default:
        return time(b.updatedAt) - time(a.updatedAt)
    }
  })
}

/* ----------------------------------------------------------------- stats */

export interface JobStats {
  total: number
  active: number
  wishlist: number
  archived: number
  interviews: number
  offers: number
  rejected: number
  submitted: number
  responseRate: number
  interviewRate: number
  offerRate: number
  thisWeek: number
  thisMonth: number
  followUpsDue: number
  stale: number
}

export function computeStats(apps: Application[], now: Date = new Date()): JobStats {
  const live = apps.filter((app) => !app.archived)
  const counts = countByStatus(live)
  const submitted = live.filter((app) => app.status !== 'wishlist')
  const responses = submitted.filter(
    (app) => app.status === 'interview' || app.status === 'offer' || app.status === 'rejected',
  )
  const interviews = submitted.filter((app) => app.status === 'interview' || app.status === 'offer')
  const offers = live.filter((app) => app.status === 'offer')
  const pct = (n: number, d: number): number => (d === 0 ? 0 : Math.round((n / d) * 100))
  const within = (app: Application, days: number): boolean => {
    const date = appliedDate(app)
    if (!date) return false
    const diff = daysBetween(date, now)
    return diff >= 0 && diff <= days
  }

  return {
    total: apps.length,
    active: live.filter(
      (app) => app.status === 'applied' || app.status === 'interview' || app.status === 'offer',
    ).length,
    wishlist: counts.wishlist,
    archived: apps.filter((app) => app.archived).length,
    interviews: interviews.length,
    offers: offers.length,
    rejected: counts.rejected,
    submitted: submitted.length,
    responseRate: pct(responses.length, submitted.length),
    interviewRate: pct(interviews.length, submitted.length),
    offerRate: pct(offers.length, submitted.length),
    thisWeek: live.filter((app) => within(app, 7)).length,
    thisMonth: live.filter((app) => within(app, 30)).length,
    followUpsDue: live.filter((app) => {
      const info = followUpInfo(app, now)
      return info.state === 'overdue' || info.state === 'today'
    }).length,
    stale: live.filter((app) => isStale(app, now)).length,
  }
}

/** Applications applied per week, oldest bucket first; last bucket is this week. */
export function activityByWeek(apps: Application[], weeks = 12, now: Date = new Date()): number[] {
  const end = startOfDay(now)
  const buckets = new Array<number>(weeks).fill(0)
  for (const app of apps) {
    const date = appliedDate(app)
    if (!date) continue
    const diff = daysBetween(date, end)
    if (diff < 0) continue
    const index = weeks - 1 - Math.floor(diff / 7)
    if (index >= 0 && index < weeks) buckets[index] += 1
  }
  return buckets
}

/* ---------------------------------------------------------------- merge */

/** Merge imported records into the current set; incoming records win by id. */
export function mergeApplications(current: Application[], incoming: Application[]): Application[] {
  const map = new Map(current.map((app) => [app.id, app]))
  for (const app of incoming) map.set(app.id, app)
  return [...map.values()]
}

/* ------------------------------------------------------------------- ics */

/** Escape a value for use in an iCalendar property (RFC 5545 §3.3.11). */
function icsEscape(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

function icsDateOnly(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}${month}${day}`
}

function icsDateTime(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function applicationTitle(app: Application): string {
  if (app.company && app.role) return `${app.company} – ${app.role}`
  return app.company || app.role || 'Application'
}

/**
 * Build an iCalendar (`.ics`) file with all-day follow-up reminders and timed
 * events for interviews/offers, so applications can be tracked from any
 * calendar app. Archived applications are skipped.
 */
export function toIcs(apps: Application[], now: Date = new Date()): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Tinker Tools//Job Tracker//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]
  const stamp = icsDateTime(now)

  for (const app of apps) {
    if (app.archived) continue
    const title = applicationTitle(app)

    const follow = parseDateOnly(app.followUpDate)
    if (follow) {
      const next = new Date(follow.getFullYear(), follow.getMonth(), follow.getDate() + 1)
      const description = [
        app.status ? `Status: ${STATUS_LABELS[app.status]}` : '',
        app.contactName,
        app.contactEmail,
        app.notes,
      ]
        .filter(Boolean)
        .join('\n')
      lines.push(
        'BEGIN:VEVENT',
        `UID:${app.id}-followup@tinker-tools`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${icsDateOnly(follow)}`,
        `DTEND;VALUE=DATE:${icsDateOnly(next)}`,
        `SUMMARY:${icsEscape(`Follow up: ${title}`)}`,
      )
      if (description) lines.push(`DESCRIPTION:${icsEscape(description)}`)
      if (app.url) lines.push(`URL:${icsEscape(app.url)}`)
      lines.push('END:VEVENT')
    }

    for (const event of app.history) {
      if (event.status !== 'interview' && event.status !== 'offer') continue
      const at = new Date(event.at)
      if (Number.isNaN(at.getTime())) continue
      const end = new Date(at.getTime() + 60 * 60 * 1000)
      lines.push(
        'BEGIN:VEVENT',
        `UID:${app.id}-${event.id}@tinker-tools`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${icsDateTime(at)}`,
        `DTEND:${icsDateTime(end)}`,
        `SUMMARY:${icsEscape(`${STATUS_LABELS[event.status]}: ${title}`)}`,
      )
      if (event.note) lines.push(`DESCRIPTION:${icsEscape(event.note)}`)
      lines.push('END:VEVENT')
    }
  }

  lines.push('END:VCALENDAR')
  return `${lines.join('\r\n')}\r\n`
}
