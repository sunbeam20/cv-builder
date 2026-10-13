import { Plus, X } from 'lucide-react'
import { TextArea } from './inputs'

interface BulletsEditorProps {
  bullets: string[]
  onChange: (bullets: string[]) => void
  placeholder?: string
}

export function BulletsEditor({ bullets, onChange, placeholder = 'Describe an achievement…' }: BulletsEditorProps) {
  const setAt = (index: number, value: string) => {
    const next = bullets.slice()
    next[index] = value
    onChange(next)
  }

  const removeAt = (index: number) => {
    onChange(bullets.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-slate-600">Highlights</span>
      {bullets.map((bullet, index) => (
        <div key={index} className="flex items-start gap-2">
          <TextArea
            rows={2}
            value={bullet}
            placeholder={placeholder}
            onChange={(e) => setAt(index, e.target.value)}
          />
          <button
            type="button"
            title="Remove highlight"
            aria-label="Remove highlight"
            onClick={() => removeAt(index)}
            className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...bullets, ''])}
        className="inline-flex w-fit items-center gap-1 rounded-md border border-dashed border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:border-indigo-400 hover:text-indigo-600"
      >
        <Plus size={13} />
        Add highlight
      </button>
    </div>
  )
}
