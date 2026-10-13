import { parseHost } from './host'

const MIRROR_PREFIX = 'tinker:mirror:'
const MIRROR_AT_SUFFIX = '::at'

const isTestEnv = typeof process !== 'undefined' && Boolean(process.env?.VITEST)

export interface RemoteRecord {
  value: string
  at: number
}

export interface BridgeTransport {
  send(message: unknown): void
  onMessage(listener: (data: unknown, origin: string) => void): () => void
}

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export interface CrossOriginStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): Promise<void>
  removeItem(key: string): Promise<void>
  onUpdate(listener: (key: string) => void): () => void
}

/**
 * Cross-origin storage core. Reads are served from a local mirror (fast boot,
 * survives the bridge being unavailable); writes go to the local mirror and the
 * root-origin bridge. Remote values that are newer than the mirror are adopted on
 * connect or when another origin signals a change (last-write-wins by timestamp).
 */
export function createCrossOriginStorage(options: {
  transport: BridgeTransport
  mirror: StorageLike
  timeoutMs?: number
  bridgeEnabled?: boolean
}): CrossOriginStorage {
  const { transport, mirror, timeoutMs = 2000 } = options
  const bridge = options.bridgeEnabled ?? (typeof window !== 'undefined' && !isTestEnv)

  const listeners = new Set<(key: string) => void>()
  const pending = new Map<number, (record: RemoteRecord | null) => void>()
  let seq = 0

  const notify = (key: string) => {
    listeners.forEach((listener) => listener(key))
  }

  transport.onMessage((data, _origin) => {
    if (!data || typeof data !== 'object') return
    const message = data as { t?: string; id?: number; key?: string; value?: string | null; at?: number }
    if (message.t === 'get-res') {
      const resolve = pending.get(message.id ?? -1)
      if (!resolve) return
      pending.delete(message.id ?? -1)
      resolve(message.value == null ? null : { value: message.value, at: message.at ?? 0 })
      return
    }
    if (message.t === 'change' && message.key) {
      void reconcileKey(message.key)
      return
    }
  })

  const mirrorAt = (key: string): number =>
    Number(mirror.getItem(`${key}${MIRROR_AT_SUFFIX}`) ?? 0) || 0
  const mirrorWrite = (key: string, value: string, at: number) => {
    mirror.setItem(key, value)
    mirror.setItem(`${key}${MIRROR_AT_SUFFIX}`, String(at))
  }
  const mirrorClear = (key: string) => {
    mirror.removeItem(key)
    mirror.removeItem(`${key}${MIRROR_AT_SUFFIX}`)
  }

  const call = (message: Record<string, unknown>): Promise<RemoteRecord | null> =>
    new Promise((resolve) => {
      const id = ++seq
      pending.set(id, resolve)
      transport.send({ ...message, id })
      setTimeout(() => {
        if (pending.delete(id)) resolve(null)
      }, timeoutMs)
    })

  const remoteGet = (key: string) => call({ t: 'get', key })
  const remoteSet = (key: string, value: string, at: number) => call({ t: 'set', key, value, at })
  const remoteRemove = (key: string) => call({ t: 'remove', key })

  async function reconcileKey(key: string): Promise<void> {
    if (!bridge) return
    const remote = await remoteGet(key)
    const local = mirror.getItem(key)
    const localAt = mirrorAt(key)
    if (remote && (local == null || remote.at >= localAt)) {
      mirrorWrite(key, remote.value, remote.at)
      notify(key)
    } else if (remote && local != null && remote.at < localAt) {
      await remoteSet(key, local, localAt)
    } else if (!remote && local != null) {
      await remoteSet(key, local, localAt)
    }
  }

  return {
    getItem(key) {
      const local = mirror.getItem(key)
      void reconcileKey(key)
      return local
    },
    async setItem(key, value) {
      const at = Date.now()
      mirrorWrite(key, value, at)
      if (bridge) await remoteSet(key, value, at)
    },
    async removeItem(key) {
      mirrorClear(key)
      if (bridge) await remoteRemove(key)
    },
    onUpdate(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

function localStorageLike(): StorageLike {
  return {
    getItem: (key) => localStorage.getItem(MIRROR_PREFIX + key) ?? localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(MIRROR_PREFIX + key, value),
    removeItem: (key) => localStorage.removeItem(MIRROR_PREFIX + key),
  }
}

export function createIframeTransport(rootOrigin: string): BridgeTransport {
  let iframe: HTMLIFrameElement | null = null
  const listeners = new Set<(data: unknown, origin: string) => void>()

  const onWindowMessage = (event: MessageEvent) => {
    if (event.origin !== rootOrigin) return
    listeners.forEach((listener) => listener(event.data, event.origin))
  }
  window.addEventListener('message', onWindowMessage)

  const ensureIframe = (): HTMLIFrameElement | null => {
    if (iframe) return iframe
    try {
      const el = document.createElement('iframe')
      el.src = `${rootOrigin}/bridge.html`
      el.style.display = 'none'
      el.setAttribute('aria-hidden', 'true')
      document.body.appendChild(el)
      iframe = el
    } catch {
      iframe = null
    }
    return iframe
  }

  return {
    send(message) {
      const el = ensureIframe()
      el?.contentWindow?.postMessage(message, rootOrigin)
    },
    onMessage(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

const currentRootHost = (): string => parseHost(window.location.hostname).rootHost

/** Whether the current page can link to real subdomains (i.e. not a local dev host). */
export const rootIsDev = (): boolean => parseHost(window.location.hostname).isDev

/**
 * The app-wide cross-origin storage adapter. Backs the Zustand persist layer:
 * mirror-first for instant boot, root-origin bridge for cross-subdomain sharing.
 */
export const crossOriginStorage: CrossOriginStorage = createCrossOriginStorage({
  transport: createIframeTransport(`${window.location.protocol}//${currentRootHost()}`),
  mirror: localStorageLike(),
})