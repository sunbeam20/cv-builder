import { Palette, RotateCcw, X } from 'lucide-react'
import { useResumeStore } from '../../store/resumeStore'
import { useResolvedTheme } from '../../lib/useResolvedTheme'
import { FONT_OPTIONS, FONT_SIZE_MAX, FONT_SIZE_MIN, TEMPLATES } from '../../lib/templates'
import { Field } from './inputs'

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="flex items-center justify-between gap-2 text-xs font-medium text-slate-600">
      {label}
      <span className="flex items-center gap-2">
        <span className="font-mono text-[11px] uppercase text-slate-400">{value}</span>
        <input
          type="color"
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-9 cursor-pointer rounded border border-slate-200 bg-white p-0.5"
        />
      </span>
    </label>
  )
}

export function DesignPanel() {
  const open = useResumeStore((s) => s.designOpen)
  const close = useResumeStore((s) => s.closeDesign)
  const template = useResumeStore((s) => s.template)
  const customization = useResumeStore((s) => s.customization)
  const setCustomization = useResumeStore((s) => s.setCustomization)
  const resetCustomization = useResumeStore((s) => s.resetCustomization)
  const theme = useResolvedTheme()

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 no-print"
      role="dialog"
      aria-modal="true"
      aria-label="Design customization"
      onClick={close}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Palette size={16} className="text-indigo-600" />
            Design
          </h2>
          <button
            type="button"
            aria-label="Close design panel"
            onClick={close}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>

        <p className="mb-4 text-xs text-slate-500">
          Fine-tune the look of <span className="font-medium">{TEMPLATES[template].name}</span>.
          Overrides apply until you reset or pick another template.
        </p>

        <div className="flex flex-col gap-4">
          <Field label="Font family">
            <select
              aria-label="Font family"
              value={customization.fontId ?? ''}
              onChange={(e) => setCustomization({ fontId: e.target.value || undefined })}
              className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500"
              style={{ fontFamily: theme.fontFamily }}
            >
              <option value="">Template default</option>
              {FONT_OPTIONS.map((font) => (
                <option key={font.id} value={font.id} style={{ fontFamily: font.cssFamily }}>
                  {font.name}
                </option>
              ))}
            </select>
          </Field>

          <div>
            <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-600">
              <span>Base font size</span>
              <span className="font-mono text-[11px] text-slate-400">{theme.baseFontSize}px</span>
            </div>
            <input
              type="range"
              aria-label="Base font size"
              min={FONT_SIZE_MIN}
              max={FONT_SIZE_MAX}
              step={1}
              value={theme.baseFontSize}
              onChange={(e) => setCustomization({ baseFontSize: Number(e.target.value) })}
              className="w-full accent-indigo-600"
            />
          </div>

          <div className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3">
            <ColorField
              label="Accent"
              value={theme.accent}
              onChange={(accent) => setCustomization({ accent })}
            />
            <ColorField
              label="Name"
              value={theme.nameColor}
              onChange={(nameColor) => setCustomization({ nameColor })}
            />
            <ColorField
              label="Links"
              value={theme.linkColor}
              onChange={(linkColor) => setCustomization({ linkColor })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <input
                type="checkbox"
                checked={theme.accentBar}
                onChange={(e) => setCustomization({ accentBar: e.target.checked })}
                className="accent-indigo-600"
              />
              Accent bar under the name
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <input
                type="checkbox"
                checked={theme.headingRule}
                onChange={(e) => setCustomization({ headingRule: e.target.checked })}
                className="accent-indigo-600"
              />
              Rule under section headings
            </label>
          </div>

          <div
            className="rounded-lg border border-slate-200 p-3"
            style={{ fontFamily: theme.fontFamily, fontSize: theme.baseFontSize }}
          >
            <p style={{ color: theme.nameColor }} className="font-semibold">
              Alex Morgan
            </p>
            <p className="text-slate-500" style={{ fontSize: '0.95em' }}>
              Product Engineer ·{' '}
              <span style={{ color: theme.linkColor }} className="underline">
                alexmorgan.dev
              </span>
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={resetCustomization}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700"
          >
            <RotateCcw size={13} />
            Reset to template
          </button>
          <button
            type="button"
            onClick={close}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
