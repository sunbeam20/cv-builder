import { parseHost } from '../lib/host'
import { TOOL_BY_ROUTE, type ToolDefinition } from './tools'

export type Route = 'home' | 'app'

export type View = { kind: 'home' } | { kind: 'app'; tool: ToolDefinition }

const hashPath = (hash: string): string =>
  hash.replace(/^#/, '').replace(/^\/+|\/+$/g, '').toLowerCase()

/**
 * Decide what to render given the current hash and hostname.
 * A tool subdomain always boots straight into that tool; the hub domain
 * uses the hash (defaulting to the landing page).
 */
export function resolveView(hash: string, hostname: string): View {
  const host = parseHost(hostname)
  if (host.tool) return { kind: 'app', tool: host.tool }

  const tool = TOOL_BY_ROUTE.get(hashPath(hash)) ?? null
  return tool ? { kind: 'app', tool } : { kind: 'home' }
}

export function routeToHash(route: Route): string {
  return route === 'app' ? '#/cv-builder' : '#/'
}

export function navigate(route: Route): void {
  window.location.hash = routeToHash(route)
}

/** Point the hash at an arbitrary tool route (e.g. "/cv-builder"); empty → hub. */
export function navigateToRoute(route: string): void {
  const path = route.replace(/^#/, '').replace(/^\/+|\/+$/g, '')
  window.location.hash = path ? `#/${path}` : '#/'
}