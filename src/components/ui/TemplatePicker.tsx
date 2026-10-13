import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { useResumeStore } from '../../store/resumeStore'
import { TEMPLATES, TEMPLATE_LIST } from '../../lib/templates'
import type { TemplateTheme } from '../../lib/templates'

function TemplateThumb({ theme }: { theme: TemplateTheme }) {
  return (
    <div
      className="h-20 w-full overflow-hidden rounded border border-slate-200 bg-white"
      style={{ fontFamily: theme.fontFamily }}
    >
      {theme.accentBar ? <div className="h-1" style={{ background: theme.accent }} /> : null}
      <div className="p-1.5">
        <div className="text-[7px] font-bold leading-none" style={{ color: theme.nameColor }}>
          Your Name
        </div>
        {theme.headingRule ? (
          <div className="mt-1 h-0.5 w-6 rounded" style={{ background: theme.accent }} />
        ) : (
          <div className="mt-1 text-[5px] font-bold uppercase" style={{ color: theme.accent }}>
            Section
          </div>
        )}
        <div className="mt-1 space-y-0.5">
          <div className="h-0.5 w-full rounded bg-slate-200" />
          <div className="h-0.5 w-4/5 rounded bg-slate-200" />
          <div className="h-0.5 w-11/12 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  )
}

export function TemplatePicker() {
  const template = useResumeStore((s) => s.template)
  const setTemplate = useResumeStore((s) => s.setTemplate)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = TEMPLATES[template]

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Template"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 focus:border-indigo-500"
      >
        <span
          className="inline-block h-3 w-3 rounded-sm ring-1 ring-black/5"
          style={{ background: current.accent }}
        />
        {current.name}
        <ChevronDown size={14} className="text-slate-400" />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label="Choose template"
          className="absolute left-0 z-30 mt-2 grid w-[22rem] max-w-[80vw] grid-cols-3 gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-xl"
        >
          {TEMPLATE_LIST.map((t) => {
            const active = t.id === template
            return (
              <button
                key={t.id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  setTemplate(t.id)
                  setOpen(false)
                }}
                className={`flex flex-col gap-1 rounded-md border p-1.5 text-left transition ${
                  active
                    ? 'border-indigo-500 ring-1 ring-indigo-500'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <TemplateThumb theme={t} />
                <span className="flex items-center gap-1 text-[11px] font-medium text-slate-700">
                  {active ? <Check size={11} className="text-indigo-600" /> : null}
                  {t.name}
                </span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
