import { Copy, Download, Star } from 'lucide-react'
import { ToolHeader } from '../components/ui/ToolHeader'
import { toast } from '../lib/toast'
import { downloadBlob } from '../lib/helpers'
import { useFaviconStore } from './store'
import { SIZES, faviconDataUri, faviconLinkTag, faviconSvg, type FaviconShape } from './model'

const inputClass =
  'w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500'

export function FaviconApp() {
  const config = useFaviconStore((s) => s.config)
  const update = useFaviconStore((s) => s.update)
  const svg = faviconSvg(config)
  const dataUri = faviconDataUri(config)

  const downloadSvg = () => downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), 'favicon.svg')

  const downloadPng = () => {
    const image = new Image()
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = 512
        canvas.height = 512
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('no context')
        ctx.drawImage(image, 0, 0, 512, 512)
        const link = document.createElement('a')
        link.href = canvas.toDataURL('image/png')
        link.download = 'favicon-512.png'
        link.click()
      } catch {
        toast.error('PNG export unavailable in this browser')
      }
    }
    image.onerror = () => toast.error('Could not render favicon')
    image.src = dataUri
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ToolHeader icon={Star} title="Favicon Generator" subtitle="Create a crisp favicon and copy the link tag into your site." />

      <main className="mx-auto grid max-w-4xl gap-4 px-4 py-6 md:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Letters (1–2)
            <input aria-label="Letters" maxLength={2} className={inputClass} value={config.text} onChange={(e) => update({ text: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Shape
            <select
              aria-label="Shape"
              className="rounded-md border border-slate-200 px-2 py-2 text-sm text-slate-600"
              value={config.shape}
              onChange={(e) => update({ shape: e.target.value as FaviconShape })}
            >
              <option value="square">Square</option>
              <option value="rounded">Rounded</option>
              <option value="circle">Circle</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
              Background
              <input aria-label="Background" type="color" className="h-9 w-full rounded-md border border-slate-200" value={config.background} onChange={(e) => update({ background: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
              Letter colour
              <input aria-label="Letter colour" type="color" className="h-9 w-full rounded-md border border-slate-200" value={config.foreground} onChange={(e) => update({ foreground: e.target.value })} />
            </label>
          </div>
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <input type="checkbox" checked={config.bold} onChange={(e) => update({ bold: e.target.checked })} /> Bold
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={downloadSvg} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500">
              <Download size={15} /> SVG
            </button>
            <button type="button" onClick={downloadPng} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              <Download size={15} /> PNG 512
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(faviconLinkTag(config))
                  toast.success('Link tag copied')
                } catch {
                  toast.error('Clipboard unavailable')
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <Copy size={15} /> Copy link tag
            </button>
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-medium text-slate-400">Preview at every size</span>
          <div aria-label="Favicon preview" className="flex flex-wrap items-end gap-4">
            {SIZES.map((size) => (
              <div key={size} className="flex flex-col items-center gap-1">
                <img src={dataUri} alt={`${size}px favicon`} width={Math.min(size, 64)} height={Math.min(size, 64)} />
                <span className="text-[10px] text-slate-400">{size}px</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default FaviconApp
