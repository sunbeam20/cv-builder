import { useEffect, useState } from 'react'
import { parseRoute, routeToHash } from './routes'
import type { Route } from './routes'
import { BRAND } from './config'

const titleFor = (route: Route): string => (route === 'app' ? `${BRAND} · CV Builder` : BRAND)

/** Subscribe to hash changes and map them to a top-level route. */
export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash))

  useEffect(() => {
    const onHashChange = () => {
      const next = parseRoute(window.location.hash)
      setRoute(next)
      document.title = titleFor(next)
    }
    window.addEventListener('hashchange', onHashChange)
    document.title = titleFor(route)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [route])

  // Keep the hash canonical (e.g. "#" -> "#/") without breaking anything.
  useEffect(() => {
    if (window.location.hash !== routeToHash(route)) {
      window.history.replaceState(null, '', routeToHash(route))
    }
  }, [route])

  return route
}