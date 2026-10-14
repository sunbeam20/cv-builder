import { isDevHost, parseHost, toolUrl, hubUrl } from '../lib/host'
import { navigate, navigateToRoute } from './routes'
import { TOOL_BY_SLUG } from './tools'
import { useHubStore } from './hubStore'

const current = () => parseHost(window.location.hostname)

/** Navigate to the hub landing page (in-page on the hub/dev, absolute URL from a tool subdomain). */
export function goHome(): void {
  const { rootHost, isDev, tool } = current()
  if (isDev || !tool) {
    navigate('home')
    return
  }
  window.location.assign(hubUrl(rootHost))
}

/** Open a tool by its subdomain slug (in-page dev preview, absolute URL in production). */
export function openTool(slug: string): void {
  const { rootHost, isDev } = current()
  const tool = TOOL_BY_SLUG.get(slug)
  if (tool) useHubStore.getState().recordRecent(slug)

  if (isDev) {
    if (tool?.route) navigateToRoute(tool.route)
    else navigate('app')
    return
  }
  window.location.assign(toolUrl(slug, rootHost))
}

export { isDevHost }