import { Suspense, useEffect } from 'react'
import { HomePage } from './HomePage'
import { ComingSoon } from './ComingSoon'
import { useView } from './useView'
import { TOOL_VIEWS } from './toolViews'

function Loading({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <span className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
        <p className="text-xs font-medium text-slate-500">Loading {label}…</p>
      </div>
    </div>
  )
}

export function Root() {
  const view = useView()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view.kind])

  if (view.kind === 'home') return <HomePage />

  const ToolView = TOOL_VIEWS[view.tool.id]
  if (!ToolView) return <ComingSoon tool={view.tool} />

  return (
    <Suspense fallback={<Loading label={view.tool.name} />}>
      <ToolView />
    </Suspense>
  )
}