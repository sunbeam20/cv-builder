import { ArrowLeft, Construction } from 'lucide-react'
import type { ToolDefinition } from './tools'
import { goHome } from './navigation'

export function ComingSoon({ tool }: { tool: ToolDefinition }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        <Construction size={26} />
      </span>
      <h1 className="text-xl font-bold text-slate-900">{tool.name} is coming soon</h1>
      <p className="max-w-md text-sm leading-relaxed text-slate-500">{tool.tagline}</p>
      <button
        type="button"
        onClick={() => goHome()}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
      >
        <ArrowLeft size={15} />
        Back to all tools
      </button>
    </div>
  )
}