import { FileText, Globe, Image, ScanSearch } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { APP_ROUTE } from './config'

export type ToolStatus = 'live' | 'soon'

export type ToolId = string

export interface ToolDefinition {
  id: ToolId
  /** Subdomain label, e.g. "cv" for https://cv.example.com */
  slug: string
  /** Hub hash path used for in-page previews, e.g. "/cv-builder" */
  route: string
  name: string
  tagline: string
  icon: LucideIcon
  status: ToolStatus
  features?: string[]
}

export const TOOLS: ToolDefinition[] = [
  {
    id: 'cv-builder',
    slug: 'cv',
    route: APP_ROUTE,
    name: 'CV Builder',
    tagline: 'Build an ATS-friendly CV with a live preview.',
    icon: FileText,
    status: 'live',
    features: [
      'Live A4 preview with automatic pagination',
      'ATS-friendly PDF and PNG export',
      'Six one-click templates with a full design panel',
      'AI-assisted writing and an application tracker',
    ],
  },
  {
    id: 'ats-scanner',
    slug: 'ats',
    route: '/ats-scanner',
    name: 'ATS Scanner',
    tagline: 'Check how well your CV passes applicant tracking systems.',
    icon: ScanSearch,
    status: 'live',
    features: [
      'Instant 0–100 ATS score with a category breakdown',
      'Contact, structure, content, and formatting checks',
      'Keyword match against any job description',
      'Import your CV straight from the CV Builder',
    ],
  },
  {
    id: 'banner-maker',
    slug: 'banner',
    route: '/banner-maker',
    name: 'Banner Maker',
    tagline: 'Design social and LinkedIn banners right in the browser.',
    icon: Image,
    status: 'live',
    features: [
      'Presets for LinkedIn, X, Facebook, YouTube and more',
      'Solid, gradient, or your own image background',
      'Full control of title, subtitle, badge, and colors',
      'Export a crisp PNG at 2× resolution',
    ],
  },
  {
    id: 'web-portfolio',
    slug: 'portfolio',
    route: '/portfolio',
    name: 'Portfolio Page',
    tagline: 'Generate a simple, personal portfolio page from your details.',
    icon: Globe,
    status: 'live',
    features: [
      'Pull your details straight from the CV Builder',
      'Six accent themes plus light and dark modes',
      'Toggle the sections you want to show',
      'Download a single, self-contained HTML file',
    ],
  },
]

export const LIVE_TOOLS = TOOLS.filter((tool) => tool.status === 'live')
export const SOON_TOOLS = TOOLS.filter((tool) => tool.status === 'soon')

const normalizeRoute = (route: string): string =>
  route.replace(/^#/, '').replace(/^\/+|\/+$/g, '').toLowerCase()

export const TOOL_BY_ID: Map<ToolId, ToolDefinition> = new Map(TOOLS.map((tool) => [tool.id, tool]))
export const TOOL_BY_SLUG: Map<string, ToolDefinition> = new Map(TOOLS.map((tool) => [tool.slug, tool]))
export const TOOL_BY_ROUTE: Map<string, ToolDefinition> = new Map(
  TOOLS.filter((tool) => tool.route).map((tool) => [normalizeRoute(tool.route), tool]),
)