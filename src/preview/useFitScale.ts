import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

export const A4_WIDTH = 794
export const A4_HEIGHT = 1123

export function useFitScale(): { ref: RefObject<HTMLDivElement | null>; scale: number } {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const width = el.clientWidth
      if (width > 0) setScale(Math.min(1, width / A4_WIDTH))
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, scale }
}
