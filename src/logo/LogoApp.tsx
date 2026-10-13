import { Palette, Copy, Download, Shuffle } from 'lucide-react'
import { ToolHeader } from '../components/ui/ToolHeader'
import { toast } from '../lib/toast'
import { downloadBlob, slug } from '../lib/helpers'
import { useLogoStore } from './store'
import { FONTS, SHAPES, logoSvg, randomLogo, type LogoShape } from './model'

const inputClass =
  'w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500'

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
    <div className="min-h-screen bg-slate-50">
      <ToolHeader icon={Palette} title="Logo Maker" subtitle="Design a simple monogram logo and export it as SVG or PNG." />

      <main className="mx-auto grid max-w-4xl gap-4 px-4 py-6 md:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Brand name
            <input aria-label="Brand name" className={inputClass} value={config.text} onChange={(e) => update({ text: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Tagline
            <input aria-label="Tagline" className={inputClass} value={config.tagline} onChange={(e) => update({ tagline: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Monogram (optional)
            <input aria-label="Monogram" className={inputClass} placeholder="Auto from name" value={config.monogram} onChange={(e) => update({ monogram: e.target.value })} />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
              Shape
              <select
                aria-label="Shape"
                className="rounded-md border border-slate-200 px-2 py-2 text-sm text-slate-600"
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
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
              Font
              <select
                aria-label="Font"
                className="rounded-md border border-slate-200 px-2 py-2 text-sm text-slate-600"
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
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ['primary', 'Accent'],
                ['background', 'Background'],
                ['textColor', 'Text'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                {label}
                <input
                  aria-label={label}
                  type="color"
                  className="h-9 w-full rounded-md border border-slate-200"
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
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
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
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
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
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <Copy size={15} /> Copy SVG
            </button>
          </div>
        </section>

        <section className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div aria-label="Logo preview" className="w-full max-w-xs overflow-hidden rounded-xl" dangerouslySetInnerHTML={{ __html: svg }} />
        </section>
      </main>
    </div>
  )
}

export default LogoApp
