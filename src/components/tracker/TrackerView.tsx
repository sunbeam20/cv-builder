import { useState } from 'react'
import { ClipboardList, Download, Plus, Trash2 } from 'lucide-react'
import { useResumeStore } from '../../store/resumeStore'
import {
  APPLICATION_STATUSES,
  STATUS_LABELS,
  applicationsToCsv,
  emptyApplication,
} from '../../lib/applications'
import { downloadBlob } from '../../lib/helpers'
import { toast } from '../../lib/toast'
import type { ApplicationStatus } from '../../types'

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  wishlist: 'bg-slate-100 text-slate-600',
  applied: 'bg-sky-100 text-sky-700',
  interview: 'bg-amber-100 text-amber-700',
  offer: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
}

const inputClass =
  'w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 outline-none focus:border-indigo-500'

export function TrackerView() {
  const applications = useResumeStore((s) => s.applications)
  const addApplication = useResumeStore((s) => s.addApplication)
  const updateApplication = useResumeStore((s) => s.updateApplication)
  const removeApplication = useResumeStore((s) => s.removeApplication)

  const [draft, setDraft] = useState(() => emptyApplication())

  const counts = APPLICATION_STATUSES.map((status) => ({
    status,
    count: applications.filter((a) => a.status === status).length,
  }))

  const canAdd = draft.company.trim() !== '' || draft.role.trim() !== ''
  const add = () => {
    if (!canAdd) return
    addApplication(draft)
    setDraft(emptyApplication())
  }

  const exportCsv = () => {
    downloadBlob(
      new Blob([applicationsToCsv(applications)], { type: 'text/csv;charset=utf-8' }),
      'job_applications.csv',
    )
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <ClipboardList size={16} className="text-indigo-600" />
          Job applications
        </h2>
        <button
          type="button"
          onClick={exportCsv}
          disabled={applications.length === 0}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={14} />
          CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {counts.map(({ status, count }) => (
          <span
            key={status}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLES[status]}`}
          >
            {STATUS_LABELS[status]}: {count}
          </span>
        ))}
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            className={inputClass}
            aria-label="Company"
            placeholder="Company"
            value={draft.company}
            onChange={(e) => setDraft({ ...draft, company: e.target.value })}
          />
          <input
            className={inputClass}
            aria-label="Role"
            placeholder="Role"
            value={draft.role}
            onChange={(e) => setDraft({ ...draft, role: e.target.value })}
          />
          <div className="flex gap-2">
            <select
              className={inputClass}
              aria-label="Status"
              value={draft.status}
              onChange={(e) => setDraft({ ...draft, status: e.target.value as ApplicationStatus })}
            >
              {APPLICATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <input
              className={inputClass}
              aria-label="Date"
              type="date"
              value={draft.date}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <input
              className={inputClass}
              aria-label="Link"
              placeholder="Job posting URL"
              value={draft.url}
              onChange={(e) => setDraft({ ...draft, url: e.target.value })}
            />
            <button
              type="button"
              onClick={add}
              disabled={!canAdd}
              className="inline-flex shrink-0 items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={14} />
              Add
            </button>
          </div>
        </div>
      </section>

      {applications.length === 0 ? (
        <p className="text-center text-xs text-slate-400">
          No applications yet. Add your first one above.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {applications.map((app) => (
            <div
              key={app.id}
              className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label={`Status for ${app.company || app.role || 'application'}`}
                  value={app.status}
                  onChange={(e) =>
                    updateApplication(app.id, (d) => {
                      d.status = e.target.value as ApplicationStatus
                    })
                  }
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 outline-none focus:border-indigo-500"
                >
                  {APPLICATION_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
                <input
                  aria-label={`Company for ${app.id}`}
                  className="min-w-[8rem] flex-1 rounded-md border border-transparent px-1.5 py-1 text-sm font-semibold text-slate-800 hover:border-slate-200 focus:border-indigo-500 focus:outline-none"
                  value={app.company}
                  placeholder="Company"
                  onChange={(e) => updateApplication(app.id, (d) => void (d.company = e.target.value))}
                />
                <input
                  aria-label={`Role for ${app.id}`}
                  className="min-w-[8rem] flex-1 rounded-md border border-transparent px-1.5 py-1 text-sm text-slate-600 hover:border-slate-200 focus:border-indigo-500 focus:outline-none"
                  value={app.role}
                  placeholder="Role"
                  onChange={(e) => updateApplication(app.id, (d) => void (d.role = e.target.value))}
                />
                {app.url ? (
                  <a
                    href={app.url.startsWith('http') ? app.url : `https://${app.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-indigo-600 hover:underline"
                  >
                    Link
                  </a>
                ) : null}
                <button
                  type="button"
                  aria-label={`Remove ${app.company || app.role || 'application'}`}
                  onClick={() => {
                    const label = app.company || app.role || 'this application'
                    toast.confirm({
                      message: `Remove ${label}?`,
                      description: 'This removes the application from your tracker.',
                      confirmLabel: 'Remove',
                      tone: 'error',
                      onConfirm: () => {
                        removeApplication(app.id)
                        toast.success('Application removed', { key: `removed-${app.id}` })
                      },
                    })
                  }}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <textarea
                aria-label={`Notes for ${app.id}`}
                className="mt-2 w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 outline-none focus:border-indigo-500"
                rows={2}
                placeholder="Notes…"
                value={app.notes}
                onChange={(e) => updateApplication(app.id, (d) => void (d.notes = e.target.value))}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
