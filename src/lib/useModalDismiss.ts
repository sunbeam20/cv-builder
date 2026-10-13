import { useEffect, useRef } from 'react'

/**
 * Wires up modal niceties: Escape closes, and the container is focused on open so
 * keyboard/screen-reader users land inside the dialog.
 */
export function useModalDismiss(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    ref.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return ref
}
