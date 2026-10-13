import { useState } from 'react'
import { ClipboardList } from 'lucide-react'
import type { Application, ApplicationStatus } from '../types'
import { APPLICATION_STATUSES, STATUS_LABELS, emptyApplication } from '../lib/applications'
import { uid } from '../lib/helpers'
import { useModalDismiss } from '../lib/useModalDismiss'
import { priorityLabel } from './model'
import { Stars } from './ApplicationCard'

const inputClass =
  'w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500'

function Field({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={`flex flex-col gap-1 ${className ?? ''}`}>
      <span className="text-[11px] font-medium text-slate-500">{label}</span>
      {children}
    </label>
  )
}

function Timeline({
  app,
  onAddNote,
}: {
  app: Application
  onAddNote?: (text: string) => void
}) {
  const [note, setNote] = useState('')
  const events = [...app.history].sort((a, b) => a.at.localeCompare(b.at))
  const add = () => {
    const trimmed = note.trim()
    if (!trimmed) return
    onAddNote?.(trimmed)
    setNote('')
  }
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Timeline</p>
      {events.length === 0 ? (
        <p className="text-[11px] text-slate-400">No activity recorded yet.</p>
      ) : (
        <ol className="flex flex-col gap-1.5">
          {events.map((event) => (
            <li key={event.id} className="flex items-center gap-2 text-[11px] text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              <span className="font-medium text-slate-700">{STATUS_LABELS[event.status]}</span>
              <span className="text-slate-400">
                {new Date(event.at).toLocaleString(undefined, {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              {event.note ? <span className="text-slate-400">· {event.note}</span> : null}
            </li>
          ))}
        </ol>
      )}

      {onAddNote ? (
        <div className="mt-2.5 flex items-center gap-2">
          <input
            className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] text-slate-700 outline-none focus:border-indigo-500"
            aria-label="Log a note"
            placeholder="Log a note (call, email, update…)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                add()
              }
            }}
          />
          <button
            type="button"
            onClick={add}
            disabled={note.trim() === ''}
            className="shrink-0 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add
          </button>
        </div>
      ) : null}
    </div>
  )
}

export interface ApplicationFormModalProps {
  open: boolean
  initial: Application | null
  onClose: () => void
  onSave: (app: Application) => void
  onAddNote?: (text: string) => void
}

export function ApplicationFormModal({
  open,
  initial,
  onClose,
  onSave,
  onAddNote,
}: ApplicationFormModalProps) {
  const dialogRef = useModalDismiss(open, onClose)
  // The parent remounts this component (via `key`) each time it opens, so the
  // lazy initialisers only ever run once per open session.
  const [draft, setDraft] = useState<Application>(() => initial ?? emptyApplication())
  const [tagsText, setTagsText] = useState(() => (initial ? initial.tags.join(', ') : ''))

  if (!open) return null

  const set = <K extends keyof Application>(field: K, value: Application[K]) =>
    setDraft((current) => ({ ...current, [field]: value }))

  const logNote = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const at = new Date().toISOString()
    setDraft((current) => ({
      ...current,
      history: [...current.history, { id: uid(), status: current.status, at, note: trimmed }],
    }))
    onAddNote?.(trimmed)
  }

  const canSave = draft.company.trim() !== '' || draft.role.trim() !== ''
  const save = () => {
    if (!canSave) return
    const tags = tagsText
      .split(/[;,]/)
      .map((tag) => tag.trim())
      .filter(Boolean)
      .filter((tag, index, all) => all.indexOf(tag) === index)
    const next: Application = { ...draft, tags }
    if (!initial) {
      const stamp = new Date().toISOString()
      next.history = [{ id: uid(), status: draft.status, at: stamp }]
    }
    onSave(next)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={initial ? 'Edit application' : 'Add application'}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-xl outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <ClipboardList size={16} />
          </span>
          <h2 className="text-sm font-semibold text-slate-800">
            {initial ? 'Edit application' : 'Add application'}
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Company">
              <input
                className={inputClass}
                aria-label="Company"
                placeholder="Acme Inc."
                value={draft.company}
                onChange={(e) => set('company', e.target.value)}
              />
            </Field>
            <Field label="Role">
              <input
                className={inputClass}
                aria-label="Role"
                placeholder="Frontend Engineer"
                value={draft.role}
                onChange={(e) => set('role', e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Status">
              <select
                className={inputClass}
                aria-label="Status"
                value={draft.status}
                onChange={(e) => set('status', e.target.value as ApplicationStatus)}
              >
                {APPLICATION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={`Priority${draft.priority ? ` · ${priorityLabel(draft.priority)}` : ''}`}>
              <div className="flex h-[38px] items-center gap-2 rounded-md border border-slate-200 px-2.5">
                <Stars value={draft.priority} onChange={(p) => set('priority', p)} size={18} />
                <button
                  type="button"
                  onClick={() => set('priority', 0)}
                  className="ml-auto text-[11px] text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Location">
              <input
                className={inputClass}
                aria-label="Location"
                placeholder="Remote / London"
                value={draft.location}
                onChange={(e) => set('location', e.target.value)}
              />
            </Field>
            <Field label="Salary">
              <input
                className={inputClass}
                aria-label="Salary"
                placeholder="£60k–£75k"
                value={draft.salary}
                onChange={(e) => set('salary', e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Source">
              <input
                className={inputClass}
                aria-label="Source"
                placeholder="LinkedIn, Referral…"
                value={draft.source}
                onChange={(e) => set('source', e.target.value)}
              />
            </Field>
            <Field label="Resume version">
              <input
                className={inputClass}
                aria-label="Resume version"
                placeholder="Frontend v2"
                value={draft.resumeVersion}
                onChange={(e) => set('resumeVersion', e.target.value)}
              />
            </Field>
          </div>

          <Field label="Job posting URL">
            <input
              className={inputClass}
              aria-label="Link"
              placeholder="https://…"
              value={draft.url}
              onChange={(e) => set('url', e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Date applied">
              <input
                className={inputClass}
                aria-label="Date"
                type="date"
                value={draft.date}
                onChange={(e) => set('date', e.target.value)}
              />
            </Field>
            <Field label="Follow-up date">
              <input
                className={inputClass}
                aria-label="Follow-up date"
                type="date"
                value={draft.followUpDate}
                onChange={(e) => set('followUpDate', e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Contact name">
              <input
                className={inputClass}
                aria-label="Contact name"
                value={draft.contactName}
                onChange={(e) => set('contactName', e.target.value)}
              />
            </Field>
            <Field label="Contact email">
              <input
                className={inputClass}
                aria-label="Contact email"
                type="email"
                value={draft.contactEmail}
                onChange={(e) => set('contactEmail', e.target.value)}
              />
            </Field>
          </div>

          <Field label="Tags (comma separated)">
            <input
              className={inputClass}
              aria-label="Tags"
              placeholder="remote, senior, dream-job"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
            />
          </Field>

          <Field label="Notes">
            <textarea
              className={`${inputClass} resize-y`}
              aria-label="Notes"
              rows={3}
              placeholder="Interview notes, contacts, next steps…"
              value={draft.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </Field>

          <Field label="Job description">
            <textarea
              className={`${inputClass} resize-y`}
              aria-label="Job description"
              rows={3}
              placeholder="Paste the posting text to keep it handy…"
              value={draft.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </Field>

          {initial ? <Timeline app={draft} onAddNote={logNote} /> : null}
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!canSave}
            className="rounded-md bg-indigo-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {initial ? 'Save changes' : 'Add application'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ApplicationFormModal
