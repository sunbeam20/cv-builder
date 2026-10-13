import type { Resume } from '../types'

export interface CompletenessCheck {
  id: string
  label: string
  met: boolean
  weight: number
}

export interface CompletenessReport {
  score: number
  checks: CompletenessCheck[]
  missing: CompletenessCheck[]
}

const hasDigit = (value: string): boolean => /\d/.test(value)

export function analyzeResume(resume: Resume): CompletenessReport {
  const { profile, experience, education, skills, projects, certifications, languages } = resume

  const bullets = [
    ...experience.flatMap((e) => e.bullets),
    ...projects.flatMap((p) => p.bullets),
  ]
    .map((b) => b.trim())
    .filter(Boolean)

  const checks: CompletenessCheck[] = [
    { id: 'name', label: 'Add your full name', met: profile.fullName.trim().length > 1, weight: 2 },
    { id: 'headline', label: 'Add a headline / target role', met: !!profile.headline.trim(), weight: 1 },
    { id: 'email', label: 'Add an email address', met: /@/.test(profile.email), weight: 2 },
    { id: 'phone', label: 'Add a phone number', met: profile.phone.trim().length > 5, weight: 1 },
    { id: 'location', label: 'Add your location', met: !!profile.location.trim(), weight: 1 },
    {
      id: 'links',
      label: 'Add at least one link (LinkedIn, portfolio…)',
      met: profile.links.length > 0 || !!profile.website.trim(),
      weight: 1,
    },
    {
      id: 'summary',
      label: 'Write a professional summary (40+ characters)',
      met: profile.summary.trim().length >= 40,
      weight: 2,
    },
    {
      id: 'experience',
      label: 'Add at least one work experience',
      met: experience.some((e) => (e.role || e.company).trim() !== ''),
      weight: 2,
    },
    {
      id: 'bullets',
      label: 'Add highlight bullet points',
      met: bullets.length >= 2,
      weight: 2,
    },
    {
      id: 'quantified',
      label: 'Quantify an achievement with a number',
      met: bullets.some(hasDigit),
      weight: 1,
    },
    {
      id: 'education',
      label: 'Add your education',
      met: education.length > 0,
      weight: 1,
    },
    { id: 'skills', label: 'List your skills', met: skills.length > 0, weight: 2 },
    {
      id: 'extras',
      label: 'Add projects, certifications, or languages',
      met: projects.length > 0 || certifications.length > 0 || languages.length > 0,
      weight: 1,
    },
  ]

  const total = checks.reduce((sum, c) => sum + c.weight, 0)
  const earned = checks.reduce((sum, c) => sum + (c.met ? c.weight : 0), 0)
  const score = Math.round((earned / total) * 100)

  return { score, checks, missing: checks.filter((c) => !c.met) }
}
