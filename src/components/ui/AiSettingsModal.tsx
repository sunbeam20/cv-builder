import { KeyRound, X } from 'lucide-react'
import { useResumeStore } from '../../store/resumeStore'
import { DEFAULT_AI_SETTINGS } from '../../lib/ai'
import { useModalDismiss } from '../../lib/useModalDismiss'
import { Field, TextInput } from './inputs'

export function AiSettingsModal() {
  const open = useResumeStore((s) => s.aiSettingsOpen)
  const ai = useResumeStore((s) => s.ai)
  const setAi = useResumeStore((s) => s.setAi)
  const close = useResumeStore((s) => s.closeAiSettings)
  const dialogRef = useModalDismiss(open, close)

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 no-print"
      role="dialog"
      aria-modal="true"
      aria-label="AI settings"
      onClick={close}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 p-5 shadow-xl outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
            <KeyRound size={16} className="text-indigo-600 dark:text-indigo-400" />
            AI assist settings
          </h2>
          <button
            type="button"
            aria-label="Close AI settings"
            onClick={close}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X size={16} />
          </button>
        </div>

        <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
          Connect an OpenAI-compatible endpoint to get a one-click “Improve” button on your
          summary and bullet points. Your key is stored only in this browser (localStorage) and
          sent directly to the endpoint you configure.
        </p>

        <div className="flex flex-col gap-3">
          <Field label="API key" hint="Never leaves your browser except to call the endpoint.">
            <TextInput
              type="password"
              autoComplete="off"
              value={ai.apiKey}
              placeholder="sk-…"
              onChange={(e) => setAi({ apiKey: e.target.value })}
            />
          </Field>
          <Field label="Model">
            <TextInput
              value={ai.model}
              placeholder="gpt-4o-mini"
              onChange={(e) => setAi({ model: e.target.value })}
            />
          </Field>
          <Field label="Base URL">
            <TextInput
              value={ai.baseUrl}
              placeholder="https://api.openai.com/v1"
              onChange={(e) => setAi({ baseUrl: e.target.value })}
            />
          </Field>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setAi({ ...DEFAULT_AI_SETTINGS })}
            className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            Reset defaults
          </button>
          <button
            type="button"
            onClick={close}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
