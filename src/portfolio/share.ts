import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import {
  DEFAULT_SETTINGS,
  emptyPortfolio,
  type PortfolioData,
  type PortfolioDraft,
  type PortfolioSettings,
} from './model'

const VERSION = 1
export const SHARE_PREFIX = 'p'

/**
 * Compress a portfolio into a URL-safe fragment. The whole page lives in the
 * link — there is no server involved.
 */
export function encodePortfolio(data: PortfolioData, settings: PortfolioSettings): string {
  return compressToEncodedURIComponent(JSON.stringify({ v: VERSION, d: data, s: settings }))
}

export function decodePortfolio(encoded: string): PortfolioDraft | null {
  try {
    const raw = decompressFromEncodedURIComponent(encoded)
    if (!raw) return null
    const parsed = JSON.parse(raw) as {
      d?: Partial<PortfolioData>
      s?: Partial<PortfolioSettings>
    }
    return {
      data: { ...emptyPortfolio(), ...(parsed.d ?? {}) },
      settings: { ...DEFAULT_SETTINGS, ...(parsed.s ?? {}) },
    }
  } catch {
    return null
  }
}

/** Absolute link (current origin) that opens the read-only portfolio viewer. */
export function portfolioShareUrl(data: PortfolioData, settings: PortfolioSettings): string {
  const encoded = encodePortfolio(data, settings)
  const { origin, pathname } = window.location
  return `${origin}${pathname}#/${SHARE_PREFIX}/${encoded}`
}
