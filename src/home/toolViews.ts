import { lazy } from 'react'
import type { ComponentType, LazyExoticComponent } from 'react'
import type { ToolId } from './tools'

/**
 * Single extension point for adding tools: register the tool in `tools.ts` and
 * point its id at a lazily-loaded view here. Tools without a view render
 * `<ComingSoon />` from `Root`.
 */
export const TOOL_VIEWS: Record<ToolId, LazyExoticComponent<ComponentType>> = {
  'cv-builder': lazy(() => import('../App')),
  'ats-scanner': lazy(() => import('../ats/AtsApp')),
  'banner-maker': lazy(() => import('../banner/BannerApp')),
  'web-portfolio': lazy(() => import('../portfolio/PortfolioApp')),
  'hydration-tracker': lazy(() => import('../hydration/HydrationApp')),
  'job-tracker': lazy(() => import('../jobs/JobTrackerApp')),
  'password-generator': lazy(() => import('../password/PasswordApp')),
  'unit-converter': lazy(() => import('../convert/ConvertApp')),
  'text-diff': lazy(() => import('../diff/DiffApp')),
  'lorem-generator': lazy(() => import('../lorem/LoremApp')),
  'color-studio': lazy(() => import('../color/ColorApp')),
  'cover-letter': lazy(() => import('../cover/CoverLetterApp')),
  'interview-prep': lazy(() => import('../interview/InterviewApp')),
  'linkedin-optimizer': lazy(() => import('../linkedin/LinkedinOptimizerApp')),
  'cv-job-matcher': lazy(() => import('../cvjob/CvJobMatcherApp')),
  'offer-compare': lazy(() => import('../offer/OfferCompareApp')),
  'logo-maker': lazy(() => import('../logo/LogoApp')),
  'email-signature': lazy(() => import('../signature/SignatureApp')),
  'favicon-maker': lazy(() => import('../favicon/FaviconApp')),
  'seo-preview': lazy(() => import('../seo/SeoPreviewApp')),
  'split-bill': lazy(() => import('../split/SplitApp')),
  'invoice-generator': lazy(() => import('../invoice/InvoiceApp')),
  'habit-tracker': lazy(() => import('../habits/HabitApp')),
  'sleep-tracker': lazy(() => import('../sleep/SleepApp')),
  'mood-journal': lazy(() => import('../mood/MoodApp')),
  'workout-logger': lazy(() => import('../workout/WorkoutApp')),
  'medicine-reminder': lazy(() => import('../medicine/MedicineApp')),
  'focus-timer': lazy(() => import('../focus/FocusApp')),
  'kanban-board': lazy(() => import('../kanban/KanbanApp')),
  'markdown-notes': lazy(() => import('../notes/NotesApp')),
  'json-csv': lazy(() => import('../json/JsonApp')),
  'date-calculator': lazy(() => import('../datetime/DateTimeApp')),
}