import { useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { useResumeStore } from '../../store/resumeStore'
import { haveAiKey, improveText } from '../../lib/ai'

interface AiButtonProps {
  text: string
  onResult: (text: string) => void
  instruction?: string
  context?: string
  label?: string
}

export function AiButton({ text, onResult, instruction, context, label = 'Improve' }: AiButtonProps) {
  const ai = useResumeStore((s) => s.ai)
  const openAiSettings = useResumeStore((s) => s.openAiSettings)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const configured = haveAiKey(ai)

  const handleClick = async () => {
    setError(null)
    if (!configured) {
      openAiSettings()
      return
    }
    if (!text.trim()) return
    setLoading(true)
    try {
      const result = await improveText({ text, instruction, context }, ai)
      onResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <span className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading || !text.trim()}
        title={configured ? 'Improve with AI' : 'Configure AI to enable'}
        className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-600 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
        {loading ? 'Writing…' : label}
      </button>
      {error ? <span className="text-[11px] text-red-500">{error}</span> : null}
    </span>
  )
}
