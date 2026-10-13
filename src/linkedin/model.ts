import { extractKeywords } from '../lib/match'

export interface LinkedinProfile {
  headline: string
  about: string
  skills: string
}

export const emptyProfile = (): LinkedinProfile => ({ headline: '', about: '', skills: '' })

export const ACTION_VERBS = [
  'led', 'built', 'launched', 'drove', 'grew', 'designed', 'shipped', 'owned',
  'managed', 'improved', 'reduced', 'increased', 'mentored', 'delivered', 'scaled',
  'automated', 'streamlined', 'founded', 'coordinated', 'implemented',
]

export const HEADLINE_MAX = 220
export const ABOUT_MIN = 260

export interface Check {
  id: string
  label: string
  pass: boolean
  hint: string
}

export interface ProfileReport {
  score: number
  checks: Check[]
  keywords: string[]
  verbs: string[]
  quantified: number
}

const countVerbs = (text: string): string[] => {
  const haystack = text.toLowerCase()
  return ACTION_VERBS.filter((verb) => new RegExp(`\\b${verb}\\b`).test(haystack))
}

const countQuantified = (text: string): number =>
  (text.match(/(\d+[%$k]|\d+\s*(percent|x|times|million|thousand))/gi) ?? []).length

export function parseSkills(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map((skill) => skill.trim())
    .filter(Boolean)
}

export function analyseProfile(profile: LinkedinProfile): ProfileReport {
  const skills = parseSkills(profile.skills)
  const text = `${profile.headline}\n${profile.about}\n${profile.skills}`
  const verbs = countVerbs(text)
  const quantified = countQuantified(profile.about)
  const headlineLength = profile.headline.trim().length

  const checks: Check[] = [
    {
      id: 'headline',
      label: 'Headline is specific and complete',
      pass: headlineLength >= 40 && headlineLength <= HEADLINE_MAX,
      hint: `Aim for 40–${HEADLINE_MAX} characters describing your role and value.`,
    },
    {
      id: 'about-length',
      label: 'About section has enough substance',
      pass: profile.about.trim().length >= ABOUT_MIN,
      hint: `Write at least ${ABOUT_MIN} characters — a short story beats a list of duties.`,
    },
    {
      id: 'first-person',
      label: 'About section is written in first person',
      pass: /\bI\b|\bI'/.test(profile.about),
      hint: 'Use “I” — recruiters want to hear your voice, not a résumé in prose.',
    },
    {
      id: 'verbs',
      label: 'Uses strong action verbs',
      pass: verbs.length >= 4,
      hint: `Include at least 4 action verbs. Found: ${verbs.join(', ') || 'none yet'}.`,
    },
    {
      id: 'quantified',
      label: 'Includes measurable results',
      pass: quantified >= 2,
      hint: 'Add numbers such as “increased signups 30%” or “led a team of 5”.',
    },
    {
      id: 'skills',
      label: 'Lists at least 8 skills',
      pass: skills.length >= 8,
      hint: `Add more skills so you surface in search. You have ${skills.length}.`,
    },
    {
      id: 'keywords',
      label: 'Mentions role-relevant keywords',
      pass: extractKeywords(text, 12).length >= 6,
      hint: 'Weave in the skills and tools recruiters search for.',
    },
  ]

  const passed = checks.filter((check) => check.pass).length

  return {
    score: Math.round((passed / checks.length) * 100),
    checks,
    keywords: extractKeywords(text, 12),
    verbs,
    quantified,
  }
}

export const headlineLeft = (headline: string): number => HEADLINE_MAX - headline.trim().length
