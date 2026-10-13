import { useEffect, useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Home,
  Image as ImageIcon,
  MousePointerClick,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { BRAND, TAGLINE } from './config'
import { goHome, openTool } from './navigation'
import { CATEGORIES, LIVE_TOOLS, toolsByCategory } from './tools'
import type { ToolCategory, ToolDefinition } from './tools'
import { ToolSearch } from './ToolSearch'
import { ToolMenu } from './ToolMenu'
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
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => goHome()}
          aria-label={`${BRAND} home`}
          className="mr-auto flex items-center gap-2 text-sm font-semibold text-slate-800 hover:text-indigo-700"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Home size={15} />
          </span>
          {BRAND}
        </button>
        <ToolSearch className="order-last w-full sm:order-none sm:w-56" />
        <button
          type="button"
          onClick={() => scrollTo('why')}
          className="hidden rounded-md px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 sm:inline-block"
        >
          Why {BRAND}
        </button>
        <ToolMenu />
        <button
          type="button"
          onClick={() => scrollTo('tools')}
          className="hidden items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-medium text-white transition hover:bg-indigo-700 sm:inline-flex"
        >
          Explore
          <ArrowRight size={14} />
        </button>
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
    <div className="flex h-full items-start justify-center overflow-hidden bg-slate-100 pt-7">
      <div
        aria-hidden
        className="pointer-events-none select-none overflow-hidden rounded-lg bg-white shadow-xl ring-1 ring-slate-200"
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
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-emerald-50 to-white p-6">
      <div className="flex items-center gap-4 rounded-2xl bg-white px-5 py-4 shadow ring-1 ring-slate-200">
        <div
          className="grid h-16 w-16 shrink-0 place-items-center rounded-full"
          style={{ background: 'conic-gradient(#10b981 92%, #e2e8f0 0)' }}
        >
          <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-sm font-bold text-slate-900">
            92
          </div>
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-400">ATS score</p>
          <p className="text-lg font-bold text-emerald-600">Excellent</p>
        </div>
      </div>
      <div className="w-full max-w-xs space-y-2.5 rounded-xl bg-white p-4 shadow ring-1 ring-slate-200">
        {categories.map((category) => (
          <div key={category.label}>
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-medium text-slate-600">{category.label}</span>
              <span className="text-slate-400">{category.score}</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
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
    <div className="flex h-full items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-xs overflow-hidden rounded-xl shadow-xl ring-1 ring-slate-200">
        <div className="flex flex-col gap-2 bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 px-6 py-8">
          <span className="w-fit rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-semibold tracking-wide text-white">
            OPEN TO WORK
          </span>
          <span className="text-xl font-bold text-white">Your Name</span>
          <span className="text-xs text-white/80">Senior Frontend Engineer</span>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-3">
          <ImageIcon size={14} className="text-indigo-600" />
          <span className="text-[11px] text-slate-500">LinkedIn · 1584 × 396 · PNG</span>
        </div>
      </div>
    </div>
  )
}

function PortfolioPreview() {
  return (
    <div className="flex h-full items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-xs overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-slate-200">
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
                className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600"
              >
                {skill}
              </span>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="h-14 rounded-lg bg-slate-100" />
            <div className="h-14 rounded-lg bg-slate-100" />
          </div>
        </div>
      </div>
    </div>
  )
}

function GenericPreview({ tool }: { tool: ToolDefinition }) {
  const Icon = tool.icon
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-indigo-50 to-white p-6">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg">
        <Icon size={26} />
      </span>
      <div className="text-center">
        <p className="text-base font-bold text-slate-900">{tool.name}</p>
        <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
          {tool.tagline}
        </p>
      </div>
      {tool.features ? (
        <ul className="w-full max-w-xs space-y-1.5 rounded-xl bg-white p-4 shadow ring-1 ring-slate-200">
          {tool.features.slice(0, 3).map((feature) => (
            <li key={feature} className="flex items-start gap-1.5 text-[11px] text-slate-600">
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
        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
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
                index === active ? 'w-6 bg-indigo-500' : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
        {current ? (
          <button
            type="button"
            onClick={() => openTool(current.slug)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
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
  return (
    <div
      className={`flex flex-col rounded-2xl border p-5 shadow-sm transition ${
        live
          ? 'border-indigo-100 bg-white hover:-translate-y-0.5 hover:shadow-md'
          : 'border-slate-200 bg-slate-50/60'
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${
            live ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'
          }`}
        >
          <Icon size={20} />
        </span>
        {live ? (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
            Live
          </span>
        ) : (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-400">
            Coming soon
          </span>
        )}
      </div>
      <h3 className="mt-3 text-sm font-semibold text-slate-800">{tool.name}</h3>
      <p className="mt-1 flex-1 text-xs leading-relaxed text-slate-500">{tool.tagline}</p>
      {live && tool.features ? (
        <ul className="mt-3 flex flex-col gap-1.5">
          {tool.features.map((feature) => (
            <li key={feature} className="flex items-start gap-1.5 text-xs text-slate-600">
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
        <div className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-400">
          <MousePointerClick size={14} />
          In the works
        </div>
      )}
    </div>
  )
}

function PrivacyBanner() {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-white p-6 text-center">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-2">
        <ShieldCheck size={22} className="text-indigo-600" />
        <h3 className="text-sm font-semibold text-slate-800">Your data never leaves your browser</h3>
        <p className="text-xs leading-relaxed text-slate-500">
          Every tool runs entirely on your device. No accounts, no uploads, no tracking — your work
          stays in local storage until you export or clear it.
        </p>
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row">
        <p className="text-xs font-semibold text-slate-700">
          <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-md bg-indigo-600 text-white">
            <Home size={11} />
          </span>
          {BRAND}
        </p>
        <p className="text-xs text-slate-400">© {YEAR} {BRAND}. Free browser tools for everyone.</p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-600">
          <Zap size={12} />
          All data stays local
        </span>
      </div>
    </footer>
  )
}

function ToolsSection() {
  const [active, setActive] = useState<ToolCategory | 'all'>('all')
  const groups = toolsByCategory()
  const shown = active === 'all' ? groups : groups.filter((g) => g.category.id === active)

  const chip = (selected: boolean) =>
    `inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
      selected
        ? 'border-indigo-600 bg-indigo-600 text-white'
        : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50'
    }`

  return (
    <section id="tools" className="border-t border-slate-200 bg-white py-14">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-lg font-bold text-slate-900">Tools</h2>
        <p className="mt-1 text-xs text-slate-500">
          Browse by category. Every tool is self-contained, private, and export-ready.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={() => setActive('all')} className={chip(active === 'all')}>
            All tools
          </button>
          {CATEGORIES.map((category) => {
            const Icon = category.icon
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActive(category.id)}
                className={chip(active === category.id)}
              >
                <Icon size={13} />
                {category.label}
              </button>
            )
          })}
        </div>

        <div className="mt-9 flex flex-col gap-11">
          {shown.map(({ category, tools }) => {
            const Icon = category.icon
            return (
              <div key={category.id}>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Icon size={15} />
                  </span>
                  <h3 className="text-sm font-bold text-slate-800">{category.label}</h3>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                    {tools.length}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{category.blurb}</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

const BENEFITS = [
  {
    title: 'Private by default',
    body: 'Everything runs in your browser. Nothing is uploaded, so your data stays yours.',
  },
  {
    title: 'No accounts, no lock-in',
    body: 'Open a tool, use it, close the tab. There is nothing to sign up for or install.',
  },
  {
    title: 'Portable output',
    body: 'Every tool hands back a clean, exportable file you fully own and can take anywhere.',
  },
  {
    title: 'Free for everyone',
    body: 'No paywalls, no trials, no upsells. Just useful tools that work offline.',
  },
]

export function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:py-20">
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-600">
            <Zap size={12} />
            Free · No sign-up · Runs in your browser
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            A growing set of browser tools, <span className="text-indigo-600">done right.</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">{TAGLINE}</p>
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
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Why {BRAND}
            </button>
          </div>
        </div>
        <HeroVisual />
      </section>

      <ToolsSection />

      <section id="why" className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-lg font-bold text-slate-900">Why {BRAND}?</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-800">{item.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <PrivacyBanner />
        </div>
      </section>

      <Footer />
    </div>
  )
}
