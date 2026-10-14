import { useMemo, useState } from 'react'
import { Copy, Search } from 'lucide-react'
import { ToolHeader } from '../components/ui/ToolHeader'
import { toast } from '../lib/toast'
import {
  LIMITS,
  crumbsFromUrl,
  descriptionStatus,
  emptySeo,
  hostFromUrl,
  metaTags,
  seoWarnings,
  titleStatus,
  truncateText,
  type SeoInput,
} from './model'

const inputClass =
  'w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-2 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500'

const statusColor: Record<string, string> = {
  empty: 'text-slate-400 dark:text-slate-500',
  short: 'text-amber-500',
  good: 'text-emerald-600 dark:text-emerald-400',
  long: 'text-red-500',
}

const readImage = (file: File, onLoad: (dataUrl: string) => void) => {
  const reader = new FileReader()
  reader.onload = () => {
    if (typeof reader.result === 'string') onLoad(reader.result)
  }
  reader.readAsDataURL(file)
}

export function SeoPreviewApp() {
  const [input, setInput] = useState<SeoInput>(emptySeo)
  const patch = (updater: Partial<SeoInput>) => setInput((prev) => ({ ...prev, ...updater }))
  const warnings = useMemo(() => seoWarnings(input), [input])
  const tags = metaTags(input)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800">
      <ToolHeader icon={Search} title="SEO & Social Preview" subtitle="See how your page looks in Google, X and Facebook before you publish." />

      <main className="mx-auto grid max-w-5xl gap-4 px-4 py-6 lg:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            <span className="flex justify-between">
              Title
              <span className={statusColor[titleStatus(input.title)]}>
                {input.title.trim().length}/{LIMITS.title}
              </span>
            </span>
            <input aria-label="Title" className={inputClass} value={input.title} onChange={(e) => patch({ title: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            <span className="flex justify-between">
              Description
              <span className={statusColor[descriptionStatus(input.description)]}>
                {input.description.trim().length}/{LIMITS.description}
              </span>
            </span>
            <textarea
              aria-label="Description"
              rows={3}
              className={`${inputClass} resize-y`}
              value={input.description}
              onChange={(e) => patch({ description: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            URL
            <input aria-label="URL" className={inputClass} value={input.url} onChange={(e) => patch({ url: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            Site name
            <input aria-label="Site name" className={inputClass} value={input.siteName} onChange={(e) => patch({ siteName: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            Social image alt text
            <input aria-label="Image alt text" className={inputClass} value={input.imageAlt} onChange={(e) => patch({ imageAlt: e.target.value })} />
          </label>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Social share image (1200×630)</span>
            <div className="flex items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                Upload OG image
                <input
                  type="file"
                  accept="image/*"
                  aria-label="Upload OG image"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) readImage(file, (dataUrl) => patch({ ogImage: dataUrl }))
                  }}
                />
              </label>
              {input.ogImage ? (
                <button type="button" onClick={() => patch({ ogImage: '' })} className="text-xs text-slate-500 dark:text-slate-400 hover:text-red-500">
                  Remove
                </button>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Favicon</span>
            <div className="flex items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                Upload favicon
                <input
                  type="file"
                  accept="image/*"
                  aria-label="Upload favicon"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) readImage(file, (dataUrl) => patch({ favicon: dataUrl }))
                  }}
                />
              </label>
              {input.favicon ? (
                <button type="button" onClick={() => patch({ favicon: '' })} className="text-xs text-slate-500 dark:text-slate-400 hover:text-red-500">
                  Remove
                </button>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(tags)
                toast.success('Meta tags copied')
              } catch {
                toast.error('Clipboard unavailable')
              }
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            <Copy size={15} /> Copy meta tags
          </button>

          {warnings.length > 0 ? (
            <ul className="flex flex-col gap-1 rounded-lg bg-amber-50 dark:bg-amber-950 p-3 text-xs text-amber-700">
              {warnings.map((warning) => (
                <li key={warning}>• {warning}</li>
              ))}
            </ul>
          ) : (
            <p className="rounded-lg bg-emerald-50 dark:bg-emerald-950 p-3 text-xs text-emerald-700">Looks good — no issues found.</p>
          )}
        </section>

        <section className="flex flex-col gap-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Google result</span>
            <div className="mt-2">
              <div className="flex items-center gap-2">
                {input.favicon ? <img alt="Site favicon" src={input.favicon} className="h-4 w-4 rounded-sm" /> : null}
                <p className="text-xs text-slate-500 dark:text-slate-400">{crumbsFromUrl(input.url)}</p>
              </div>
              <p className="text-lg text-[#1a0dab]">{truncateText(input.title || 'Page title', LIMITS.title)}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{truncateText(input.description || 'Meta description preview…', LIMITS.description)}</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">X / Twitter card</span>
            <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
              {input.ogImage ? (
                <img alt="Social share image" src={input.ogImage} className="h-40 w-full object-cover" />
              ) : (
                <div className="grid place-items-center bg-slate-100 dark:bg-slate-800 py-10 text-xs text-slate-400 dark:text-slate-500">Social image</div>
              )}
              <div className="p-3">
                <p className="text-xs text-slate-400 dark:text-slate-500">{hostFromUrl(input.url)}</p>
                <p className="font-medium text-slate-800 dark:text-slate-100">{truncateText(input.title || 'Page title', 70)}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{truncateText(input.description, 200)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Facebook / Open Graph</span>
            <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
              {input.ogImage ? (
                <img alt="Social share image" src={input.ogImage} className="h-48 w-full object-cover" />
              ) : (
                <div className="grid place-items-center bg-slate-100 dark:bg-slate-800 py-12 text-xs text-slate-400 dark:text-slate-500">Social image</div>
              )}
              <div className="bg-slate-50 dark:bg-slate-800 p-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">{hostFromUrl(input.url)}</p>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{truncateText(input.title || 'Page title', 88)}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{truncateText(input.description, 110)}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default SeoPreviewApp
