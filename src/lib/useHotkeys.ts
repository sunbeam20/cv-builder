import { useEffect, useRef } from 'react'

export type HotkeyMap = Record<string, (event: KeyboardEvent) => void>

/** True when the key event originated from a field the user is typing into. */
function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable
}

/**
 * Bind single-key shortcuts on `window` (case-insensitive, ignored while typing
 * in an input/textarea/select or when a modifier key is held).
 */
export function useHotkeys(map: HotkeyMap, enabled = true) {
  const ref = useRef(map)
  useEffect(() => {
    ref.current = map
  })

  useEffect(() => {
    if (!enabled) return
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const handler = ref.current[event.key.toLowerCase()]
      if (!handler) return
      if (isEditable(event.target)) return
      handler(event)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled])
}
