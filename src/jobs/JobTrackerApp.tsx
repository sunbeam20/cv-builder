import { useMemo, useRef, useState } from 'react'
import {
  Archive,
  CalendarDays,
  ClipboardList,
  Columns3,
  Download,
  List,
  Plus,
  Search,
  Star,
  Trash2,
  Upload,
} from 'lucide-react'
import { useHotkeys } from '../lib/useHotkeys'
import type { Application, ApplicationStatus } from '../types'
import { ToolHeader } from '../components/ui/ToolHeader'
import {
  APPLICATION_STATUSES,
  STATUS_LABELS,
  applicationsToCsv,
  csvToApplications,
} from '../lib/applications'
import { downloadBlob, uid } from '../lib/helpers'
import { toast, useToastStore } from '../lib/toast'
import { useJobsStore } from './store'
import {
  SORT_OPTIONS,
  collectTags,
  filterApplications,
  normalizeApplication,
  sortApplications,
  toIcs,
  type SavedView,
  type SortKey,
} from './model'
import { StatsPanel } from './StatsPanel'
import { ApplicationCard } from './ApplicationCard'
import { BoardView } from './BoardView'
import { ApplicationFormModal } from './ApplicationFormModal'

const STATUS_CHIP: Record<ApplicationStatus, string> = {
  wishlist: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
  applied: 'bg-sky-100 text-sky-700',
  interview: 'bg-amber-100 text-amber-700',
  offer: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
}

const ghostButton =
  'inline-flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50'

type ViewMode = 'list' | 'board'

export function JobTrackerApp() {
  const applications = useJobsStore((s) => s.applications)
  const addApplication = useJobsStore((s) => s.addApplication)
  const updateApplication = useJobsStore((s) => s.updateApplication)
  const removeApplication = useJobsStore((s) => s.removeApplication)
  const restoreApplication = useJobsStore((s) => s.restoreApplication)
  const moveApplication = useJobsStore((s) => s.moveApplication)
  const addNote = useJobsStore((s) => s.addNote)
  const setArchived = useJobsStore((s) => s.setArchived)
  const setPriority = useJobsStore((s) => s.setPriority)
  const duplicateApplication = useJobsStore((s) => s.duplicateApplication)
  const importApplications = useJobsStore((s) => s.importApplications)
  const clearAll = useJobsStore((s) => s.clearAll)
  const savedViews = useJobsStore((s) => s.views)
  const saveView = useJobsStore((s) => s.saveView)
  const removeView = useJobsStore((s) => s.removeView)
  const goal = useJobsStore((s) => s.goal)
  const setGoal = useJobsStore((s) => s.setGoal)

  const [now] = useState(() => new Date())
  const [view, setView] = useState<ViewMode>('list')
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('updated-desc')
  const [tag, setTag] = useState<string | null>(null)
  const [starredOnly, setStarredOnly] = useState(false)
  const [followUpOnly, setFollowUpOnly] = useState(false)
  const [needsAttention, setNeedsAttention] = useState(false)
  const [includeArchived, setIncludeArchived] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [savingView, setSavingView] = useState(false)
  const [viewName, setViewName] = useState('')
  const [form, setForm] = useState<{ open: boolean; app: Application | null; seq: number }>({
    open: false,
    app: null,
    seq: 0,
  })
  const fileRef = useRef<HTMLInputElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const tags = useMemo(() => collectTags(applications), [applications])
  const visible = useMemo(
    () =>
      sortApplications(
        filterApplications(applications, {
          query,
          status: filter,
          tag,
          starredOnly,
          followUpOnly,
          needsAttention,
          includeArchived,
        }),
        sort,
      ),
    [applications, query, filter, tag, starredOnly, followUpOnly, needsAttention, includeArchived, sort],
  )
  const statusCounts = useMemo(() => {
    const counts: Record<ApplicationStatus, number> = {
      wishlist: 0,
      applied: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
    }
    for (const app of applications) counts[app.status] += 1
    return counts
  }, [applications])

  const openForm = (app: Application | null) =>
    setForm((current) => ({ open: true, app, seq: current.seq + 1 }))
  const closeForm = () => setForm((current) => ({ ...current, open: false }))

  const saveApplication = (next: Application) => {
    const existing = applications.find((a) => a.id === next.id)
    if (!existing) {
      addApplication(next)
      toast.success('Application added', { key: 'job-saved' })
    } else {
      if (existing.status !== next.status) moveApplication(next.id, next.status)
      updateApplication(next.id, (d) => {
        d.company = next.company
        d.role = next.role
        d.location = next.location
        d.url = next.url
        d.date = next.date
        d.notes = next.notes
        d.salary = next.salary
        d.source = next.source
        d.priority = next.priority
        d.contactName = next.contactName
        d.contactEmail = next.contactEmail
        d.followUpDate = next.followUpDate
        d.tags = next.tags
        d.description = next.description
        d.resumeVersion = next.resumeVersion
      })
      toast.success('Application updated', { key: 'job-saved' })
    }
    closeForm()
  }

  const deleteApplication = (app: Application) => {
    const index = applications.findIndex((a) => a.id === app.id)
    const label = app.company || app.role || 'this application'
    removeApplication(app.id)
    useToastStore.getState().push({
      message: `Removed ${label}`,
      description: 'You can undo this for a few seconds.',
      variant: 'info',
      duration: 6000,
      actions: [{ label: 'Undo', primary: true, onClick: () => restoreApplication(app, index) }],
    })
  }

  const archive = (app: Application) => {
    setArchived(app.id, !app.archived)
    toast.success(app.archived ? 'Application restored' : 'Application archived', {
      key: `job-archive-${app.id}`,
    })
  }

  const duplicate = (app: Application) => {
    duplicateApplication(app.id)
    toast.success('Application duplicated', { key: 'job-dup' })
  }

  const applyView = (saved: SavedView) => {
    setQuery(saved.query)
    setFilter(saved.status)
    setTag(saved.tag)
    setStarredOnly(saved.starredOnly)
    setFollowUpOnly(saved.followUpOnly)
    setNeedsAttention(saved.needsAttention)
    setIncludeArchived(saved.includeArchived)
    setSort(saved.sort)
    setView(saved.view)
  }

  const commitSaveView = () => {
    const name = viewName.trim()
    if (!name) return
    saveView({
      id: uid(),
      name,
      query,
      status: filter,
      tag,
      starredOnly,
      followUpOnly,
      needsAttention,
      includeArchived,
      sort,
      view,
    })
    setViewName('')
    setSavingView(false)
    toast.success(`Saved view “${name}”`, { key: 'job-view' })
  }

  const toggleSelected = (id: string) =>
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const selectAllVisible = () =>
    setSelected((current) =>
      current.size === visible.length ? new Set() : new Set(visible.map((app) => app.id)),
    )

  const bulkSetStatus = (status: ApplicationStatus) => {
    for (const id of selected) moveApplication(id, status)
    toast.success(`${selected.size} moved to ${STATUS_LABELS[status]}`, { key: 'job-bulk' })
    setSelected(new Set())
  }

  const bulkArchive = () => {
    for (const id of selected) setArchived(id, true)
    toast.success(`${selected.size} archived`, { key: 'job-bulk' })
    setSelected(new Set())
  }

  const bulkDelete = () => {
    const removed = applications.filter((app) => selected.has(app.id))
    toast.confirm({
      message: `Delete ${removed.length} application${removed.length === 1 ? '' : 's'}?`,
      description: 'This removes them from your tracker.',
      confirmLabel: 'Delete',
      tone: 'error',
      onConfirm: () => {
        for (const app of removed) removeApplication(app.id)
        setSelected(new Set())
        useToastStore.getState().push({
          message: `Deleted ${removed.length} application${removed.length === 1 ? '' : 's'}`,
          variant: 'info',
          duration: 6000,
          actions: [
            {
              label: 'Undo',
              primary: true,
              onClick: () => removed.forEach((app) => restoreApplication(app)),
            },
          ],
        })
      },
    })
  }

  const exportCsv = () => {
    downloadBlob(
      new Blob([applicationsToCsv(applications)], { type: 'text/csv;charset=utf-8' }),
      'job_applications.csv',
    )
    toast.success('CSV downloaded', { key: 'job-export' })
  }

  const exportJson = () => {
    downloadBlob(
      new Blob([JSON.stringify(applications, null, 2)], { type: 'application/json' }),
      'job_applications.json',
    )
    toast.success('JSON downloaded', { key: 'job-export' })
  }

  const exportIcs = () => {
    downloadBlob(
      new Blob([toIcs(applications)], { type: 'text/calendar;charset=utf-8' }),
      'job_applications.ics',
    )
    toast.success('Calendar downloaded', { key: 'job-export' })
  }

  const importFile = async (file: File) => {
    try {
      const text = await file.text()
      const trimmed = text.trim()
      let incoming: Application[]
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        const parsed = JSON.parse(trimmed) as unknown
        const list = Array.isArray(parsed)
          ? parsed
          : Array.isArray((parsed as { applications?: unknown }).applications)
            ? (parsed as { applications: unknown[] }).applications
            : []
        incoming = list.map((item) => normalizeApplication(item as Partial<Application>))
      } else {
        incoming = csvToApplications(text)
      }
      if (incoming.length === 0) {
        toast.error('Nothing to import', { description: 'No applications were found in that file.' })
        return
      }
      importApplications(incoming, 'merge')
      toast.success(`Imported ${incoming.length} application${incoming.length === 1 ? '' : 's'}`, {
        key: 'job-import',
      })
    } catch {
      toast.error('Import failed', { description: 'That file could not be read.' })
    }
  }

  const clearAllApplications = () => {
    toast.confirm({
      message: 'Clear all applications?',
      description: 'This permanently removes everything from your tracker.',
      confirmLabel: 'Clear all',
      tone: 'error',
      onConfirm: () => {
        clearAll()
        setSelected(new Set())
        toast.success('All applications cleared', { key: 'job-clear' })
      },
    })
  }

  const allVisibleSelected = visible.length > 0 && selected.size === visible.length

  useHotkeys({
    n: () => openForm(null),
    '/': (event) => {
      event.preventDefault()
      searchRef.current?.focus()
    },
    b: () => setView((current) => (current === 'board' ? 'list' : 'board')),
    l: () => setView('list'),
    k: () => setView('board'),
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800">
      <ToolHeader
        icon={ClipboardList}
        title="Job Tracker"
        subtitle="Track every application from wishlist to offer."
        actions={
          <>
            <button type="button" onClick={() => fileRef.current?.click()} className={ghostButton}>
              <Upload size={14} />
              Import
            </button>
            <button
              type="button"
              onClick={() => openForm(null)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-medium text-white transition hover:bg-indigo-700"
            >
              <Plus size={14} />
              New
            </button>
          </>
        }
      />

      <input
        ref={fileRef}
        type="file"
        accept=".json,.csv,application/json,text/csv"
        className="hidden"
        aria-label="Import applications file"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void importFile(file)
          e.target.value = ''
        }}
      />

      <main className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6">
        <StatsPanel apps={applications} now={now} goal={goal} onSetGoal={setGoal} />

        <section className="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5">
              {(['list', 'board'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setView(mode)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium capitalize transition ${
                    view === mode ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {mode === 'list' ? <List size={13} /> : <Columns3 size={13} />}
                  {mode}
                </button>
              ))}
            </div>

            <label className="relative min-w-[12rem] flex-1">
              <Search size={14} className="pointer-events-none absolute left-2.5 top-2.5 text-slate-400 dark:text-slate-500" />
              <input
                ref={searchRef}
                type="search"
                aria-label="Search applications"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search company, role, notes, tags…"
                className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-8 pr-3 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500"
              />
            </label>

            <select
              aria-label="Sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-xs text-slate-600 dark:text-slate-300 outline-none focus:border-indigo-500"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setStarredOnly((v) => !v)}
              aria-pressed={starredOnly}
              className={`${ghostButton} ${starredOnly ? 'border-amber-300 bg-amber-50 dark:bg-amber-950 text-amber-700' : ''}`}
            >
              <Star size={13} />
              Starred
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              All: {applications.length}
            </button>
            {APPLICATION_STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                  STATUS_CHIP[status]
                } ${filter === status ? 'ring-2 ring-indigo-400' : 'opacity-80 hover:opacity-100'}`}
              >
                {STATUS_LABELS[status]}: {statusCounts[status]}
              </button>
            ))}

            {tags.length > 0 ? (
              <select
                aria-label="Filter by tag"
                value={tag ?? ''}
                onChange={(e) => setTag(e.target.value || null)}
                className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-[11px] text-slate-600 dark:text-slate-300 outline-none focus:border-indigo-500"
              >
                <option value="">All tags</option>
                {tags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            ) : null}

            <button
              type="button"
              onClick={() => setFollowUpOnly((v) => !v)}
              aria-pressed={followUpOnly}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                followUpOnly ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Follow-ups due
            </button>
            <button
              type="button"
              onClick={() => setNeedsAttention((v) => !v)}
              aria-pressed={needsAttention}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                needsAttention ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Needs attention
            </button>
            <button
              type="button"
              onClick={() => setIncludeArchived((v) => !v)}
              aria-pressed={includeArchived}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                includeArchived ? 'bg-slate-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Archived
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Views</span>
            {savedViews.map((saved) => (
              <span
                key={saved.id}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-1 pl-2.5 pr-1 text-[11px] text-slate-600 dark:text-slate-300"
              >
                <button
                  type="button"
                  onClick={() => applyView(saved)}
                  className="font-medium hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {saved.name}
                </button>
                <button
                  type="button"
                  aria-label={`Remove view ${saved.name}`}
                  onClick={() => removeView(saved.id)}
                  className="px-0.5 text-slate-300 hover:text-rose-500"
                >
                  ×
                </button>
              </span>
            ))}
            {savingView ? (
              <span className="inline-flex items-center gap-1">
                <input
                  autoFocus
                  aria-label="View name"
                  value={viewName}
                  placeholder="View name"
                  onChange={(e) => setViewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitSaveView()
                    if (e.key === 'Escape') {
                      setSavingView(false)
                      setViewName('')
                    }
                  }}
                  className="w-32 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-[11px] text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={commitSaveView}
                  className="rounded-md bg-indigo-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-indigo-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSavingView(false)
                    setViewName('')
                  }}
                  className="rounded-md border border-slate-200 dark:border-slate-700 px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setSavingView(true)}
                className="rounded-full border border-dashed border-slate-300 dark:border-slate-600 px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                + Save current view
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
            <button type="button" onClick={selectAllVisible} disabled={visible.length === 0} className={ghostButton}>
              {allVisibleSelected ? 'Clear selection' : 'Select all'}
            </button>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {applications.length} total · {visible.length} shown
            </span>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <button type="button" onClick={exportCsv} disabled={applications.length === 0} className={ghostButton}>
                <Download size={13} />
                CSV
              </button>
              <button
                type="button"
                onClick={exportIcs}
                disabled={applications.length === 0}
                className={ghostButton}
                title="Export follow-ups and interviews to a calendar (.ics) file"
              >
                <CalendarDays size={13} />
                Calendar
              </button>
              <button type="button" onClick={exportJson} disabled={applications.length === 0} className={ghostButton}>
                <Download size={13} />
                JSON
              </button>
              <button
                type="button"
                onClick={clearAllApplications}
                disabled={applications.length === 0}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={13} />
                Clear all
              </button>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            Shortcuts: <kbd className="rounded bg-slate-100 dark:bg-slate-800 px-1">N</kbd> new ·{' '}
            <kbd className="rounded bg-slate-100 dark:bg-slate-800 px-1">/</kbd> search ·{' '}
            <kbd className="rounded bg-slate-100 dark:bg-slate-800 px-1">B</kbd> board / list
          </p>
        </section>

        {selected.size > 0 ? (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 px-3 py-2 text-xs text-indigo-800">
            <span className="font-semibold">{selected.size} selected</span>
            <select
              aria-label="Move selected to status"
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) bulkSetStatus(e.target.value as ApplicationStatus)
                e.target.value = ''
              }}
              className="rounded-md border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 px-2 py-1 text-xs text-slate-600 dark:text-slate-300 outline-none"
            >
              <option value="">Move to…</option>
              {APPLICATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={bulkArchive}
              className="inline-flex items-center gap-1 rounded-md border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900"
            >
              <Archive size={13} />
              Archive
            </button>
            <button
              type="button"
              onClick={bulkDelete}
              className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950"
            >
              <Trash2 size={13} />
              Delete
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="ml-auto text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Clear
            </button>
          </div>
        ) : null}

        {applications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-10 text-center">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No applications yet</p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Add your first application, or import a CSV / JSON backup.
            </p>
            <button
              type="button"
              onClick={() => openForm(null)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-indigo-700"
            >
              <Plus size={14} />
              Add application
            </button>
          </div>
        ) : visible.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-8 text-center text-xs text-slate-400 dark:text-slate-500">
            No applications match your filters.
          </p>
        ) : view === 'board' ? (
          <BoardView
            apps={visible}
            now={now}
            onMove={(id, status) => moveApplication(id, status)}
            onOpen={(app) => openForm(app)}
          />
        ) : (
          <div className="flex flex-col gap-2">
            {visible.map((app) => (
              <ApplicationCard
                key={app.id}
                app={app}
                now={now}
                selected={selected.has(app.id)}
                onToggleSelect={() => toggleSelected(app.id)}
                onOpen={() => openForm(app)}
                onStatusChange={(status) => moveApplication(app.id, status)}
                onStar={(priority) => setPriority(app.id, priority)}
                onDuplicate={() => duplicate(app)}
                onArchive={() => archive(app)}
                onDelete={() => deleteApplication(app)}
              />
            ))}
          </div>
        )}
      </main>

      <ApplicationFormModal
        key={form.seq}
        open={form.open}
        initial={form.app}
        onClose={closeForm}
        onSave={saveApplication}
        onAddNote={(text) => {
          if (form.app) addNote(form.app.id, text)
        }}
      />
    </div>
  )
}

export default JobTrackerApp
