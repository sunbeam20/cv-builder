import { useEffect, useState } from 'react'
import { resolveView } from './routes'
import type { View } from './routes'
import { BRAND } from './config'

const titleFor = (view: View): string =>
  view.kind === 'app' ? `${BRAND} · ${view.tool.name}` : BRAND

/**
 * Subscribe to hash + hostname changes and map them to a top-level view:
 * landing page on the hub domain, a tool on its own subdomain (or hash preview).
 */
export function useView(): View {
  const [view, setView] = useState<View>(() => resolveView(window.location.hash, window.location.hostname))

  useEffect(() => {
    const onChange = () => setView(resolveView(window.location.hash, window.location.hostname))
    window.addEventListener('hashchange', onChange)
    document.title = titleFor(view)
    return () => window.removeEventListener('hashchange', onChange)
  }, [view])

  return view
}