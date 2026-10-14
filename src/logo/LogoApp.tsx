import { Palette, Copy, Download, Shuffle } from 'lucide-react'
import { ToolHeader } from '../components/ui/ToolHeader'
import { toast } from '../lib/toast'
import { downloadBlob, slug } from '../lib/helpers'
import { useLogoStore } from './store'
import { FONTS, ICONS, LAYOUTS, SHAPES, logoSvg, randomLogo, type LogoShape } from './model'

const inputClass =
  'w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-2 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500'

export function LogoApp() {
  const config = useLogoStore((s) => s.config)
  const update = useLogoStore((s) => s.update)
  const replace = useLogoStore((s) => s.replace)

  const svg = logoSvg(config)

  const downloadSvg = () =>
    downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), `${slug(config.text || 'logo')}.svg`)

  const downloadPng = () => {
    const image = new Image()
    const url = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = 1024
        canvas.height = 1024
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('no context')
        ctx.drawImage(image, 0, 0, 1024, 1024)
        const dataUrl = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.href = dataUrl
        link.download = `${slug(config.text || 'logo')}.png`
        link.click()
      } catch {
        toast.error('PNG export unavailable in this browser')
      }
    }
    image.onerror = () => toast.error('Could not render logo')
    image.src = url
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800">
      <ToolHeader icon={Palette} title="Logo Maker" subtitle="Design a simple monogram logo and export it as SVG or PNG." />

      <main className="mx-auto grid max-w-4xl gap-4 px-4 py-6 md:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            Brand name
            <input aria-label="Brand name" className={inputClass} value={config.text} onChange={(e) => update({ text: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            Tagline
            <input aria-label="Tagline" className={inputClass} value={config.tagline} onChange={(e) => update({ tagline: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            Monogram (optional)
            <input aria-label="Monogram" className={inputClass} placeholder="Auto from name" value={config.monogram} onChange={(e) => update({ monogram: e.target.value })} />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
              Shape
              <select
                aria-label="Shape"
                className="rounded-md border border-slate-200 dark:border-slate-700 px-2 py-2 text-sm text-slate-600 dark:text-slate-300"
                value={config.shape}
                onChange={(e) => update({ shape: e.target.value as LogoShape })}
              >
                {SHAPES.map((shape) => (
                  <option key={shape.id} value={shape.id}>
                    {shape.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
              Font
              <select
                aria-label="Font"
                className="rounded-md border border-slate-200 dark:border-slate-700 px-2 py-2 text-sm text-slate-600 dark:text-slate-300"
                value={config.font}
                onChange={(e) => update({ font: e.target.value })}
              >
                {FONTS.map((font) => (
                  <option key={font} value={font}>
                    {font.split(',')[0]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Icon</span>
            <div className="grid grid-cols-7 gap-1.5">
              <button
                type="button"
                aria-label="None (monogram)"
                aria-pressed={config.icon === ''}
                onClick={() => update({ icon: '' })}
                className={`inline-flex h-9 items-center justify-center rounded-md border text-xs font-semibold ${
                  config.icon === '' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                Aa
              </button>
              {ICONS.map((icon) => (
                <button
                  key={icon.id}
                  type="button"
                  aria-label={`${icon.label} icon`}
                  aria-pressed={config.icon === icon.id}
                  onClick={() => update({ icon: icon.id })}
                  className={`inline-flex h-9 items-center justify-center rounded-md border ${
                    config.icon === icon.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={icon.path} />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Layout</span>
              <div className="inline-flex overflow-hidden rounded-md border border-slate-200 dark:border-slate-700">
                {LAYOUTS.map((layout) => (
                  <button
                    key={layout.id}
                    type="button"
                    aria-label={`${layout.label} layout`}
                    aria-pressed={config.layout === layout.id}
                    onClick={() => update({ layout: layout.id })}
                    className={`flex-1 px-3 py-1.5 text-xs font-medium ${
                      config.layout === layout.id ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {layout.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 self-end pb-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
              <input
                aria-label="Gradient"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 dark:text-indigo-400"
                checked={config.gradient}
                onChange={(e) => update({ gradient: e.target.checked })}
              />
              Gradient
            </label>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {(
              [
                ['primary', 'Accent'],
                ['secondary', 'Secondary'],
                ['background', 'Background'],
                ['textColor', 'Text'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                {label}
                <input
                  aria-label={label}
                  type="color"
                  className="h-9 w-full rounded-md border border-slate-200 dark:border-slate-700"
                  value={config[key]}
                  onChange={(e) => update({ [key]: e.target.value })}
                />
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => replace(randomLogo(config))}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Shuffle size={15} /> Randomise
            </button>
            <button
              type="button"
              onClick={downloadSvg}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              <Download size={15} /> SVG
            </button>
            <button
              type="button"
              onClick={downloadPng}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Download size={15} /> PNG
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(svg)
                  toast.success('SVG copied')
                } catch {
                  toast.error('Clipboard unavailable')
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Copy size={15} /> Copy SVG
            </button>
          </div>
        </section>

        <section className="flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <div aria-label="Logo preview" className="w-full max-w-xs overflow-hidden rounded-xl" dangerouslySetInnerHTML={{ __html: svg }} />
        </section>
      </main>
    </div>
  )
}

export default LogoApp
