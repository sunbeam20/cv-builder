import { useEffect, useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Download,
  Heart,
  Home,
  Image as ImageIcon,
  Lock,
  MousePointerClick,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react'
import { BRAND, TAGLINE } from './config'
import { goHome, openTool } from './navigation'
import { LIVE_TOOLS, TOOLS, TOOL_BY_SLUG, toolsByCategory } from './tools'
import type { ToolDefinition } from './tools'
import { HeroPrompt } from './HeroPrompt'
import { CategorySidebar } from './CategorySidebar'
import { ThemeToggle } from './ThemeToggle'
import { useHubStore } from './hubStore'
import { ResumePage } from '../preview/ResumePreview'
import { sampleResume } from '../lib/sampleData'
import { TEMPLATES } from '../lib/templates'
import { A4_WIDTH } from '../preview/useFitScale'

const HERO_SCALE = 0.44
const SLIDE_HEIGHT = 400
const ROTATE_MS = 4500

const YEAR = new Date().getFullYear()

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-700 bg-white/85 dark:bg-slate-900/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => goHome()}
          aria-label={`${BRAND} home`}
          className="mr-auto flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:text-indigo-700 dark:hover:text-indigo-300 lg:hidden"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Home size={15} />
          </span>
          {BRAND}
        </button>
        <button
          type="button"
          onClick={() => scrollTo('why')}
          className="hidden rounded-md px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100 sm:inline-block lg:ml-auto"
        >
          Why {BRAND}
        </button>
        <button
          type="button"
          onClick={() => scrollTo('tools')}
          className="hidden items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-medium text-white transition hover:bg-indigo-700 sm:inline-flex"
        >
          Explore
          <ArrowRight size={14} />
        </button>
        <ThemeToggle className="lg:hidden" />
      </div>
    </header>
  )
}

/* --- Hero preview slides -------------------------------------------------
 * The carousel is generated from the tool registry, so every tool (including
 * future ones) gets an equal slide without touching this list. A tool with a
 * bespoke preview below is rendered custom; anything else falls back to a
 * generic, on-brand slide.
 * ------------------------------------------------------------------------ */

function CvPreview() {
  return (
    <div className="flex h-full items-start justify-center overflow-hidden bg-slate-100 dark:bg-slate-800 pt-7">
      <div
        aria-hidden
        className="pointer-events-none select-none overflow-hidden rounded-lg bg-white dark:bg-slate-900 shadow-xl ring-1 ring-slate-200 dark:ring-slate-700"
        style={{ width: A4_WIDTH * HERO_SCALE, height: SLIDE_HEIGHT - 48 }}
      >
        <div style={{ transform: `scale(${HERO_SCALE})`, transformOrigin: 'top left' }}>
          <ResumePage resume={sampleResume()} theme={TEMPLATES.ats} />
        </div>
      </div>
    </div>
  )
}

function AtsPreview() {
  const categories = [
    { label: 'Contact & essentials', score: 95 },
    { label: 'Structure & length', score: 88 },
    { label: 'Content quality', score: 90 },
    { label: 'Formatting', score: 94 },
  ]
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-emerald-50 to-white dark:to-slate-900 p-6">
      <div className="flex items-center gap-4 rounded-2xl bg-white dark:bg-slate-900 px-5 py-4 shadow ring-1 ring-slate-200 dark:ring-slate-700">
        <div
          className="grid h-16 w-16 shrink-0 place-items-center rounded-full"
          style={{ background: 'conic-gradient(#10b981 92%, #e2e8f0 0)' }}
        >
          <div className="grid h-12 w-12 place-items-center rounded-full bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-slate-50">
            92
          </div>
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">ATS score</p>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">Excellent</p>
        </div>
      </div>
      <div className="w-full max-w-xs space-y-2.5 rounded-xl bg-white dark:bg-slate-900 p-4 shadow ring-1 ring-slate-200 dark:ring-slate-700">
        {categories.map((category) => (
          <div key={category.label}>
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-medium text-slate-600 dark:text-slate-300">{category.label}</span>
              <span className="text-slate-400 dark:text-slate-500">{category.score}</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${category.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BannerPreview() {
  return (
    <div className="flex h-full items-center justify-center bg-slate-100 dark:bg-slate-800 p-6">
      <div className="w-full max-w-xs overflow-hidden rounded-xl shadow-xl ring-1 ring-slate-200 dark:ring-slate-700">
        <div className="flex flex-col gap-2 bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 px-6 py-8">
          <span className="w-fit rounded-full bg-white/20 dark:bg-slate-900/20 px-2 py-0.5 text-[9px] font-semibold tracking-wide text-white">
            OPEN TO WORK
          </span>
          <span className="text-xl font-bold text-white">Your Name</span>
          <span className="text-xs text-white/80">Senior Frontend Engineer</span>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-3">
          <ImageIcon size={14} className="text-indigo-600 dark:text-indigo-400" />
          <span className="text-[11px] text-slate-500 dark:text-slate-400">LinkedIn · 1584 × 396 · PNG</span>
        </div>
      </div>
    </div>
  )
}

function PortfolioPreview() {
  return (
    <div className="flex h-full items-center justify-center bg-slate-100 dark:bg-slate-800 p-6">
      <div className="w-full max-w-xs overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-xl ring-1 ring-slate-200 dark:ring-slate-700">
        <div className="h-2 w-full bg-indigo-600" />
        <div className="p-5">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
            J
          </span>
          <div className="mt-3 h-3 w-28 rounded bg-slate-800" />
          <div className="mt-2 h-2 w-40 rounded bg-indigo-500/60" />
          <div className="mt-4 flex flex-wrap gap-1.5">
            {['React', 'TypeScript', 'Node'].map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 text-[10px] font-medium text-indigo-600 dark:text-indigo-400"
              >
                {skill}
              </span>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="h-14 rounded-lg bg-slate-100 dark:bg-slate-800" />
            <div className="h-14 rounded-lg bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>
      </div>
    </div>
  )
}

function GenericPreview({ tool }: { tool: ToolDefinition }) {
  const Icon = tool.icon
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-indigo-50 dark:from-indigo-950 to-white dark:to-slate-900 p-6">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg">
        <Icon size={26} />
      </span>
      <div className="text-center">
        <p className="text-base font-bold text-slate-900 dark:text-slate-50">{tool.name}</p>
        <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {tool.tagline}
        </p>
      </div>
      {tool.features ? (
        <ul className="w-full max-w-xs space-y-1.5 rounded-xl bg-white dark:bg-slate-900 p-4 shadow ring-1 ring-slate-200 dark:ring-slate-700">
          {tool.features.slice(0, 3).map((feature) => (
            <li key={feature} className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
              <CheckCircle2 size={12} className="mt-0.5 shrink-0 text-emerald-500" />
              {feature}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function ToolPreview({ tool }: { tool: ToolDefinition }) {
  if (tool.slug === 'cv') return <CvPreview />
  if (tool.slug === 'ats') return <AtsPreview />
  if (tool.slug === 'banner') return <BannerPreview />
  if (tool.slug === 'portfolio') return <PortfolioPreview />
  return <GenericPreview tool={tool} />
}

function HeroVisual() {
  const tools = LIVE_TOOLS
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || tools.length < 2 || prefersReducedMotion()) return
    const id = window.setInterval(() => setActive((i) => (i + 1) % tools.length), ROTATE_MS)
    return () => window.clearInterval(id)
  }, [paused, tools.length])

  const current = tools[active] ?? tools[0]

  return (
    <div className="mx-auto w-full max-w-md">
      <div
        className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {tools.map((tool) => (
            <div key={tool.id} className="w-full shrink-0" style={{ height: SLIDE_HEIGHT }}>
              <ToolPreview tool={tool} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2" aria-hidden={tools.length < 2}>
          {tools.map((tool, index) => (
            <button
              key={tool.id}
              type="button"
              aria-label={`Show ${tool.name}`}
              aria-current={index === active}
              onClick={() => setActive(index)}
              className={`h-2 rounded-full transition-all ${
                index === active ? 'w-6 bg-indigo-500' : 'w-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
        {current ? (
          <button
            type="button"
            onClick={() => openTool(current.slug)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Try {current.name}
            <ArrowRight size={13} />
          </button>
        ) : null}
      </div>
    </div>
  )
}

function ToolCard({ tool }: { tool: ToolDefinition }) {
  const Icon = tool.icon
  const live = tool.status === 'live'
  const favourites = useHubStore((state) => state.favourites)
  const toggleFavourite = useHubStore((state) => state.toggleFavourite)
  const pinned = favourites.includes(tool.slug)
  return (
    <div
      className={`flex flex-col rounded-2xl border p-5 shadow-sm transition ${
        live
          ? 'border-indigo-100 dark:border-indigo-900 bg-white dark:bg-slate-900 hover:-translate-y-0.5 hover:shadow-md'
          : 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60'
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${
            live ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
          }`}
        >
          <Icon size={20} />
        </span>
        <div className="flex items-center gap-1.5">
          {live ? (
            <span className="rounded-full bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              Live
            </span>
          ) : (
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              Coming soon
            </span>
          )}
          <button
            type="button"
            aria-pressed={pinned}
            aria-label={pinned ? `Unpin ${tool.name}` : `Pin ${tool.name}`}
            title={pinned ? 'Unpin' : 'Pin to top'}
            onClick={() => toggleFavourite(tool.slug)}
            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-400"
          >
            <Star size={14} className={pinned ? 'fill-amber-400 text-amber-400' : ''} />
          </button>
        </div>
      </div>
      <h3 className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-100">{tool.name}</h3>
      <p className="mt-1 flex-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{tool.tagline}</p>
      {live && tool.features ? (
        <ul className="mt-3 flex flex-col gap-1.5">
          {tool.features.map((feature) => (
            <li key={feature} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-500" />
              {feature}
            </li>
          ))}
        </ul>
      ) : null}
      {live ? (
        <button
          type="button"
          onClick={() => openTool(tool.slug)}
          className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-indigo-700"
        >
          Launch {tool.name}
          <ArrowRight size={14} />
        </button>
      ) : (
        <div className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-400 dark:text-slate-500">
          <MousePointerClick size={14} />
          In the works
        </div>
      )}
    </div>
  )
}

function PrivacyBanner() {
  return (
    <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900 bg-gradient-to-r from-indigo-50 dark:from-indigo-950 to-white dark:to-slate-900 p-6 text-center">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-2">
        <ShieldCheck size={22} className="text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Your data never leaves your browser</h3>
        <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          Every tool runs entirely on your device. No accounts, no uploads, no tracking — your work
          stays in local storage until you export or clear it.
        </p>
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-md bg-indigo-600 text-white">
            <Home size={11} />
          </span>
          {BRAND}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">© {YEAR} {BRAND}. Free browser tools for everyone.</p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          <Zap size={12} />
          All data stays local
        </span>
      </div>
    </footer>
  )
}

const DEMO_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*'

function randomPassword(length: number): string {
  const out: string[] = []
  for (let i = 0; i < length; i += 1) {
    let index: number
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const buffer = new Uint32Array(1)
      crypto.getRandomValues(buffer)
      index = buffer[0] % DEMO_ALPHABET.length
    } else {
      index = Math.floor(Math.random() * DEMO_ALPHABET.length)
    }
    out.push(DEMO_ALPHABET[index])
  }
  return out.join('')
}

/** A small, fully-working slice of a real tool, so visitors can try before opening. */
function DemoTile() {
  const [length, setLength] = useState(16)
  const [value, setValue] = useState(() => randomPassword(16))
  const [copied, setCopied] = useState(false)

  const regenerate = (next: number) => {
    setLength(next)
    setValue(randomPassword(next))
    setCopied(false)
  }

  const copy = () => {
    const clipboard = typeof navigator !== 'undefined' ? navigator.clipboard : undefined
    if (clipboard?.writeText) clipboard.writeText(value).catch(() => {})
    setCopied(true)
  }

  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-indigo-100 dark:border-indigo-900 bg-gradient-to-br from-indigo-50 dark:from-indigo-950 via-white dark:via-slate-900 to-white dark:to-slate-900 p-6 shadow-sm lg:col-span-4">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white">
          <Sparkles size={12} />
          Try it now
        </span>
        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">No sign-up · runs locally</span>
      </div>
      <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-50">Generate a strong password</h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        A live taste of the Password Generator — everything happens in this tab.
      </p>

      <div className="mt-5 flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 font-mono text-sm text-slate-800 dark:text-slate-100">
          {value}
        </code>
        <button
          type="button"
          onClick={() => regenerate(length)}
          aria-label="Regenerate password"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 transition hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <RefreshCw size={16} />
        </button>
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 text-xs font-medium text-white transition hover:bg-indigo-700"
        >
          <Copy size={14} />
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <label className="mt-4 flex items-center gap-3 text-xs font-medium text-slate-600 dark:text-slate-300">
        Length
        <input
          type="range"
          min={8}
          max={32}
          value={length}
          aria-label="Password length"
          onChange={(event) => regenerate(Number(event.target.value))}
          className="h-1.5 flex-1 cursor-pointer accent-indigo-600"
        />
        <span className="w-6 text-right tabular-nums text-slate-500 dark:text-slate-400">{length}</span>
      </label>

      <button
        type="button"
        onClick={() => openTool('password')}
        className="mt-5 inline-flex w-fit items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
      >
        Open the full Password Generator
        <ArrowRight size={13} />
      </button>
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-xl font-bold text-slate-900 dark:text-slate-50">{value}</p>
      <p className="text-[11px] text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  )
}

function StatsTile() {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm lg:col-span-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">By the numbers</p>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <Stat value={String(LIVE_TOOLS.length)} label="Live tools" />
        <Stat value="6" label="Categories" />
        <Stat value="0" label="Sign-ups" />
        <Stat value="0" label="Uploads" />
      </div>
      <p className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
        <ShieldCheck size={12} />
        Works offline · nothing leaves your device
      </p>
    </div>
  )
}

function ShippingTile() {
  const soon = TOOLS.filter((tool) => tool.status === 'soon')
  const shipped = TOOLS.length - soon.length
  const progress = Math.round((shipped / TOOLS.length) * 100)

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm lg:col-span-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">On the roadmap</p>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        <span className="font-semibold text-slate-800 dark:text-slate-100">{shipped}</span> of {TOOLS.length} tools shipped
      </p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${progress}%` }} />
      </div>
      {soon.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {soon.map((tool) => (
            <span
              key={tool.id}
              className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400"
            >
              {tool.name}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function ToolsSection() {
  const groups = toolsByCategory()

  return (
    <section id="tools" className="border-t border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 py-14">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">Explore the toolkit</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Try one right here, then dive into a category. Every tool is self-contained, private, and
          export-ready.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-6">
          <DemoTile />
          <StatsTile />
          <ShippingTile />

          {groups.map(({ category, tools }) => {
            const Icon = category.icon
            return (
              <div
                key={category.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm lg:col-span-2"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    <Icon size={15} />
                  </span>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{category.label}</h3>
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {tools.length}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{category.blurb}</p>
                <div className="mt-1 grid gap-3">
                  {tools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function ToolRail({ title, tools }: { title: string; tools: ToolDefinition[] }) {
  return (
    <div className="mt-6">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        <Star size={11} className="fill-amber-400 text-amber-400" />
        {title}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {tools.map((tool) => {
          const Icon = tool.icon
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => openTool(tool.slug)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 transition hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              <Icon size={14} className="text-indigo-500" />
              {tool.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function PersonalTools() {
  const recents = useHubStore((state) => state.recents)
  const favourites = useHubStore((state) => state.favourites)

  const resolve = (slugs: string[]): ToolDefinition[] =>
    slugs.map((slug) => TOOL_BY_SLUG.get(slug)).filter((tool): tool is ToolDefinition => Boolean(tool))

  const pinned = resolve(favourites)
  const recent = resolve(recents).filter((tool) => !favourites.includes(tool.slug))
  if (pinned.length === 0 && recent.length === 0) return null

  return (
    <section aria-label="Your tools" className="mx-auto max-w-6xl px-4 pt-12">
      {pinned.length > 0 ? <ToolRail title="Pinned" tools={pinned} /> : null}
      {recent.length > 0 ? <ToolRail title="Recent" tools={recent} /> : null}
    </section>
  )
}

const BENEFITS = [
  {
    icon: Lock,
    title: 'Private by default',
    body: 'Everything runs in your browser. Nothing is uploaded.',
  },
  {
    icon: Home,
    title: 'No accounts, no lock-in',
    body: 'Open a tool, use it, close the tab.',
  },
  {
    icon: Download,
    title: 'Portable output',
    body: 'Every tool hands back a clean, exportable file you own.',
  },
  {
    icon: Heart,
    title: 'Free for everyone',
    body: 'No paywalls, no trials, no upsells.',
  },
]

export function HomePage() {
  return (
    <div className="min-h-screen">
      <CategorySidebar />

      <div className="lg:pl-60">
        <Navbar />

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:py-20">
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950 px-3 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
            <Zap size={12} />
            Free · No sign-up · Runs in your browser
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
            A growing set of browser tools, <span className="text-indigo-600 dark:text-indigo-400">done right.</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">{TAGLINE}</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => scrollTo('tools')}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              Browse all tools
              <ArrowRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => scrollTo('why')}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Why {BRAND}
            </button>
          </div>
          <HeroPrompt />
        </div>
        <HeroVisual />
      </section>

      <PersonalTools />

      <ToolsSection />

      <section id="why" className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4"
            >
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <Icon size={16} />
              </span>
              <div className="min-w-0">
                <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{body}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <PrivacyBanner />
        </div>
      </section>

        <Footer />
      </div>
    </div>
  )
}
