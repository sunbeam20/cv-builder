import type { Resume, SectionId } from '../types'

export const SECTION_LABELS: Record<SectionId, string> = {
  summary: 'Professional Summary',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  languages: 'Languages',
}

/** DOM ids for the editor sections, used for scroll-to-section shortcuts. */
export const scrollToSection = (anchor: string): void => {
  const node = document.getElementById(anchor)
  if (!node) return
  node.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const focusable = node.querySelector<HTMLElement>('input, textarea, select, button')
  focusable?.focus({ preventScroll: true })
}

export const DEFAULT_SECTION_ORDER: SectionId[] = [
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'languages',
]

export const uid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11)

export const emptyResume = () => ({
  profile: {
    fullName: '',
    headline: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    summary: '',
    links: [],
  },
  sectionOrder: [...DEFAULT_SECTION_ORDER],
  hiddenSections: [],
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
})

export const formatRange = (start: string, end: string, current: boolean): string => {
  const left = start.trim()
  const right = current ? 'Present' : end.trim()
  if (!left && !right) return ''
  if (!left) return right
  if (!right) return left
  return `${left} – ${right}`
}

export const slug = (value: string): string =>
  value
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_') || 'resume'

/** True when the resume contains any user-entered content worth protecting. */
export const resumeHasContent = (resume: Resume): boolean =>
  Boolean(
    resume.profile.fullName.trim() ||
      resume.profile.summary.trim() ||
      resume.profile.email.trim() ||
      resume.experience.length ||
      resume.education.length ||
      resume.skills.length ||
      resume.projects.length ||
      resume.certifications.length ||
      resume.languages.length,
  )

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
