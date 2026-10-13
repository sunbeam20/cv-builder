import { Plus, X } from 'lucide-react'
import { TextArea } from './inputs'
import { AiButton } from './AiButton'
import { SortableItem, SortableList } from './SortableList'

interface BulletsEditorProps {
  bullets: string[]
  onChange: (bullets: string[]) => void
  placeholder?: string
  aiContext?: string
}

export function BulletsEditor({
  bullets,
  onChange,
  placeholder = 'Describe an achievement…',
  aiContext,
}: BulletsEditorProps) {
  const setAt = (index: number, value: string) => {
    const next = bullets.slice()
    next[index] = value
    onChange(next)
  }

  const removeAt = (index: number) => {
    onChange(bullets.filter((_, i) => i !== index))
  }

  const reorder = (from: number, to: number) => {
    const next = bullets.slice()
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onChange(next)
  }

  const ids = bullets.map((_, index) => `bullet-${index}`)

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-slate-600">Highlights</span>
      {bullets.length > 0 ? (
        <SortableList ids={ids} onReorder={reorder}>
          <div className="flex flex-col gap-2">
            {bullets.map((bullet, index) => (
              <SortableItem key={index} id={`bullet-${index}`} label={`highlight ${index + 1}`}>
                {(handle) => (
                  <div className="flex items-start gap-2">
                    <div className="mt-1">{handle}</div>
                    <TextArea
                      rows={2}
                      value={bullet}
                      placeholder={placeholder}
                      onChange={(e) => setAt(index, e.target.value)}
                    />
                    <div className="mt-1 flex shrink-0 flex-col items-end gap-1">
                      <AiButton
                        text={bullet}
                        context={aiContext}
                        instruction="Rewrite this resume bullet point to be concise and achievement-oriented."
                        onResult={(text) => setAt(index, text)}
                      />
                      <button
                        type="button"
                        title="Remove highlight"
                        aria-label="Remove highlight"
                        onClick={() => removeAt(index)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </SortableItem>
            ))}
          </div>
        </SortableList>
      ) : null}
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
