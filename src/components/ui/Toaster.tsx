import { useEffect } from 'react'
import { AlertTriangle, Check, Info, Loader2, X } from 'lucide-react'
import { useToastStore } from '../../lib/toast'
import type { ToastRecord, ToastVariant } from '../../lib/toast'

const VARIANT_STYLES: Record<
  ToastVariant,
  { icon: typeof Info; accent: string; spin: boolean; ring: string }
> = {
  loading: { icon: Loader2, accent: 'text-indigo-600', spin: true, ring: 'border-slate-200' },
  info: { icon: Info, accent: 'text-indigo-600', spin: false, ring: 'border-slate-200' },
  success: { icon: Check, accent: 'text-emerald-600', spin: false, ring: 'border-emerald-200' },
  error: { icon: AlertTriangle, accent: 'text-red-600', spin: false, ring: 'border-red-200' },
}

function ToastItem({ toast }: { toast: ToastRecord }) {
  const dismiss = useToastStore((s) => s.dismiss)
  const { icon: Icon, accent, spin, ring } = VARIANT_STYLES[toast.variant]

  useEffect(() => {
    if (toast.duration <= 0) return
    const timer = setTimeout(() => dismiss(toast.id), toast.duration)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, dismiss])

  return (
    <div
      role={toast.variant === 'error' ? 'alert' : 'status'}
      className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border ${ring} bg-white p-3.5 shadow-lg`}
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${accent} ${spin ? 'animate-spin' : ''}`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-800">{toast.message}</p>
        {toast.description ? (
          <p className="mt-0.5 text-xs text-slate-500">{toast.description}</p>
        ) : null}
        {toast.actions.length > 0 ? (
          <div className="mt-2.5 flex justify-end gap-2">
            {toast.actions.map((action) => (
              <button
                key={action.label}
                type="button"
                autoFocus={action.primary && toast.duration === 0}
                onClick={action.onClick}
                className={
                  action.primary
                    ? 'rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700'
                    : 'rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50'
                }
              >
                {action.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => dismiss(toast.id)}
        className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
      >
        <X size={14} />
      </button>
    </div>
  )
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end no-print"
    >
      {toasts.map((item) => (
        <ToastItem key={item.id} toast={item} />
      ))}
    </div>
  )
}