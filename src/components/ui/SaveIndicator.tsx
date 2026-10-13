import { useEffect, useRef, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { useResumeStore } from '../../store/resumeStore'

/** Reassures users their work is persisted locally, without them having to press Save. */
export function SaveIndicator() {
  const resume = useResumeStore((s) => s.resume)
  const [status, setStatus] = useState<'saved' | 'saving'>('saved')
  const mounted = useRef(false)

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    setStatus('saving')
    const timer = setTimeout(() => setStatus('saved'), 500)
    return () => clearTimeout(timer)
  }, [resume])

  return (
    <span
      aria-live="polite"
      className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400"
    >
      {status === 'saved' ? (
        <>
          <Check size={13} className="text-emerald-500" />
          Saved
        </>
      ) : (
        <>
          <Loader2 size={13} className="animate-spin" />
          Saving…
        </>
      )}
    </span>
  )
}