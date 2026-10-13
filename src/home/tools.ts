import {
  AppWindow,
  AtSign,
  BadgeCheck,
  Braces,
  Briefcase,
  CalendarClock,
  ClipboardList,
  Droplets,
  Dumbbell,
  FileImage,
  FileStack,
  FileText,
  Frame,
  GitCompare,
  Globe,
  Image,
  ImageDown,
  KeyRound,
  Mail,
  MessagesSquare,
  Moon,
  NotebookPen,
  Palette,
  PenTool,
  Pill,
  QrCode,
  ReceiptText,
  Repeat,
  Ruler,
  Scale,
  ScanSearch,
  Search,
  Share2,
  Shapes,
  Smile,
  Target,
  Timer,
  Type,
  Wallet,
  Columns3,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { APP_ROUTE } from './config'

export type ToolStatus = 'live' | 'soon'

export type ToolCategory =
  | 'career'
  | 'design'
  | 'life'
  | 'productivity'
  | 'finance'
  | 'utilities'

export interface CategoryMeta {
  id: ToolCategory
  label: string
  blurb: string
  icon: LucideIcon
}

/** Display order of the hub sections. */
export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'career',
    label: 'Career & job search',
    blurb: 'Win the application: CVs, cover letters, tracking, and interview prep.',
    icon: Briefcase,
  },
  {
    id: 'design',
    label: 'Design & branding',
    blurb: 'Make it look good — banners, logos, images, colors, and QR codes.',
    icon: Palette,
  },
  {
    id: 'life',
    label: 'Health & life',
    blurb: 'Track the everyday stuff: hydration, habits, sleep, mood, and more.',
    icon: Droplets,
  },
  {
    id: 'productivity',
    label: 'Productivity',
    blurb: 'Get things done — focus, notes, boards, and file conversions.',
    icon: Timer,
  },
  {
    id: 'finance',
    label: 'Finance',
    blurb: 'Invoices and money math, done privately on your device.',
    icon: Wallet,
  },
  {
    id: 'utilities',
    label: 'Utilities & privacy',
    blurb: 'Small, sharp tools that respect your data.',
    icon: KeyRound,
  },
]

export const CATEGORY_BY_ID: Map<ToolCategory, CategoryMeta> = new Map(
  CATEGORIES.map((category) => [category.id, category]),
)

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
  category: ToolCategory
  features?: string[]
}

export const TOOLS: ToolDefinition[] = [
  /* --- Career & job search ---------------------------------------------- */
  {
    id: 'cv-builder',
    slug: 'cv',
    route: APP_ROUTE,
    name: 'CV Builder',
    tagline: 'Build an ATS-friendly CV with a live preview.',
    icon: FileText,
    status: 'live',
    category: 'career',
    features: [
      'Live A4 preview with automatic pagination',
      'ATS-friendly PDF and PNG export',
      'Six one-click templates with a full design panel',
      'AI-assisted writing and easy backup/import',
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
    category: 'career',
    features: [
      'Instant 0–100 ATS score with a category breakdown',
      'Contact, structure, content, and formatting checks',
      'Keyword match against any job description',
      'Import your CV straight from the CV Builder',
    ],
  },
  {
    id: 'job-tracker',
    slug: 'jobs',
    route: '/job-tracker',
    name: 'Job Tracker',
    tagline: 'Track every application from wishlist to offer.',
    icon: ClipboardList,
    status: 'live',
    category: 'career',
    features: [
      'Track status, dates, links, and notes per application',
      'Status counts and a one-click CSV export',
      'Your own subdomain — data shared across tools',
      'Everything saved locally in your browser',
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
    category: 'career',
    features: [
      'Pull your details straight from the CV Builder',
      'Add a profile picture (auto-cropped and embedded)',
      'Six accent themes plus light and dark modes',
      'Toggle the sections you want to show',
      'Share your page with a single link',
    ],
  },
  {
    id: 'cover-letter',
    slug: 'cover-letter',
    route: '/cover-letter',
    name: 'Cover Letter Builder',
    tagline: 'Write a tailored cover letter with reusable snippets.',
    icon: Mail,
    status: 'live',
    category: 'career',
    features: [
      'Guided structure with a live preview',
      'Reusable tone presets and a sample body',
      'Copy, download, or print to PDF',
    ],
  },
  {
    id: 'interview-prep',
    slug: 'interview-prep',
    route: '/interview-prep',
    name: 'Interview Prep',
    tagline: 'Practice common questions and build STAR answers.',
    icon: MessagesSquare,
    status: 'live',
    category: 'career',
    features: ['Flashcards for common questions', 'A STAR answer builder', 'Timed practice mode'],
  },
  {
    id: 'linkedin-optimizer',
    slug: 'linkedin',
    route: '/linkedin',
    name: 'LinkedIn Optimizer',
    tagline: 'Roast and refine your headline, about, and keywords.',
    icon: BadgeCheck,
    status: 'live',
    category: 'career',
    features: [
      'Score your headline and about section',
      'Keyword suggestions by target role',
      'Rewrite hints you can paste straight in',
    ],
  },
  {
    id: 'cv-job-matcher',
    slug: 'matcher',
    route: '/job-matcher',
    name: 'CV ↔ Job Matcher',
    tagline: 'See how well you match a role and tailor your CV.',
    icon: Target,
    status: 'live',
    category: 'career',
    features: [
      'Paste any job description and score your CV',
      'Keyword match with matched/missing gap analysis',
      'Save past analyses for reference',
    ],
  },
  {
    id: 'offer-compare',
    slug: 'offer',
    route: '/offer-compare',
    name: 'Offer Comparison',
    tagline: 'Compare job offers across pay, equity, and cost of living.',
    icon: Scale,
    status: 'live',
    category: 'career',
    features: [
      'Base, bonus, equity, and benefits side by side',
      'Cost-of-living adjusted comparison',
      'Highlights your best offer at a glance',
    ],
  },

  /* --- Design & branding ------------------------------------------------- */
  {
    id: 'banner-maker',
    slug: 'banner',
    route: '/banner-maker',
    name: 'Banner Maker',
    tagline: 'Design social and LinkedIn banners right in the browser.',
    icon: Image,
    status: 'live',
    category: 'design',
    features: [
      'Presets for LinkedIn, X, Facebook, YouTube and more',
      'Solid, gradient, or your own image background',
      'Full control of title, subtitle, badge, and colors',
      'Export a crisp PNG at 2× resolution',
    ],
  },
  {
    id: 'qr-code',
    slug: 'qr',
    route: '/qr-code',
    name: 'QR Code Generator',
    tagline: 'Make QR codes for links, vCards, and Wi-Fi — no tracking.',
    icon: QrCode,
    status: 'soon',
    category: 'design',
    features: ['URL, text, vCard, and Wi-Fi presets', 'Adjustable colors and size', 'Download PNG or SVG'],
  },
  {
    id: 'color-studio',
    slug: 'colors',
    route: '/color-studio',
    name: 'Color Studio',
    tagline: 'Build accessible palettes and grab the CSS or Tailwind.',
    icon: Palette,
    status: 'live',
    category: 'design',
    features: [
      'Generate palettes from a base color or an image',
      'Contrast checker for accessibility',
      'Copy as CSS variables or Tailwind config',
    ],
  },
  {
    id: 'image-tools',
    slug: 'images',
    route: '/image-tools',
    name: 'Image Toolkit',
    tagline: 'Resize, crop, and compress images without uploading.',
    icon: ImageDown,
    status: 'soon',
    category: 'design',
    features: ['Resize and crop with presets', 'Compress to a target size', 'Batch process and export'],
  },
  {
    id: 'favicon-maker',
    slug: 'favicon',
    route: '/favicon',
    name: 'Favicon Generator',
    tagline: 'Turn any image or letter into a full favicon set.',
    icon: AppWindow,
    status: 'live',
    category: 'design',
    features: [
      'Live preview at 16–512px',
      'Square, rounded, or circular letters',
      'Download SVG or PNG and copy the link tag',
    ],
  },
  {
    id: 'logo-maker',
    slug: 'logo',
    route: '/logo-maker',
    name: 'Logo & Icon Maker',
    tagline: 'Create a clean monogram logo and export it anywhere.',
    icon: Shapes,
    status: 'live',
    category: 'design',
    features: ['Monogram and wordmark styles', 'Shapes, colors, and spacing controls', 'Export PNG and SVG'],
  },
  {
    id: 'social-posts',
    slug: 'social',
    route: '/social-posts',
    name: 'Social Post Maker',
    tagline: 'Design square and story posts ready to share.',
    icon: Share2,
    status: 'soon',
    category: 'design',
    features: ['Square, portrait, and story sizes', 'Templates for common posts', 'High-resolution PNG export'],
  },
  {
    id: 'screenshot-beautifier',
    slug: 'screenshot',
    route: '/screenshot',
    name: 'Screenshot Beautifier',
    tagline: 'Drop in a screenshot and add frames, shadows, and gradients.',
    icon: Frame,
    status: 'soon',
    category: 'design',
    features: ['Browser and device frames', 'Gradient and solid backgrounds', 'Padding and shadow controls'],
  },
  {
    id: 'signature-maker',
    slug: 'signature',
    route: '/signature',
    name: 'Signature Maker',
    tagline: 'Draw or type a signature and export a transparent PNG.',
    icon: PenTool,
    status: 'soon',
    category: 'design',
    features: ['Draw with mouse or touch', 'Type in a script font', 'Transparent PNG export'],
  },
  {
    id: 'email-signature',
    slug: 'email-signature',
    route: '/email-signature',
    name: 'Email Signature Builder',
    tagline: 'Build a polished email signature you can copy anywhere.',
    icon: AtSign,
    status: 'live',
    category: 'design',
    features: [
      'Name, role, and contact fields',
      'Accent colour plus social links',
      'Copy rich HTML or plain text',
    ],
  },

  /* --- Health & life ----------------------------------------------------- */
  {
    id: 'hydration-tracker',
    slug: 'hydrate',
    route: '/hydrate',
    name: 'Hydration Tracker',
    tagline: 'Log water and drinks, then hit your daily hydration goal.',
    icon: Droplets,
    status: 'live',
    category: 'life',
    features: [
      'Quick-log presets for 6 drink types with hydration factors',
      'Daily goal with a ml/L/oz view and a goal calculator',
      'Streaks, freezes, achievements, and weekly insights',
      'Everything saved locally in your browser',
    ],
  },
  {
    id: 'habit-tracker',
    slug: 'habits',
    route: '/habits',
    name: 'Habit Tracker',
    tagline: 'Build streaks for the habits that matter to you.',
    icon: Repeat,
    status: 'live',
    category: 'life',
    features: ['Daily check-offs with streaks', 'Freeze days to protect a streak', 'Weekly completion insights'],
  },
  {
    id: 'sleep-tracker',
    slug: 'sleep',
    route: '/sleep',
    name: 'Sleep Tracker',
    tagline: 'Log your sleep and spot your best rest patterns.',
    icon: Moon,
    status: 'live',
    category: 'life',
    features: ['Bed and wake times with duration', 'Quality ratings and notes', 'Weekly averages and trends'],
  },
  {
    id: 'medicine-reminder',
    slug: 'medicine',
    route: '/medicine',
    name: 'Medicine Reminder',
    tagline: 'Keep track of doses, schedules, and refills.',
    icon: Pill,
    status: 'live',
    category: 'life',
    features: ['Multiple medicines and schedules', 'Today’s checklist and history', 'Refill reminders'],
  },
  {
    id: 'mood-journal',
    slug: 'mood',
    route: '/mood',
    name: 'Mood & Gratitude Journal',
    tagline: 'A private space to log mood and what you’re grateful for.',
    icon: Smile,
    status: 'live',
    category: 'life',
    features: ['Daily mood rating and tags', 'Gratitude entries', 'Mood trends over time'],
  },
  {
    id: 'workout-logger',
    slug: 'workout',
    route: '/workout',
    name: 'Workout Logger',
    tagline: 'Record your workouts and watch your progress add up.',
    icon: Dumbbell,
    status: 'live',
    category: 'life',
    features: ['Log exercises, sets, and reps', 'Workout templates', 'Volume and history charts'],
  },

  /* --- Productivity ------------------------------------------------------ */
  {
    id: 'focus-timer',
    slug: 'focus',
    route: '/focus',
    name: 'Focus Timer',
    tagline: 'A Pomodoro timer that keeps a record of your deep work.',
    icon: Timer,
    status: 'live',
    category: 'productivity',
    features: ['Configurable work and break lengths', 'Session history and stats', 'Gentle audio chimes'],
  },
  {
    id: 'kanban-board',
    slug: 'kanban',
    route: '/kanban',
    name: 'Kanban Board',
    tagline: 'A drag-and-drop board to move tasks from to-do to done.',
    icon: Columns3,
    status: 'live',
    category: 'productivity',
    features: ['Custom columns and cards', 'Drag to reorder', 'Saved locally, export as JSON'],
  },
  {
    id: 'markdown-notes',
    slug: 'notes',
    route: '/notes',
    name: 'Markdown Notes',
    tagline: 'Write in Markdown with a live preview and export.',
    icon: NotebookPen,
    status: 'live',
    category: 'productivity',
    features: ['Live rendered preview', 'Multiple notes with search', 'Export as Markdown or HTML'],
  },
  {
    id: 'pdf-tools',
    slug: 'pdf',
    route: '/pdf-tools',
    name: 'PDF Toolkit',
    tagline: 'Merge, split, rotate, and compress PDFs in your browser.',
    icon: FileStack,
    status: 'soon',
    category: 'productivity',
    features: ['Merge and reorder pages', 'Split and extract ranges', 'Rotate and compress'],
  },
  {
    id: 'image-pdf',
    slug: 'img-pdf',
    route: '/image-pdf',
    name: 'Image ⇄ PDF',
    tagline: 'Turn images into a PDF, or pull images out of one.',
    icon: FileImage,
    status: 'soon',
    category: 'productivity',
    features: ['Images to a single PDF', 'Extract images from a PDF', 'Page size and orientation options'],
  },
  {
    id: 'text-diff',
    slug: 'diff',
    route: '/text-diff',
    name: 'Text Diff',
    tagline: 'Compare two blocks of text and see exactly what changed.',
    icon: GitCompare,
    status: 'live',
    category: 'productivity',
    features: ['Line and word-level diff', 'Side-by-side or inline view', 'Ignore whitespace and case'],
  },
  {
    id: 'unit-converter',
    slug: 'convert',
    route: '/convert',
    name: 'Unit Converter',
    tagline: 'Convert length, weight, temperature, and more instantly.',
    icon: Ruler,
    status: 'live',
    category: 'productivity',
    features: ['Length, mass, volume, area, speed', 'Temperature and digital storage', 'Offline and instant'],
  },
  {
    id: 'date-calculator',
    slug: 'datetime',
    route: '/date-time',
    name: 'Date & Time Tools',
    tagline: 'Work out date differences, ages, and time zones.',
    icon: CalendarClock,
    status: 'live',
    category: 'productivity',
    features: ['Date difference and add/subtract', 'Age calculator', 'World clock and time overlap'],
  },
  {
    id: 'lorem-generator',
    slug: 'lorem',
    route: '/lorem',
    name: 'Lorem Ipsum Generator',
    tagline: 'Drop in placeholder text by words, sentences, or paragraphs.',
    icon: Type,
    status: 'live',
    category: 'productivity',
    features: ['Words, sentences, or paragraphs', 'Classic or modern phrasing', 'One-click copy'],
  },
  {
    id: 'json-csv',
    slug: 'json',
    route: '/json-csv',
    name: 'JSON & CSV Studio',
    tagline: 'Format, validate, and convert between JSON and CSV.',
    icon: Braces,
    status: 'live',
    category: 'productivity',
    features: ['Pretty-print and validate JSON', 'Convert JSON to CSV and back', 'Minify and copy'],
  },

  /* --- Finance ----------------------------------------------------------- */
  {
    id: 'invoice-generator',
    slug: 'invoice',
    route: '/invoice',
    name: 'Invoice Generator',
    tagline: 'Create clean, professional invoices and export a PDF.',
    icon: ReceiptText,
    status: 'live',
    category: 'finance',
    features: [
      'Line items, tax, and running totals',
      'Save your sender details and past invoices',
      'Print the preview straight to PDF',
    ],
  },
  {
    id: 'split-bill',
    slug: 'split',
    route: '/split-bill',
    name: 'Expense Splitter',
    tagline: 'Split a bill or trip fairly and settle up with less math.',
    icon: Wallet,
    status: 'live',
    category: 'finance',
    features: [
      'Add people and shared expenses',
      'Split evenly with per-item participants',
      'Minimised settle-up transfers',
    ],
  },

  /* --- Utilities & privacy ---------------------------------------------- */
  {
    id: 'password-generator',
    slug: 'password',
    route: '/password',
    name: 'Password Generator',
    tagline: 'Create strong passwords and passphrases locally.',
    icon: KeyRound,
    status: 'live',
    category: 'utilities',
    features: ['Length, symbols, and passphrase modes', 'Strength meter', 'Nothing is ever stored or sent'],
  },
  {
    id: 'seo-preview',
    slug: 'seo',
    route: '/seo-preview',
    name: 'SEO & Link Preview',
    tagline: 'Craft titles and descriptions and preview how links look.',
    icon: Search,
    status: 'live',
    category: 'utilities',
    features: ['Meta title and description length checks', 'Google and social card previews', 'Copy-ready meta tags'],
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

export interface CategoryGroup {
  category: CategoryMeta
  tools: ToolDefinition[]
}

/** Tools bucketed by category, in `CATEGORIES` order; empty categories are dropped. */
export function toolsByCategory(tools: ToolDefinition[] = TOOLS): CategoryGroup[] {
  return CATEGORIES.map((category) => ({
    category,
    tools: tools.filter((tool) => tool.category === category.id),
  })).filter((group) => group.tools.length > 0)
}

/**
 * Case-insensitive tool search across name, tagline, slug, category label, and
 * feature text. An empty query returns no results (callers decide the fallback).
 */
export function searchTools(query: string, tools: ToolDefinition[] = TOOLS): ToolDefinition[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return tools.filter((tool) => {
    const category = CATEGORY_BY_ID.get(tool.category)?.label ?? ''
    const features = tool.features?.join(' ') ?? ''
    return `${tool.name} ${tool.tagline} ${tool.slug} ${category} ${features}`
      .toLowerCase()
      .includes(q)
  })
}
