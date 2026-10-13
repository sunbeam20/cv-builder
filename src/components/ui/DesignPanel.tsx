import { Palette, RotateCcw, X } from 'lucide-react'
import { useResumeStore } from '../../store/resumeStore'
import { useResolvedTheme } from '../../lib/useResolvedTheme'
import {
  BULLET_LABELS,
  BULLET_STYLES,
  DESIGN_PRESETS,
  FONT_OPTIONS,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  HEADING_CASE_LABELS,
  HEADING_CASES,
  HEADING_SCALE_MAX,
  HEADING_SCALE_MIN,
  HEADING_WEIGHTS,
  HEADING_WEIGHT_LABELS,
  LINE_HEIGHT_MAX,
  LINE_HEIGHT_MIN,
  MARGIN_X_MAX,
  MARGIN_X_MIN,
  MARGIN_Y_MAX,
  MARGIN_Y_MIN,
  NAME_SCALE_MAX,
  NAME_SCALE_MIN,
  NAME_TRACKING_MAX,
  NAME_TRACKING_MIN,
  RULE_THICKNESS_MAX,
  RULE_THICKNESS_MIN,
  SECTION_SPACING_MAX,
  SECTION_SPACING_MIN,
  TEMPLATES,
  TRACKING_MAX,
  TRACKING_MIN,
} from '../../lib/templates'
import type { BulletStyle, HeadingCase } from '../../lib/templates'
import { Field } from './inputs'

function SliderField({
  label,
  display,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  display: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-600">
        <span>{label}</span>
        <span className="font-mono text-[11px] text-slate-400">{display}</span>
      </div>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-indigo-600"
      />
    </div>
  )
}

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
          <div>
            <div className="mb-1 text-xs font-medium text-slate-600">Presets</div>
            <div className="flex flex-wrap gap-2">
              {DESIGN_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setCustomization(preset.customization)}
                  className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

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

          <SliderField
            label="Base font size"
            display={`${theme.baseFontSize}px`}
            value={theme.baseFontSize}
            min={FONT_SIZE_MIN}
            max={FONT_SIZE_MAX}
            step={1}
            onChange={(baseFontSize) => setCustomization({ baseFontSize })}
          />

          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3">
            <SliderField
              label="Name size"
              display={`${Math.round(theme.nameScale * 100)}%`}
              value={theme.nameScale}
              min={NAME_SCALE_MIN}
              max={NAME_SCALE_MAX}
              step={0.05}
              onChange={(nameScale) => setCustomization({ nameScale })}
            />
            <SliderField
              label="Heading size"
              display={`${Math.round(theme.headingScale * 100)}%`}
              value={theme.headingScale}
              min={HEADING_SCALE_MIN}
              max={HEADING_SCALE_MAX}
              step={0.05}
              onChange={(headingScale) => setCustomization({ headingScale })}
            />
            <SliderField
              label="Section spacing"
              display={`${theme.sectionSpacing}px`}
              value={theme.sectionSpacing}
              min={SECTION_SPACING_MIN}
              max={SECTION_SPACING_MAX}
              step={1}
              onChange={(sectionSpacing) => setCustomization({ sectionSpacing })}
            />
            <label className="flex items-center justify-between gap-2 text-xs font-medium text-slate-600">
              Bullet style
              <select
                aria-label="Bullet style"
                value={theme.bulletStyle}
                onChange={(e) => setCustomization({ bulletStyle: e.target.value as BulletStyle })}
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-indigo-500"
              >
                {BULLET_STYLES.map((style) => (
                  <option key={style} value={style}>
                    {BULLET_LABELS[style]}
                  </option>
                ))}
              </select>
            </label>
            <SliderField
              label="Name letter spacing"
              display={`${theme.nameTracking.toFixed(2)}em`}
              value={theme.nameTracking}
              min={NAME_TRACKING_MIN}
              max={NAME_TRACKING_MAX}
              step={0.01}
              onChange={(nameTracking) => setCustomization({ nameTracking })}
            />
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3">
            <label className="flex items-center justify-between gap-2 text-xs font-medium text-slate-600">
              Heading case
              <select
                aria-label="Heading case"
                value={theme.headingCase}
                onChange={(e) => setCustomization({ headingCase: e.target.value as HeadingCase })}
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-indigo-500"
              >
                {HEADING_CASES.map((value) => (
                  <option key={value} value={value}>
                    {HEADING_CASE_LABELS[value]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center justify-between gap-2 text-xs font-medium text-slate-600">
              Heading weight
              <select
                aria-label="Heading weight"
                value={theme.headingWeight}
                onChange={(e) => setCustomization({ headingWeight: Number(e.target.value) })}
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-indigo-500"
              >
                {HEADING_WEIGHTS.map((weight) => (
                  <option key={weight} value={weight}>
                    {HEADING_WEIGHT_LABELS[weight]}
                  </option>
                ))}
              </select>
            </label>
            <SliderField
              label="Rule thickness"
              display={`${theme.ruleThickness.toFixed(1)}px`}
              value={theme.ruleThickness}
              min={RULE_THICKNESS_MIN}
              max={RULE_THICKNESS_MAX}
              step={0.5}
              onChange={(ruleThickness) => setCustomization({ ruleThickness })}
            />
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3">
            <SliderField
              label="Page margin (vertical)"
              display={`${theme.pageMarginY}px`}
              value={theme.pageMarginY}
              min={MARGIN_Y_MIN}
              max={MARGIN_Y_MAX}
              step={1}
              onChange={(pageMarginY) => setCustomization({ pageMarginY })}
            />
            <SliderField
              label="Page margin (horizontal)"
              display={`${theme.pageMarginX}px`}
              value={theme.pageMarginX}
              min={MARGIN_X_MIN}
              max={MARGIN_X_MAX}
              step={1}
              onChange={(pageMarginX) => setCustomization({ pageMarginX })}
            />
            <SliderField
              label="Line height"
              display={theme.lineHeight.toFixed(2)}
              value={theme.lineHeight}
              min={LINE_HEIGHT_MIN}
              max={LINE_HEIGHT_MAX}
              step={0.05}
              onChange={(lineHeight) => setCustomization({ lineHeight })}
            />
            <SliderField
              label="Heading letter spacing"
              display={`${theme.headingTracking.toFixed(2)}em`}
              value={theme.headingTracking}
              min={TRACKING_MIN}
              max={TRACKING_MAX}
              step={0.01}
              onChange={(headingTracking) => setCustomization({ headingTracking })}
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
            <ColorField
              label="Heading rule"
              value={theme.ruleColor}
              onChange={(ruleColor) => setCustomization({ ruleColor })}
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
