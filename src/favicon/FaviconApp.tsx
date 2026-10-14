import { useRef } from 'react'
import { Copy, Download, FileArchive, ImagePlus, Trash2 } from 'lucide-react'
import { ToolHeader } from '../components/ui/ToolHeader'
import { toast } from '../lib/toast'
import { downloadBlob } from '../lib/helpers'
import { useFaviconStore } from './store'
import {
  SIZES,
  faviconDataUri,
  faviconSvg,
  linkTags,
  webmanifest,
  type FaviconMode,
  type FaviconShape,
} from './model'
import { buildIco, type IcoImage } from './ico'
import { buildZip, type ZipFile } from './zip'

const inputClass =
  'w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-2 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500'

const ghostButton =
  'inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'

const modes: { id: FaviconMode; label: string }[] = [
  { id: 'letter', label: 'Letter' },
  { id: 'image', label: 'Image' },
]

function bytesBlob(bytes: Uint8Array, type: string): Blob {
  return new Blob([bytes.slice()], { type })
}

function base64ToBytes(dataUrl: string): Uint8Array {
  const binary = atob(dataUrl.split(',')[1] ?? '')
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

function svgToPngBytes(svg: string, size: number): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('no context')
        ctx.drawImage(image, 0, 0, size, size)
        resolve(base64ToBytes(canvas.toDataURL('image/png')))
      } catch (error) {
        reject(error instanceof Error ? error : new Error('render failed'))
      }
    }
    image.onerror = () => reject(new Error('render failed'))
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  })
}

export function FaviconApp() {
  const config = useFaviconStore((s) => s.config)
  const update = useFaviconStore((s) => s.update)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const svg = faviconSvg(config)
  const dataUri = faviconDataUri(config)

  const onPickImage = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      update({ image: String(reader.result) })
      toast.success('Image added')
    }
    reader.onerror = () => toast.error('Couldn’t read that image')
    reader.readAsDataURL(file)
  }

  const downloadSvg = () => {
    downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), 'favicon.svg')
  }

  const downloadPng = async () => {
    try {
      const bytes = await svgToPngBytes(svg, 512)
      downloadBlob(bytesBlob(bytes, 'image/png'), 'favicon-512.png')
    } catch {
      toast.error('PNG export unavailable in this browser')
    }
  }

  const downloadIco = async () => {
    try {
      const images: IcoImage[] = []
      for (const size of [16, 32, 48]) {
        images.push({ size, png: await svgToPngBytes(svg, size) })
      }
      downloadBlob(bytesBlob(buildIco(images), 'image/x-icon'), 'favicon.ico')
    } catch {
      toast.error('ICO export unavailable in this browser')
    }
  }

  const downloadZip = async () => {
    try {
      const encoder = new TextEncoder()
      const files: ZipFile[] = []
      for (const size of SIZES) {
        files.push({ name: `favicon-${size}.png`, data: await svgToPngBytes(svg, size) })
      }
      files.push({ name: 'apple-touch-icon.png', data: await svgToPngBytes(svg, 180) })
      files.push({ name: 'favicon.svg', data: encoder.encode(svg) })
      files.push({ name: 'site.webmanifest', data: encoder.encode(webmanifest(config)) })
      const ico = buildIco(
        await Promise.all([16, 32, 48].map(async (size) => ({ size, png: await svgToPngBytes(svg, size) }))),
      )
      files.push({ name: 'favicon.ico', data: ico })
      downloadBlob(bytesBlob(buildZip(files), 'application/zip'), 'favicons.zip')
    } catch {
      toast.error('ZIP export unavailable in this browser')
    }
  }

  const copyLinkTags = async () => {
    try {
      await navigator.clipboard.writeText(linkTags())
      toast.success('Link tags copied')
    } catch {
      toast.error('Clipboard unavailable')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800">
      <ToolHeader icon={ImagePlus} title="Favicon Generator" subtitle="Create a crisp favicon and download the full bundle." />

      <main className="mx-auto grid max-w-4xl gap-4 px-4 py-6 md:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <div className="flex gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
            {modes.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => update({ mode: item.id })}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  config.mode === item.id ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {config.mode === 'letter' ? (
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
              Letters (1–2)
              <input
                aria-label="Letters"
                maxLength={2}
                className={inputClass}
                value={config.text}
                onChange={(e) => update({ text: e.target.value })}
              />
            </label>
          ) : (
            <div className="flex flex-col gap-2">
              <label htmlFor="favicon-image" className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Source image
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => fileInputRef.current?.click()} className={ghostButton}>
                  <ImagePlus size={14} />
                  {config.image ? 'Change image' : 'Upload image'}
                </button>
                {config.image ? (
                  <button
                    type="button"
                    onClick={() => update({ image: '' })}
                    className="inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                ) : null}
              </div>
              <input
                ref={fileInputRef}
                id="favicon-image"
                type="file"
                accept="image/*"
                className="hidden"
                aria-label="Upload image"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) onPickImage(file)
                  event.target.value = ''
                }}
              />
            </div>
          )}

          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            Shape
            <select
              aria-label="Shape"
              className="rounded-md border border-slate-200 dark:border-slate-700 px-2 py-2 text-sm text-slate-600 dark:text-slate-300"
              value={config.shape}
              onChange={(e) => update({ shape: e.target.value as FaviconShape })}
            >
              <option value="square">Square</option>
              <option value="rounded">Rounded</option>
              <option value="circle">Circle</option>
            </select>
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
              Background
              <input aria-label="Background" type="color" className="h-9 w-full rounded-md border border-slate-200 dark:border-slate-700" value={config.background} onChange={(e) => update({ background: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
              Letter colour
              <input aria-label="Letter colour" type="color" className="h-9 w-full rounded-md border border-slate-200 dark:border-slate-700" value={config.foreground} onChange={(e) => update({ foreground: e.target.value })} />
            </label>
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
            <input type="checkbox" checked={config.bold} onChange={(e) => update({ bold: e.target.checked })} /> Bold
          </label>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={downloadSvg} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500">
              <Download size={15} /> SVG
            </button>
            <button type="button" onClick={downloadPng} className={ghostButton}>
              <Download size={15} /> PNG 512
            </button>
            <button type="button" onClick={downloadIco} className={ghostButton}>
              <Download size={15} /> ICO
            </button>
            <button type="button" onClick={downloadZip} className={ghostButton}>
              <FileArchive size={15} /> ZIP
            </button>
            <button type="button" onClick={copyLinkTags} className={ghostButton}>
              <Copy size={15} /> Copy link tags
            </button>
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Preview at every size</span>
          <div aria-label="Favicon preview" className="flex flex-wrap items-end gap-4">
            {SIZES.map((size) => (
              <div key={size} className="flex flex-col items-center gap-1">
                <img src={dataUri} alt={`${size}px favicon`} width={Math.min(size, 64)} height={Math.min(size, 64)} />
                <span className="text-[10px] text-slate-400 dark:text-slate-500">{size}px</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default FaviconApp
