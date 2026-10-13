import type { ReactNode } from 'react'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { goHome } from '../../home/navigation'
import { ToolMenu } from '../../home/ToolMenu'
import { BRAND } from '../../home/config'

interface ToolHeaderProps {
  icon: LucideIcon
  title: string
  subtitle?: string
  /** Right-hand slot; defaults to the "Runs locally" badge. */
  actions?: ReactNode
}

/** Shared sticky header used by the standalone tools. */
export function ToolHeader({ icon: Icon, title, subtitle, actions }: ToolHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2.5">
        <button
          type="button"
          aria-label={`Go to ${BRAND} home`}
          title="All tools"
          onClick={() => goHome()}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
        >
          <ArrowLeft size={15} />
        </button>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <Icon size={16} />
        </span>
        <div className="mr-auto min-w-0">
          <h1 className="truncate text-sm font-semibold text-slate-800">{title}</h1>
          {subtitle ? (
            <p className="hidden truncate text-[11px] text-slate-400 sm:block">{subtitle}</p>
          ) : null}
        </div>
        <ToolMenu />
        {actions ?? (
          <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-600 sm:inline-flex">
            <ShieldCheck size={12} />
            Runs locally
          </span>
        )}
      </div>
    </header>
  )
}

export default ToolHeader
