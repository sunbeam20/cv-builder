import { Suspense, lazy, useEffect } from 'react'
import { HomePage } from './HomePage'
import { ComingSoon } from './ComingSoon'
import { useView } from './useView'
import { TOOL_VIEWS } from './toolViews'
import { RelatedTools } from './RelatedTools'
import type { View } from './routes'
import { Toaster } from '../components/ui/Toaster'

const PortfolioViewer = lazy(() => import('../portfolio/PortfolioViewer'))

function Loading({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-800">
      <div className="flex flex-col items-center gap-3">
        <span className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 dark:border-slate-600 border-t-indigo-600" />
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Loading {label}…</p>
      </div>
    </div>
  )
}

function ActiveView({ view }: { view: View }) {
  if (view.kind === 'home') return <HomePage />

  if (view.kind === 'portfolio') {
    return (
      <Suspense fallback={<Loading label="portfolio" />}>
        <PortfolioViewer payload={view.payload} />
      </Suspense>
    )
  }

  const ToolView = TOOL_VIEWS[view.tool.id]
  if (!ToolView) return <ComingSoon tool={view.tool} />

  return (
    <>
      <Suspense fallback={<Loading label={view.tool.name} />}>
        <ToolView />
      </Suspense>
      <RelatedTools tool={view.tool} />
    </>
  )
}

export function Root() {
  const view = useView()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view.kind])

  return (
    <>
      <ActiveView view={view} />
      <Toaster />
    </>
  )
}
