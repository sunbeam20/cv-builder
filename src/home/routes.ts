export type Route = 'home' | 'app'

const APP_PATHS = new Set(['cv-builder', 'cv'])

/** Map a window.location.hash value to a top-level route. */
export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, '').replace(/^\/+|\/+$/g, '')
  return path === '' || !APP_PATHS.has(path.toLowerCase()) ? 'home' : 'app'
}

export function routeToHash(route: Route): string {
  return route === 'app' ? '#/cv-builder' : '#/'
}

export function navigate(route: Route): void {
  window.location.hash = routeToHash(route)
}