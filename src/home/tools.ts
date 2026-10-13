import { FileText, FileSignature, Globe, Image, ScanSearch } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { APP_ROUTE } from './config'

export type ToolStatus = 'live' | 'soon'

export interface ToolDefinition {
  id: string
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
    route: APP_ROUTE,
    name: 'CV Builder',
    tagline: 'Build an ATS-friendly CV and cover letter with a live preview.',
    icon: FileText,
    status: 'live',
    features: [
      'Live A4 preview with automatic pagination',
      'ATS-friendly PDF, DOCX, and PNG export',
      'Six one-click templates with a full design panel',
      'AI-assisted writing and an application tracker',
    ],
  },
  {
    id: 'ats-scanner',
    route: '',
    name: 'ATS Scanner',
    tagline: 'Check how well your CV passes applicant tracking systems.',
    icon: ScanSearch,
    status: 'soon',
  },
  {
    id: 'cover-letter-kit',
    route: '',
    name: 'Cover Letter Kit',
    tagline: 'Templates and short prompts for standout cover letters.',
    icon: FileSignature,
    status: 'soon',
  },
  {
    id: 'banner-maker',
    route: '',
    name: 'Banner Maker',
    tagline: 'Design social and LinkedIn banners right in the browser.',
    icon: Image,
    status: 'soon',
  },
  {
    id: 'web-portfolio',
    route: '',
    name: 'Portfolio Page',
    tagline: 'Generate a simple, personal portfolio page from your details.',
    icon: Globe,
    status: 'soon',
  },
]

export const LIVE_TOOLS = TOOLS.filter((tool) => tool.status === 'live')
export const SOON_TOOLS = TOOLS.filter((tool) => tool.status === 'soon')