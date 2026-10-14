import { useEffect, useMemo } from 'react'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import { decodePortfolio } from './share'
import { renderPortfolioHtml } from './model'
import { goHome } from '../home/navigation'
import { BRAND } from '../home/config'

export function PortfolioViewer({ payload }: { payload: string }) {
  const draft = useMemo(() => decodePortfolio(payload), [payload])
  const html = useMemo(
    () => (draft ? renderPortfolioHtml(draft.data, draft.settings) : ''),
    [draft],
  )

  useEffect(() => {
    const name = draft?.data.name.trim()
    if (name) document.title = `${name} · Portfolio`
  }, [draft])

  if (!draft) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-800 p-6 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
          <AlertTriangle size={24} />
        </span>
        <h1 className="text-base font-semibold text-slate-800 dark:text-slate-100">This portfolio link couldn’t be opened</h1>
        <p className="max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          The link looks incomplete or was modified. Ask the sender for a fresh link, or create your
          own portfolio.
        </p>
        <button
          type="button"
          onClick={() => goHome()}
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-indigo-700"
        >
          <ArrowLeft size={14} />
          Go to {BRAND}
        </button>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-white dark:bg-slate-900">
      <iframe title="Portfolio" srcDoc={html} className="h-screen w-full border-0" />
      <button
        type="button"
        onClick={() => goHome()}
        className="fixed bottom-4 right-4 rounded-full border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 px-3 py-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 shadow-md backdrop-blur transition hover:text-indigo-600 dark:hover:text-indigo-400"
      >
        Made with {BRAND}
      </button>
    </div>
  )
}

export default PortfolioViewer
