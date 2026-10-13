import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'

interface FieldProps {
  label: string
  hint?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function Field({ label, hint, action, children, className = '' }: FieldProps) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-600">{label}</span>
        {action}
      </span>
      {children}
      {hint ? <span className="text-[11px] text-slate-400">{hint}</span> : null}
    </label>
  )
}

const baseInput =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...rest } = props
  return <input className={`${baseInput} ${className}`} {...rest} />
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = '', rows = 3, ...rest } = props
  return <textarea rows={rows} className={`${baseInput} resize-y ${className}`} {...rest} />
}

interface IconButtonProps {
  onClick: () => void
  title: string
  children: ReactNode
  disabled?: boolean
  danger?: boolean
}

export function IconButton({ onClick, title, children, disabled, danger }: IconButtonProps) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-md border text-slate-500 transition disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? 'border-slate-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600'
          : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600'
      }`}
    >
      {children}
    </button>
  )
}
