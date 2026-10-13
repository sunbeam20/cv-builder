import { create } from 'zustand'
import { uid } from './helpers'

export type ToastVariant = 'loading' | 'info' | 'success' | 'error'

export interface ToastAction {
  label: string
  onClick?: () => void
  /** Rendered as the filled, emphasised button. */
  primary?: boolean
}

export interface ToastRecord {
  id: string
  message: string
  description?: string
  variant: ToastVariant
  /** Milliseconds before auto-dismiss. `0` keeps the toast until acted on. */
  duration: number
  actions: ToastAction[]
  /** Re-pushing a toast with the same key replaces it instead of stacking. */
  key?: string
}

/** Cap on simultaneously visible toasts; the oldest are dropped first. */
export const MAX_TOASTS = 3

interface ToastState {
  toasts: ToastRecord[]
  push: (toast: Omit<ToastRecord, 'id'>) => string
  update: (id: string, patch: Partial<Omit<ToastRecord, 'id'>>) => void
  dismiss: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = uid()
    set((state) => {
      const kept = toast.key
        ? state.toasts.filter((t) => t.key !== toast.key)
        : state.toasts
      const next = [...kept, { ...toast, id }]
      return { toasts: next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next }
    })
    return id
  },
  update: (id, patch) =>
    set((state) => ({
      toasts: state.toasts.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

interface ToastOptions {
  description?: string
  duration?: number
  key?: string
}

const DEFAULT_DURATION = 4000

const emit = (variant: ToastVariant, message: string, options: ToastOptions = {}): string =>
  useToastStore.getState().push({
    message,
    description: options.description,
    variant,
    duration: options.duration ?? DEFAULT_DURATION,
    actions: [],
    key: options.key,
  })

interface ConfirmOptions {
  message: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'info' | 'error'
  /** Defaults to a shared key so only one confirmation can be pending at a time. */
  key?: string
  onConfirm: () => void
}

export const toast = {
  info: (message: string, options?: ToastOptions) => emit('info', message, options),
  success: (message: string, options?: ToastOptions) => emit('success', message, options),
  error: (message: string, options?: ToastOptions) => emit('error', message, options),
  /** Persistent spinner toast; resolve it later with `toast.update`. */
  loading: (message: string, options: ToastOptions = {}): string =>
    useToastStore.getState().push({
      message,
      description: options.description,
      variant: 'loading',
      duration: options.duration ?? 0,
      actions: [],
      key: options.key,
    }),
  update: (id: string, patch: Partial<Omit<ToastRecord, 'id'>>) =>
    useToastStore.getState().update(id, patch),
  dismiss: (id: string) => useToastStore.getState().dismiss(id),
  confirm: ({
    message,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    tone = 'info',
    key = 'confirm',
    onConfirm,
  }: ConfirmOptions): string => {
    const id = useToastStore.getState().push({
      message,
      description,
      variant: tone,
      duration: 0,
      key,
      actions: [
        { label: cancelLabel, onClick: () => useToastStore.getState().dismiss(id) },
        {
          label: confirmLabel,
          primary: true,
          onClick: () => {
            useToastStore.getState().dismiss(id)
            onConfirm()
          },
        },
      ],
    })
    return id
  },
}

