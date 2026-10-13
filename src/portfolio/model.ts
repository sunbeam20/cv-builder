import type { Resume } from '../types'
import { formatRange } from '../lib/helpers'
import { FONT_OPTIONS } from '../lib/templates'

export interface PortfolioLink {
  label: string
  url: string
}

export interface PortfolioProject {
  name: string
  description: string
  link: string
  bullets: string[]
}

export interface PortfolioExperience {
  role: string
  company: string
  location: string
  start: string
  end: string
  current: boolean
  bullets: string[]
}

export interface PortfolioEducation {
  school: string
  degree: string
  field: string
  start: string
  end: string
}

export interface PortfolioData {
  name: string
  headline: string
  location: string
  email: string
  website: string
  summary: string
  /** Optional profile picture as a (downscaled) data URL. */
  photo: string
  links: PortfolioLink[]
  skills: string[]
  projects: PortfolioProject[]
  experience: PortfolioExperience[]
  education: PortfolioEducation[]
}

export interface PortfolioTheme {
  id: string
  name: string
  accent: string
}

export const PORTFOLIO_THEMES: PortfolioTheme[] = [
  { id: 'indigo', name: 'Indigo', accent: '#4f46e5' },
  { id: 'emerald', name: 'Emerald', accent: '#059669' },
  { id: 'rose', name: 'Rose', accent: '#e11d48' },
  { id: 'amber', name: 'Amber', accent: '#d97706' },
  { id: 'violet', name: 'Violet', accent: '#7c3aed' },
  { id: 'sky', name: 'Sky', accent: '#0284c7' },
]

export type PortfolioMode = 'light' | 'dark'
export type PortfolioDensity = 'comfortable' | 'compact'

export interface PortfolioSettings {
  themeId: string
  /** Custom accent override; empty falls back to the theme accent. */
  accentColor: string
  fontId: string
  mode: PortfolioMode
  density: PortfolioDensity
  showAvatar: boolean
  accentBar: boolean
  headingsUppercase: boolean
  showSummary: boolean
  showContact: boolean
  showProjects: boolean
  showExperience: boolean
  showSkills: boolean
  showEducation: boolean
}

export const DEFAULT_SETTINGS: PortfolioSettings = {
  themeId: 'indigo',
  accentColor: '',
  fontId: 'helvetica',
  mode: 'light',
  density: 'comfortable',
  showAvatar: true,
  accentBar: true,
  headingsUppercase: true,
  showSummary: true,
  showContact: true,
  showProjects: true,
  showExperience: true,
  showSkills: true,
  showEducation: true,
}

export const resolveAccent = (settings: PortfolioSettings): string =>
  settings.accentColor.trim() || findTheme(settings.themeId).accent

export const STORAGE_KEY = 'portfolio-page-v1'

export const emptyPortfolio = (): PortfolioData => ({
  name: '',
  headline: '',
  location: '',
  email: '',
  website: '',
  summary: '',
  photo: '',
  links: [],
  skills: [],
  projects: [],
  experience: [],
  education: [],
})

export function resumeToPortfolio(resume: Resume): PortfolioData {
  return {
    name: resume.profile.fullName,
    headline: resume.profile.headline,
    location: resume.profile.location,
    email: resume.profile.email,
    website: resume.profile.website,
    summary: resume.profile.summary,
    photo: '',
    links: resume.profile.links.map((link) => ({ label: link.label, url: link.url })),
    skills: Array.from(new Set(resume.skills.flatMap((group) => group.items))).filter((item) =>
      item.trim(),
    ),
    projects: resume.projects.map((project) => ({
      name: project.name,
      description: project.description,
      link: project.link,
      bullets: project.bullets.filter((bullet) => bullet.trim()),
    })),
    experience: resume.experience.map((entry) => ({
      role: entry.role,
      company: entry.company,
      location: entry.location,
      start: entry.start,
      end: entry.end,
      current: entry.current,
      bullets: entry.bullets.filter((bullet) => bullet.trim()),
    })),
    education: resume.education.map((entry) => ({
      school: entry.school,
      degree: entry.degree,
      field: entry.field,
      start: entry.start,
      end: entry.end,
    })),
  }
}

export const portfolioHasContent = (data: PortfolioData): boolean =>
  Boolean(
    data.name.trim() ||
      data.headline.trim() ||
      data.summary.trim() ||
      data.email.trim() ||
      data.links.length ||
      data.skills.length ||
      data.projects.length ||
      data.experience.length ||
      data.education.length,
  )

export const findTheme = (id: string): PortfolioTheme =>
  PORTFOLIO_THEMES.find((theme) => theme.id === id) ?? PORTFOLIO_THEMES[0]

export const fontFamily = (id: string): string =>
  FONT_OPTIONS.find((font) => font.id === id)?.cssFamily ?? FONT_OPTIONS[0].cssFamily

/* --- HTML generation ----------------------------------------------------- */

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

/** Normalise a user-typed URL, returning null when it cannot be turned into a safe link. */
export const normalizeUrl = (value: string): string | null => {
  const url = value.trim()
  if (!url) return null
  if (/^(https?:|mailto:|tel:)/i.test(url)) return url
  if (url.startsWith('/') || url.startsWith('#')) return url
  if (url.includes('@') && !url.includes('/')) return `mailto:${url}`
  if (/^[\w-]+(\.[\w-]+)+(\/|$)/.test(url)) return `https://${url}`
  return null
}

const h = (value: string) => escapeHtml(value.trim())

const rgba = (hex: string, alpha: number): string => {
  const value = hex.replace('#', '')
  const full =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value
  const int = Number.parseInt(full, 16)
  const r = (int >> 16) & 255
  const g = (int >> 8) & 255
  const b = int & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

interface Palette {
  bg: string
  panel: string
  text: string
  muted: string
  border: string
  accent: string
  accentSoft: string
  accentText: string
}

function palette(mode: PortfolioMode, accent: string): Palette {
  if (mode === 'dark') {
    return {
      bg: '#0b1120',
      panel: '#111827',
      text: '#e5e7eb',
      muted: '#94a3b8',
      border: '#1f2937',
      accent,
      accentSoft: rgba(accent, 0.2),
      accentText: '#e5e7eb',
    }
  }
  return {
    bg: '#ffffff',
    panel: '#f8fafc',
    text: '#0f172a',
    muted: '#64748b',
    border: '#e2e8f0',
    accent,
    accentSoft: rgba(accent, 0.12),
    accentText: accent,
  }
}

const section = (heading: string, body: string): string =>
  body.trim() ? `<section class="section"><h2>${h(heading)}</h2>${body}</section>` : ''

function contactList(data: PortfolioData, settings: PortfolioSettings): string {
  if (!settings.showContact) return ''
  const items: string[] = []
  if (data.location.trim()) items.push(`<span class="meta">${h(data.location)}</span>`)
  if (data.email.trim()) {
    const email = data.email.trim()
    items.push(`<a href="mailto:${h(email)}">${h(email)}</a>`)
  }
  const site = normalizeUrl(data.website)
  if (site) items.push(`<a href="${h(site)}">${h(data.website)}</a>`)
  for (const link of data.links) {
    const href = normalizeUrl(link.url)
    if (href) items.push(`<a href="${h(href)}">${h(link.label || link.url)}</a>`)
  }
  return items.length ? `<ul class="contact">${items.map((i) => `<li>${i}</li>`).join('')}</ul>` : ''
}

function projectsHtml(data: PortfolioData, settings: PortfolioSettings): string {
  if (!settings.showProjects || data.projects.length === 0) return ''
  const cards = data.projects
    .filter((project) => project.name.trim() || project.description.trim())
    .map((project) => {
      const href = normalizeUrl(project.link)
      const title = project.name.trim() || 'Untitled project'
      const heading = href
        ? `<h3><a href="${h(href)}">${h(title)}</a></h3>`
        : `<h3>${h(title)}</h3>`
      const description = project.description.trim()
        ? `<p>${h(project.description)}</p>`
        : ''
      const projectBullets = project.bullets.filter((bullet) => bullet.trim())
      const bullets = projectBullets.length
        ? `<ul>${projectBullets.map((bullet) => `<li>${h(bullet)}</li>`).join('')}</ul>`
        : ''
      return `<article class="card">${heading}${description}${bullets}</article>`
    })
    .join('')
  return section('Projects', cards ? `<div class="grid">${cards}</div>` : '')
}

function experienceHtml(data: PortfolioData, settings: PortfolioSettings): string {
  if (!settings.showExperience || data.experience.length === 0) return ''
  const rows = data.experience
    .filter((entry) => entry.role.trim() || entry.company.trim())
    .map((entry) => {
      const range = formatRange(entry.start, entry.end, entry.current)
      const meta = [entry.company.trim(), entry.location.trim()].filter(Boolean).join(' · ')
      const entryBullets = entry.bullets.filter((bullet) => bullet.trim())
      const bullets = entryBullets.length
        ? `<ul>${entryBullets.map((bullet) => `<li>${h(bullet)}</li>`).join('')}</ul>`
        : ''
      return `<div class="exp">
        <div class="role"><h3>${h(entry.role || 'Role')}</h3>${range ? `<span class="times">${h(range)}</span>` : ''}</div>
        ${meta ? `<p class="company">${h(meta)}</p>` : ''}
        ${bullets}
      </div>`
    })
    .join('')
  return section('Experience', rows)
}

function skillsHtml(data: PortfolioData, settings: PortfolioSettings): string {
  if (!settings.showSkills || data.skills.length === 0) return ''
  const chips = data.skills
    .filter((skill) => skill.trim())
    .map((skill) => `<li class="chip">${h(skill)}</li>`)
    .join('')
  return section('Skills', `<ul class="chips">${chips}</ul>`)
}

function educationHtml(data: PortfolioData, settings: PortfolioSettings): string {
  if (!settings.showEducation || data.education.length === 0) return ''
  const rows = data.education
    .filter((entry) => entry.school.trim() || entry.degree.trim())
    .map((entry) => {
      const range = formatRange(entry.start, entry.end, false)
      const degree = [entry.degree.trim(), entry.field.trim()].filter(Boolean).join(', ')
      return `<div class="exp">
        <div class="role"><h3>${h(entry.school || 'School')}</h3>${range ? `<span class="times">${h(range)}</span>` : ''}</div>
        ${degree ? `<p class="company">${h(degree)}</p>` : ''}
      </div>`
    })
    .join('')
  return section('Education', rows)
}

export function renderPortfolioHtml(data: PortfolioData, settings: PortfolioSettings): string {
  const colors = palette(settings.mode, resolveAccent(settings))
  const font = fontFamily(settings.fontId)

  const compact = settings.density === 'compact'
  const wrapPad = compact ? '48px 22px 36px' : '72px 24px 48px'
  const sectionGap = compact ? '30px' : '44px'
  const h1Size = compact ? '34px' : '40px'
  const heroPad = compact ? '24px' : '32px'
  const headingTransform = settings.headingsUppercase ? 'uppercase' : 'none'
  const headingTracking = settings.headingsUppercase ? '0.14em' : '0.02em'

  const name = data.name.trim() || 'Your Name'
  const initial = escapeHtml(name.trim().charAt(0).toUpperCase() || 'P')
  const headline = data.headline.trim()
    ? `<p class="headline">${h(data.headline)}</p>`
    : ''
  const summary =
    settings.showSummary && data.summary.trim()
      ? section('About', `<p class="summary">${h(data.summary)}</p>`)
      : ''

  const body = [
    summary,
    projectsHtml(data, settings),
    experienceHtml(data, settings),
    skillsHtml(data, settings),
    educationHtml(data, settings),
  ]
    .join('')
    .trim()

  const inner = body
    ? body
    : `<p class="summary">Add your details in the CV Builder, then import them here to build your page.</p>`

  const photo = data.photo.trim()
  const avatar = settings.showAvatar
    ? photo.startsWith('data:image/')
      ? `<img class="avatar" src="${h(photo)}" alt="${h(name)}" />`
      : `<span class="avatar" aria-hidden="true">${initial}</span>`
    : ''
  const topbar = settings.accentBar ? '<div class="topbar" aria-hidden="true"></div>' : ''

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(name)} · Portfolio</title>
<style>
  *{box-sizing:border-box}
  body{margin:0;font-family:${font};background:${colors.bg};color:${colors.text};line-height:1.65;-webkit-font-smoothing:antialiased}
  a{color:${colors.accent};text-decoration:none}
  a:hover{text-decoration:underline}
  .topbar{height:6px;background:linear-gradient(90deg,${colors.accent},${colors.accentSoft})}
  .wrap{max-width:860px;margin:0 auto;padding:${wrapPad}}
  .hero{display:flex;flex-direction:column;gap:14px;border-bottom:1px solid ${colors.border};padding-bottom:${heroPad}}
  .avatar{width:76px;height:76px;border-radius:20px;background:${colors.accent};color:#fff;display:block;overflow:hidden;font-size:32px;font-weight:700;line-height:76px;text-align:center;object-fit:cover}
  h1{font-size:${h1Size};line-height:1.1;margin:0;letter-spacing:-0.02em}
  .headline{font-size:18px;color:${colors.accent};font-weight:600;margin:0}
  .contact{display:flex;flex-wrap:wrap;gap:10px 18px;list-style:none;margin:0;padding:0;font-size:14px;color:${colors.muted}}
  .summary{font-size:15.5px;color:${colors.muted};margin:0;max-width:62ch}
  .section{margin-top:${sectionGap}}
  .section h2{font-size:13px;text-transform:${headingTransform};letter-spacing:${headingTracking};color:${colors.muted};margin:0 0 18px}
  .grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))}
  .card{background:${colors.panel};border:1px solid ${colors.border};border-radius:14px;padding:18px 20px}
  .card h3{margin:0;font-size:16px}
  .card p{margin:6px 0 0;color:${colors.muted};font-size:14px}
  .card ul{margin:8px 0 0;padding-left:18px;color:${colors.muted};font-size:13.5px}
  .exp{padding:16px 0;border-bottom:1px solid ${colors.border}}
  .exp:last-child{border-bottom:0}
  .role{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:baseline}
  .role h3{margin:0;font-size:15px}
  .times{color:${colors.muted};font-size:13px;white-space:nowrap}
  .company{color:${colors.accent};font-weight:600;font-size:14px;margin:2px 0 0}
  .exp ul{margin:8px 0 0;padding-left:18px;color:${colors.muted};font-size:14px}
  .chips{display:flex;flex-wrap:wrap;gap:8px;list-style:none;margin:0;padding:0}
  .chip{background:${colors.accentSoft};color:${colors.accentText};border-radius:999px;padding:5px 12px;font-size:13px;font-weight:500}
  .footer{margin-top:56px;padding-top:20px;border-top:1px solid ${colors.border};color:${colors.muted};font-size:12px;text-align:center}
</style>
</head>
<body>
${topbar}
<div class="wrap">
  <header class="hero">
    ${avatar}
    <h1>${escapeHtml(name)}</h1>
    ${headline}
    ${contactList(data, settings)}
  </header>
  ${inner}
  <p class="footer">Made with Tinker Tools · Portfolio Page</p>
</div>
</body>
</html>`
}

export interface PortfolioDraft {
  data: PortfolioData
  settings: PortfolioSettings
}

export function loadDraft(): PortfolioDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PortfolioDraft>
    return {
      data: { ...emptyPortfolio(), ...(parsed.data ?? {}) },
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
    }
  } catch {
    return null
  }
}

export function saveDraft(draft: PortfolioDraft): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  } catch {
    // storage may be unavailable; editing still works
  }
}
