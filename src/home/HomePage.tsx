import { ArrowRight, CheckCircle2, Home, MousePointerClick, ShieldCheck, Zap } from 'lucide-react'
import { BRAND, TAGLINE } from './config'
import { navigate } from './routes'
import { LIVE_TOOLS, SOON_TOOLS } from './tools'
import { ResumePage } from '../preview/ResumePreview'
import { sampleResume } from '../lib/sampleData'
import { TEMPLATES } from '../lib/templates'
import { A4_WIDTH } from '../preview/useFitScale'

const HERO_SCALE = 0.5

const YEAR = new Date().getFullYear()

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => navigate('home')}
          aria-label={`${BRAND} home`}
          className="mr-auto flex items-center gap-2 text-sm font-semibold text-slate-800 hover:text-indigo-700"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Home size={15} />
          </span>
          {BRAND}
        </button>
        <nav className="hidden items-center gap-1 sm:flex">
          <button
            type="button"
            onClick={() => scrollTo('tools')}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            Tools
          </button>
          <button
            type="button"
            onClick={() => scrollTo('features')}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            Features
          </button>
        </nav>
        <button
          type="button"
          onClick={() => navigate('app')}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-medium text-white transition hover:bg-indigo-700"
        >
          Open CV Builder
          <ArrowRight size={14} />
        </button>
      </div>
    </header>
  )
}

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div
        aria-hidden
        className="pointer-events-none select-none overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-slate-200"
        style={{ width: A4_WIDTH * HERO_SCALE, height: 430, margin: '0 auto' }}
      >
        <div style={{ transform: `scale(${HERO_SCALE})`, transformOrigin: 'top left' }}>
          <ResumePage resume={sampleResume()} theme={TEMPLATES.ats} />
        </div>
      </div>
      <div className="absolute -left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600 shadow-md ring-1 ring-slate-200 lg:block">
        <span className="text-amber-500">★</span> ATS-friendly PDF · DOCX
      </div>
    </div>
  )
}

function ToolCard({ tool }: { tool: (typeof LIVE_TOOLS)[number] | (typeof SOON_TOOLS)[number] }) {
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
          onClick={() => navigate('app')}
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
          Every tool runs entirely on your device. No accounts, no uploads, no tracking — your CV,
          notes, and drafts stay in local storage until you export or clear them.
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
            Small tools, done right — <span className="text-indigo-600">starting with a CV Builder.</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">{TAGLINE}</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('app')}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              Open CV Builder
              <ArrowRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => scrollTo('tools')}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Browse all tools
            </button>
          </div>
        </div>
        <HeroVisual />
      </section>

      <section id="tools" className="border-t border-slate-200 bg-white py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-lg font-bold text-slate-900">Tools</h2>
          <p className="mt-1 text-xs text-slate-500">
            Every tool is self-contained, private, and export-ready. New ones land here as they ship.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...LIVE_TOOLS, ...SOON_TOOLS].map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-lg font-bold text-slate-900">Why CV Builder?</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'ATS-ready output', body: 'Clean single-column layout with real text — PDF, DOCX, or PNG.' },
            { title: 'Live A4 preview', body: 'See every page exactly as it prints, with automatic pagination.' },
            { title: 'Design your own', body: 'Six templates plus presets and per-property controls in the design panel.' },
            { title: 'AI assist & tracking', body: 'Draft smarter with AI help and log applications as you go.' },
          ].map((item) => (
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