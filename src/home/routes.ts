import { parseHost } from '../lib/host'
import { TOOL_BY_ROUTE, type ToolDefinition } from './tools'

export type Route = 'home' | 'app'

export type View =
  | { kind: 'home' }
  | { kind: 'app'; tool: ToolDefinition }
  | { kind: 'portfolio'; payload: string }

const hashPath = (hash: string): string =>
  hash.replace(/^#/, '').replace(/^\/+|\/+$/g, '').toLowerCase()

/**
 * Read the encoded portfolio payload out of the raw hash (before any
 * lower-casing — the payload is case-sensitive base64-ish data).
 */
function sharePayload(hash: string): string | null {
  const raw = hash.replace(/^#/, '')
  const match = /^\/?p\/(.+)$/.exec(raw)
  return match ? match[1] : null
}

/**
 * Decide what to render given the current hash and hostname.
 * A tool subdomain always boots straight into that tool; the hub domain
 * uses the hash (defaulting to the landing page). A shared portfolio link
 * works everywhere and takes precedence.
 */
export function resolveView(hash: string, hostname: string): View {
  const payload = sharePayload(hash)
  if (payload) return { kind: 'portfolio', payload }

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