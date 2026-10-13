import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  Download,
  ImagePlus,
  LayoutTemplate,
  Link2,
  Loader2,
  Palette,
  RotateCcw,
  Sparkles,
  Trash2,
  Type,
} from 'lucide-react'
import { downloadBlob, resumeHasContent, slug } from '../lib/helpers'
import { FONT_OPTIONS } from '../lib/templates'
import { useResumeStore } from '../store/resumeStore'
import { toast } from '../lib/toast'
import { goHome } from '../home/navigation'
import { BRAND } from '../home/config'
import {
  BANNER_SIZES,
  BANNER_THEMES,
  DEFAULT_DESIGN,
  applyTheme,
  backgroundStyle,
  clampDimension,
  findSize,
  fontFamily,
  layout,
  loadDesign,
  saveDesign,
  type BannerAlign,
  type BannerDesign,
  type BannerVAlign,
} from './design'

const JUSTIFY: Record<BannerAlign, string> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
}

const ALIGN_ITEMS: Record<BannerVAlign, string> = {
  top: 'flex-start',
  center: 'center',
  bottom: 'flex-end',
}

function Card({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <span className="text-indigo-600">{icon}</span>
        {title}
      </h2>
      <div className="mt-3 flex flex-col gap-3">{children}</div>
    </section>
  )
}

function Label({ children }: { children: ReactNode }) {
  return <span className="text-[11px] font-medium text-slate-500">{children}</span>
}

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'

function Seg<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T
  options: { value: T; label: ReactNode; title?: string }[]
  onChange: (value: T) => void
  label: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      <div className="flex rounded-lg border border-slate-200 p-0.5">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            title={option.title}
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={`flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition ${
              value === option.value
                ? 'bg-indigo-600 text-white'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="flex items-center justify-between gap-2">
      <Label>{label}</Label>
      <span className="flex items-center gap-2">
        <span className="font-mono text-[11px] uppercase text-slate-400">{value}</span>
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-7 w-9 cursor-pointer rounded border border-slate-200 bg-white"
        />
      </span>
    </label>
  )
}

function useBannerScale(width: number) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const available = el.clientWidth
      if (available > 0) setScale(Math.min(1, available / width))
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [width])

  return { ref, scale }
}

export function BannerApp() {
  const [design, setDesign] = useState<BannerDesign>(loadDesign)
  const [busy, setBusy] = useState(false)
  const nodeRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const resume = useResumeStore((s) => s.resume)
  const { ref: wrapperRef, scale } = useBannerScale(design.width)

  useEffect(() => {
    saveDesign(design)
  }, [design])

  const update = (patch: Partial<BannerDesign>) => setDesign((prev) => ({ ...prev, ...patch }))

  const box = useMemo(() => layout(design), [design])
  const hasCustomBgImage = design.bgType === 'image' && design.imageUrl.length > 0

  const onSizeChange = (id: string) => {
    if (id === 'custom') {
      update({ sizeId: 'custom' })
      return
    }
    const size = findSize(id)
    if (size) update({ sizeId: id, width: size.width, height: size.height })
  }

  const onPickImage = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      update({ bgType: 'image', imageUrl: String(reader.result) })
      toast.success('Background image added')
    }
    reader.onerror = () => toast.error('Couldn’t read that image')
    reader.readAsDataURL(file)
  }

  const importFromCv = () => {
    if (!resumeHasContent(resume)) {
      toast.error('No saved CV found', { description: 'Build or import one in the CV Builder first.' })
      return
    }
    update({
      title: resume.profile.fullName || design.title,
      subtitle: resume.profile.headline || design.subtitle,
    })
    toast.success('Imported from CV Builder')
  }

  const reset = () => {
    toast.confirm({
      message: 'Reset the banner?',
      description: 'Your current design will be replaced with the default.',
      confirmLabel: 'Reset banner',
      tone: 'error',
      onConfirm: () => {
        setDesign({ ...DEFAULT_DESIGN })
        toast.success('Banner reset')
      },
    })
  }

  const download = async () => {
    const node = nodeRef.current
    if (!node) return
    setBusy(true)
    const id = toast.loading('Preparing PNG…', { key: 'banner-export' })
    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(node, {
        width: design.width,
        height: design.height,
        pixelRatio: 2,
        cacheBust: true,
      })
      const blob = await (await fetch(dataUrl)).blob()
      downloadBlob(blob, `${slug(design.title || 'banner')}-${design.width}x${design.height}.png`)
      toast.update(id, { variant: 'success', message: 'PNG downloaded', duration: 2500 })
    } catch {
      toast.update(id, { variant: 'error', message: 'Couldn’t export the banner', duration: 5000 })
    } finally {
      setBusy(false)
    }
  }

  const bannerStyle: CSSProperties = {
    width: design.width,
    height: design.height,
    fontFamily: fontFamily(design.fontId),
    ...backgroundStyle(design),
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5">
          <button
            type="button"
            aria-label={`Go to ${BRAND} home`}
            title="All tools"
            onClick={() => goHome()}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <ArrowLeft size={15} />
          </button>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <LayoutTemplate size={16} />
          </span>
          <div className="mr-auto min-w-0">
            <h1 className="truncate text-sm font-semibold text-slate-800">Banner Maker</h1>
            <p className="hidden truncate text-[11px] text-slate-400 sm:block">
              Design social and LinkedIn banners in your browser.
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw size={14} />
            Reset
          </button>
          <button
            type="button"
            onClick={download}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            {busy ? 'Preparing…' : 'Download PNG'}
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <Card title="Canvas" icon={<LayoutTemplate size={16} />}>
            <label className="flex flex-col gap-1">
              <Label>Preset size</Label>
              <select
                value={design.sizeId}
                onChange={(event) => onSizeChange(event.target.value)}
                className={inputClass}
              >
                {BANNER_SIZES.map((size) => (
                  <option key={size.id} value={size.id}>
                    {size.name} · {size.width}×{size.height}
                  </option>
                ))}
                <option value="custom">Custom size</option>
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <Label>Width</Label>
                <input
                  type="number"
                  min={100}
                  max={4000}
                  value={design.width}
                  onChange={(event) =>
                    update({
                      width: clampDimension(Number(event.target.value)),
                      sizeId: 'custom',
                    })
                  }
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1">
                <Label>Height</Label>
                <input
                  type="number"
                  min={100}
                  max={4000}
                  value={design.height}
                  onChange={(event) =>
                    update({
                      height: clampDimension(Number(event.target.value)),
                      sizeId: 'custom',
                    })
                  }
                  className={inputClass}
                />
              </label>
            </div>
          </Card>

          <Card title="Theme" icon={<Palette size={16} />}>
            <div className="grid grid-cols-3 gap-2">
              {BANNER_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setDesign((prev) => applyTheme(prev, theme))}
                  className="flex flex-col items-center gap-1 rounded-lg border border-slate-200 p-2 text-[11px] font-medium text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50"
                >
                  <span
                    className="h-6 w-full rounded"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${theme.bgColor}, ${theme.bgColor2})`,
                    }}
                  />
                  {theme.name}
                </button>
              ))}
            </div>
          </Card>

          <Card title="Background" icon={<ImagePlus size={16} />}>
            <Seg
              label="Fill"
              value={design.bgType}
              onChange={(value) => update({ bgType: value })}
              options={[
                { value: 'solid', label: 'Solid' },
                { value: 'gradient', label: 'Gradient' },
                { value: 'image', label: 'Image' },
              ]}
            />
            {design.bgType === 'image' ? (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  <ImagePlus size={14} />
                  {hasCustomBgImage ? 'Replace image' : 'Upload image'}
                </button>
                {hasCustomBgImage ? (
                  <button
                    type="button"
                    onClick={() => update({ imageUrl: '' })}
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                ) : null}
                <label className="flex flex-1 items-center justify-between gap-2">
                  <Label>Overlay</Label>
                  <input
                    type="range"
                    min={0}
                    max={0.8}
                    step={0.05}
                    value={design.overlay}
                    onChange={(event) => update({ overlay: Number(event.target.value) })}
                    className="w-28 accent-indigo-600"
                  />
                </label>
              </div>
            ) : null}
            <ColorRow
              label="Color"
              value={design.bgColor}
              onChange={(value) => update({ bgColor: value })}
            />
            {design.bgType === 'gradient' ? (
              <>
                <ColorRow
                  label="Second color"
                  value={design.bgColor2}
                  onChange={(value) => update({ bgColor2: value })}
                />
                <label className="flex items-center justify-between gap-2">
                  <Label>Angle</Label>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={design.gradientAngle}
                    onChange={(event) => update({ gradientAngle: Number(event.target.value) })}
                    className="w-40 accent-indigo-600"
                  />
                </label>
              </>
            ) : null}
          </Card>

          <Card title="Text" icon={<Type size={16} />}>
            <label className="flex flex-col gap-1">
              <Label>Title</Label>
              <input
                value={design.title}
                onChange={(event) => update({ title: event.target.value })}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1">
              <Label>Subtitle</Label>
              <input
                value={design.subtitle}
                onChange={(event) => update({ subtitle: event.target.value })}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1">
              <Label>Badge</Label>
              <input
                value={design.badge}
                onChange={(event) => update({ badge: event.target.value })}
                className={inputClass}
              />
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={design.showBadge}
                onChange={(event) => update({ showBadge: event.target.checked })}
                className="h-3.5 w-3.5 accent-indigo-600"
              />
              <span className="text-xs text-slate-600">Show badge</span>
            </label>
            <label className="flex flex-col gap-1">
              <Label>Font</Label>
              <select
                value={design.fontId}
                onChange={(event) => update({ fontId: event.target.value })}
                className={inputClass}
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font.id} value={font.id}>
                    {font.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center justify-between gap-2">
              <Label>Title size</Label>
              <input
                type="range"
                min={0.6}
                max={1.8}
                step={0.05}
                value={design.titleScale}
                onChange={(event) => update({ titleScale: Number(event.target.value) })}
                className="w-40 accent-indigo-600"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Seg
                label="Align"
                value={design.align}
                onChange={(value) => update({ align: value })}
                options={[
                  { value: 'left', label: <AlignLeft size={14} />, title: 'Align left' },
                  { value: 'center', label: <AlignCenter size={14} />, title: 'Align centre' },
                  { value: 'right', label: <AlignRight size={14} />, title: 'Align right' },
                ]}
              />
              <Seg
                label="Vertical"
                value={design.valign}
                onChange={(value) => update({ valign: value })}
                options={[
                  { value: 'top', label: 'Top' },
                  { value: 'center', label: 'Middle' },
                  { value: 'bottom', label: 'Bottom' },
                ]}
              />
            </div>
            <ColorRow
              label="Text color"
              value={design.textColor}
              onChange={(value) => update({ textColor: value })}
            />
            <ColorRow
              label="Accent color"
              value={design.accentColor}
              onChange={(value) => update({ accentColor: value })}
            />
          </Card>

          <button
            type="button"
            onClick={importFromCv}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <Link2 size={14} />
            Import name &amp; headline from CV Builder
          </button>
        </div>

        <div className="lg:sticky lg:top-[4.5rem] lg:self-start">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles size={15} className="text-indigo-600" />
              <span className="text-xs font-medium text-slate-500">
                Preview · {design.width}×{design.height}px
              </span>
            </div>
            <div ref={wrapperRef} className="w-full">
              <div
                className="mx-auto overflow-hidden rounded-lg shadow-lg ring-1 ring-slate-200"
                style={{ width: design.width * scale, height: design.height * scale }}
              >
                <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                  <div ref={nodeRef} className="relative overflow-hidden" style={bannerStyle}>
                    {hasCustomBgImage ? (
                      <>
                        <img
                          src={design.imageUrl}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div
                          className="absolute inset-0"
                          style={{ backgroundColor: `rgba(2, 6, 23, ${design.overlay})` }}
                        />
                      </>
                    ) : null}
                    <div
                      className="relative flex h-full w-full"
                      style={{
                        padding: box.padding,
                        justifyContent: JUSTIFY[design.align],
                        alignItems: ALIGN_ITEMS[design.valign],
                      }}
                    >
                      <div
                        className="flex flex-col"
                        style={{
                          textAlign: design.align,
                          alignItems: JUSTIFY[design.align],
                          maxWidth: '88%',
                          gap: box.gap,
                        }}
                      >
                        {design.showBadge && design.badge.trim() ? (
                          <span
                            style={{
                              backgroundColor: design.accentColor,
                              color: '#0f172a',
                              fontSize: box.badgeSize,
                              fontWeight: 600,
                              padding: `${Math.round(box.badgeSize * 0.35)}px ${Math.round(box.badgeSize * 0.7)}px`,
                              borderRadius: 999,
                              letterSpacing: 0.5,
                            }}
                          >
                            {design.badge}
                          </span>
                        ) : null}
                        <span
                          style={{
                            color: design.textColor,
                            fontSize: box.titleSize,
                            fontWeight: 700,
                            lineHeight: 1.1,
                          }}
                        >
                          {design.title}
                        </span>
                        <span
                          style={{
                            color: design.textColor,
                            fontSize: box.subtitleSize,
                            opacity: 0.9,
                          }}
                        >
                          {design.subtitle}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) onPickImage(file)
            event.target.value = ''
          }}
        />
      </main>
    </div>
  )
}

export default BannerApp
