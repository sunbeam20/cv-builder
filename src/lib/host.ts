import { TOOL_BY_SLUG, type ToolDefinition } from '../home/tools'

export interface HostInfo {
  tool: ToolDefinition | null
  rootHost: string
  isDev: boolean
}

const DEV_HOSTS = new Set(['localhost', '127.0.0.1', '::1'])

const rootOverride = (import.meta.env.VITE_ROOT_DOMAIN as string | undefined)?.toLowerCase()

export function isDevHost(hostname: string): boolean {
  return DEV_HOSTS.has(hostname.toLowerCase().replace(/\.$/, ''))
}

/**
 * Determine whether the given hostname is a tool subdomain and, if so, which one.
 * A leading label matching a known tool slug marks a tool subdomain; everything else
 * (including localhost) is treated as the hub/root domain.
 */
export function parseHost(hostname: string): HostInfo {
  const host = hostname.toLowerCase().replace(/\.$/, '')
  if (isDevHost(host)) {
    return { tool: null, rootHost: host, isDev: true }
  }

  if (rootOverride) {
    const base = rootOverride.replace(/\.$/, '')
    if (host === base) return { tool: null, rootHost: base, isDev: false }
    if (host.endsWith(`.${base}`)) {
      const label = host.slice(0, host.length - base.length - 1).split('.').pop() ?? ''
      const tool = TOOL_BY_SLUG.get(label) ?? null
      return { tool, rootHost: base, isDev: false }
    }
  }

  const parts = host.split('.')
  const tool = parts.length > 2 ? (TOOL_BY_SLUG.get(parts[0]) ?? null) : null
  return {
    tool,
    rootHost: tool ? parts.slice(1).join('.') : host,
    isDev: false,
  }
}

export const toolUrl = (slug: string, rootHost: string): string => `https://${slug}.${rootHost}/`

export const hubUrl = (rootHost: string): string => `https://${rootHost}/`