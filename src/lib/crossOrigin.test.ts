import { describe, expect, it, vi } from 'vitest'
import { createCrossOriginStorage } from './crossOrigin'
import type { BridgeTransport, StorageLike, RemoteRecord } from './crossOrigin'

class MemoryStorage implements StorageLike {
  data = new Map<string, string>()

  getItem(key: string): string | null {
    return this.data.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value)
  }

  removeItem(key: string): void {
    this.data.delete(key)
  }
}

/** Simulates the root-origin bridge: a single storage with message fan-out. */
class FakeBridge {
  localStorage = new MemoryStorage()
  private transports = new Map<string, Set<(data: unknown, origin: string) => void>>()
  private next = 0

  addTransport(): BridgeTransport {
    const id = `c${this.next++}`
    const listeners = new Set<(data: unknown, origin: string) => void>()
    this.transports.set(id, listeners)
    return {
      send: (message) => this.handle(id, message as Record<string, unknown>),
      onMessage: (listener) => {
        listeners.add(listener)
        return () => listeners.delete(listener)
      },
    }
  }

  private handle(id: string, msg: Record<string, unknown>) {
    if (msg.t === 'get') {
      const rec = this.readKey(msg.key as string)
      this.dispatch(id, { t: 'get-res', id: msg.id, key: msg.key, ...rec })
    } else if (msg.t === 'set') {
      this.storageSet(msg.key as string, msg.value as string, (msg.at as number) ?? Date.now())
      this.broadcast(id, msg.key as string)
    } else if (msg.t === 'remove') {
      this.localStorage.removeItem(msg.key as string)
      this.broadcast(id, msg.key as string)
    }
  }

  private dispatch(to: string, data: Record<string, unknown>) {
    this.transports.get(to)?.forEach((listener) => listener(data, `origin-${to}`))
  }

  private broadcast(from: string, key: string) {
    this.transports.forEach((listeners, id) => {
      if (id !== from) listeners.forEach((listener) => listener({ t: 'change', key }, `origin-${id}`))
    })
  }

  private readKey(key: string): { value: string | null; at: number } {
    const raw = this.localStorage.getItem(key)
    if (!raw) return { value: null, at: 0 }
    const parsed = JSON.parse(raw) as RemoteRecord
    return { value: parsed.value, at: parsed.at }
  }

  private storageSet(key: string, value: string, at: number) {
    this.localStorage.setItem(key, JSON.stringify({ value, at }))
  }
}

describe('createCrossOriginStorage', () => {
  const make = (bridge: FakeBridge) => {
    const transport = bridge.addTransport()
    const mirror = new MemoryStorage()
    const storage = createCrossOriginStorage({ transport, mirror, bridgeEnabled: true, timeoutMs: 50 })
    // register change listener prerequisites are handled inside the core via onMessage
    return { storage, bridge, mirror }
  }

  it('serves reads from the mirror while reconciling in the background', async () => {
    const { storage, bridge, mirror } = make(new FakeBridge())
    bridge.localStorage.setItem('cv', JSON.stringify({ value: '"remote-v1"', at: 100 }))
    mirror.setItem('cv', '"local-v1"')
    mirror.setItem('cv::at', '50')

    expect(storage.getItem('cv')).toBe('"local-v1"')
    await vi.waitFor(() => {
      expect(storage.getItem('cv')).toBe('"remote-v1"')
    })
  })

  it('pushes a newer local mirror value up to the bridge', async () => {
    const { storage, bridge, mirror } = make(new FakeBridge())
    bridge.localStorage.setItem('cv', JSON.stringify({ value: '"remote-v1"', at: 100 }))
    mirror.setItem('cv', '"local-v2"')
    mirror.setItem('cv::at', '200')

    const updated = vi.fn()
    storage.onUpdate(updated)
    storage.getItem('cv')
    await vi.waitFor(() => {
      expect(bridge.localStorage.getItem('cv')).toContain('local-v2')
    })
    expect(updated).not.toHaveBeenCalled()
  })

  it('seeds the bridge from the mirror when the bridge has nothing', async () => {
    const { storage, bridge, mirror } = make(new FakeBridge())
    mirror.setItem('cv', '"local-v1"')
    mirror.setItem('cv::at', '42')

    storage.getItem('cv')
    await vi.waitFor(() => {
      expect(bridge.localStorage.getItem('cv')).toContain('local-v1')
    })
  })

  it('notifies listeners when a remote change is adopted', async () => {
    const { storage, bridge } = make(new FakeBridge())
    await storage.setItem('cv', '"mine"')

    const updated = vi.fn()
    storage.onUpdate(updated)
    bridge.localStorage.setItem('cv', JSON.stringify({ value: '"theirs"', at: Date.now() + 1000 }))
    storage.getItem('cv')
    await vi.waitFor(() => {
      expect(updated).toHaveBeenCalledWith('cv')
    })
    expect(storage.getItem('cv')).toBe('"theirs"')
  })

  it('removes keys from both the mirror and the bridge', async () => {
    const { storage, bridge, mirror } = make(new FakeBridge())
    await storage.setItem('cv', '"v"')
    await storage.removeItem('cv')
    expect(mirror.getItem('cv')).toBeNull()
    expect(bridge.localStorage.getItem('cv')).toBeNull()
  })

  it('handles a missing bridge gracefully (timeout resolves to null)', async () => {
    const transport: BridgeTransport = {
      send: () => undefined,
      onMessage: () => () => undefined,
    }
    const mirror = new MemoryStorage()
    mirror.setItem('cv', '"kept"')
    const storage = createCrossOriginStorage({ transport, mirror, bridgeEnabled: true, timeoutMs: 5 })
    expect(storage.getItem('cv')).toBe('"kept"')
  })
})