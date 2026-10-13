import { matchTextToJob, type KeywordMatchReport } from './match'

export type AtsStatus = 'pass' | 'warn' | 'fail'

export interface AtsCheck {
  id: string
  label: string
  status: AtsStatus
  detail: string
  weight: number
}

export interface AtsCategory {
  id: string
  label: string
  score: number
  checks: AtsCheck[]
}

export interface AtsReport {
  score: number
  grade: string
  wordCount: number
  categories: AtsCategory[]
  issues: AtsCheck[]
  keywords: KeywordMatchReport | null
}

const ACTION_VERBS = [
  'led', 'managed', 'built', 'created', 'designed', 'developed', 'implemented', 'launched',
  'improved', 'increased', 'reduced', 'optimized', 'delivered', 'drove', 'owned', 'shipped',
  'automated', 'migrated', 'mentored', 'coordinated', 'established', 'streamlined', 'achieved',
  'resolved', 'analyzed', 'architected', 'scaled', 'grew', 'generated', 'negotiated',
  'spearheaded', 'partnered', 'transformed', 'accelerated',
]

const BUZZWORDS = [
  'team player', 'hard worker', 'hard-working', 'go-getter', 'think outside the box',
  'synergy', 'ninja', 'rockstar', 'guru', 'self-starter', 'detail-oriented', 'results-driven',
  'dynamic', 'passionate', 'proactive', 'excellent communication',
]

const SECTION_PATTERNS: { id: string; label: string; re: RegExp }[] = [
  { id: 'summary', label: 'Summary', re: /\b(summary|profile|objective|about me|about)\b/i },
  { id: 'experience', label: 'Experience', re: /\b(experience|employment|work history|professional background)\b/i },
  { id: 'education', label: 'Education', re: /\b(education|academic background)\b/i },
  { id: 'skills', label: 'Skills', re: /\b(skills|technologies|technical skills|competencies|toolkit)\b/i },
  { id: 'projects', label: 'Projects', re: /\b(projects|portfolio)\b/i },
  { id: 'certifications', label: 'Certifications', re: /\b(certifications?|certificates?|licen[cs]es?)\b/i },
]

const EMAIL = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i
const PHONE = /(?:\+?\d[\d\s().-]{7,}\d)/
const URL = /(?:https?:\/\/|www\.)[^\s]+|\blinkedin\.com\/[^\s]+|\bgithub\.com\/[^\s]+/i
const YEAR = /\b(?:19|20)\d{2}\b/g
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]|\uFE0F/gu

export const SAMPLE_ATS_TEXT = `Jordan Avery
Senior Frontend Engineer
jordan.avery@email.com · +1 (555) 012-3456 · Austin, TX
linkedin.com/in/jordanavery · github.com/jordanavery

Summary
Frontend engineer with 8 years building accessible, high-performance web applications. Shipped products used by millions of people and led teams of up to six engineers.

Experience
Senior Frontend Engineer — Brightwave, Austin, TX (2020 – Present)
- Led migration of a legacy dashboard to React, cutting page load time by 42% and support tickets by 30%.
- Built a design system adopted by 12 teams, reducing new feature build time by roughly 25%.
- Mentored 6 engineers and introduced a testing standard that raised coverage from 48% to 87%.

Frontend Engineer — Northwind Labs, Austin, TX (2017 – 2020)
- Developed a checkout flow that increased conversion by 18% and processed $4.2M in monthly revenue.
- Automated the release pipeline, cutting deploys from weekly to daily.

Education
B.S. Computer Science — University of Texas, Austin, TX (2013 – 2017)

Skills
JavaScript, TypeScript, React, Next.js, Node.js, GraphQL, CSS, Accessibility, Testing

Projects
Open Budget — open-source budgeting app with 3,200 GitHub stars.
https://github.com/jordanavery/open-budget
`

export function wordCount(text: string): number {
  return (text.match(/\S+/g) ?? []).length
}

function words(text: string): string[] {
  return text.toLowerCase().match(/[a-z][a-z'’+-]*/g) ?? []
}

function looksLikeName(text: string): boolean {
  const firstLine = text.split(/\r?\n/).map((line) => line.trim()).find(Boolean) ?? ''
  if (!firstLine || EMAIL.test(firstLine) || /\d/.test(firstLine)) return false
  const parts = firstLine.split(/\s+/).filter(Boolean)
  if (parts.length < 2 || parts.length > 5) return false
  return parts.every((word) => /^[A-Za-z][A-Za-z'’.-]*$/.test(word))
}

function hasLocation(text: string): boolean {
  if (/\b(remote|hybrid|on-?site|worldwide)\b/i.test(text)) return true
  return /\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)?,\s*[A-Z]/.test(text)
}

function countQuantified(text: string): number {
  const tokens =
    text.match(/[$€£]\s?\d[\d,.]*(?:\s?(?:k|m|bn|billion|million))?|\b\d[\d,.]*\s?%|\b\d[\d,./]*\b/g) ?? []
  return tokens.filter((token) => {
    const trimmed = token.trim()
    if (/^(19|20)\d{2}$/.test(trimmed)) return false
    if (/[$€£%]/.test(trimmed)) return true
    return trimmed.replace(/[^\d]/g, '').length >= 2
  }).length
}

function countActionVerbs(text: string): number {
  const set = new Set(words(text))
  return ACTION_VERBS.filter((verb) => set.has(verb)).length
}

function countBulletLines(text: string): number {
  return text.split(/\r?\n/).filter((line) => /^\s*(?:[-•*‣▪◦·o]|\d+[.)])\s+\S/.test(line)).length
}

function countPronouns(text: string): number {
  return (text.match(/\b(?:I|me|my|mine|myself)\b/g) ?? []).length
}

function countBuzzwords(text: string): number {
  const lower = text.toLowerCase()
  return BUZZWORDS.filter((phrase) => lower.includes(phrase)).length
}

function countEmoji(text: string): number {
  return (text.match(EMOJI) ?? []).length
}

function countColumnLines(text: string): number {
  return text.split(/\r?\n/).filter((line) => /\S[ \t]{3,}\S/.test(line)).length
}

function countAllCapsLines(text: string): number {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => {
      if (line.length <= 25 || line !== line.toUpperCase()) return false
      const letters = line.match(/[A-Z]/g)?.length ?? 0
      return letters > line.length * 0.5
    }).length
}

function statusFrom(value: number, good: number, ok: number): AtsStatus {
  if (value >= good) return 'pass'
  if (value >= ok) return 'warn'
  return 'fail'
}

/** For checks where fewer is better (pronouns, emoji, ALL-CAPS…). */
function inverseStatus(value: number, ok: number, max: number): AtsStatus {
  if (value <= ok) return 'pass'
  if (value <= max) return 'warn'
  return 'fail'
}

function check(id: string, label: string, weight: number, status: AtsStatus, detail: string): AtsCheck {
  return { id, label, status, detail, weight }
}

function categoryScore(checks: AtsCheck[]): number {
  const total = checks.reduce((sum, item) => sum + item.weight, 0)
  if (total === 0) return 100
  const earned = checks.reduce(
    (sum, item) => sum + item.weight * (item.status === 'pass' ? 1 : item.status === 'warn' ? 0.5 : 0),
    0,
  )
  return Math.round((earned / total) * 100)
}

export function gradeFor(score: number): string {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 50) return 'Needs work'
  return 'Poor'
}

export function analyzeAts(text: string, jobDescription = ''): AtsReport {
  const wc = wordCount(text)
  const sectionCount = SECTION_PATTERNS.filter((section) => section.re.test(text)).length
  const yearCount = (text.match(YEAR) ?? []).length
  const quantified = countQuantified(text)
  const verbs = countActionVerbs(text)
  const bullets = countBulletLines(text)
  const pronouns = countPronouns(text)
  const buzzwords = countBuzzwords(text)
  const emoji = countEmoji(text)
  const columns = countColumnLines(text)
  const caps = countAllCapsLines(text)

  const contact: AtsCheck[] = [
    check('name', 'Name at the top', 2, looksLikeName(text) ? 'pass' : 'warn',
      looksLikeName(text) ? 'A clear name is detected' : 'Add your full name on the first line'),
    check('email', 'Email address', 2, EMAIL.test(text) ? 'pass' : 'fail',
      EMAIL.test(text) ? 'Email found' : 'No email address detected'),
    check('phone', 'Phone number', 1, PHONE.test(text) ? 'pass' : 'warn',
      PHONE.test(text) ? 'Phone found' : 'No phone number detected'),
    check('location', 'Location', 1, hasLocation(text) ? 'pass' : 'warn',
      hasLocation(text) ? 'Location found' : 'Add a city/region or “Remote”'),
    check('links', 'LinkedIn / portfolio link', 1, URL.test(text) ? 'pass' : 'warn',
      URL.test(text) ? 'A link is present' : 'Add a LinkedIn or portfolio URL'),
  ]

  const lengthStatus: AtsStatus =
    wc >= 250 && wc <= 900 ? 'pass' : wc >= 150 && wc <= 1200 ? 'warn' : 'fail'
  const structure: AtsCheck[] = [
    check('sections', 'Standard section headings', 3, statusFrom(sectionCount, 3, 1),
      `${sectionCount} standard heading${sectionCount === 1 ? '' : 's'} detected`),
    check('length', 'Reasonable length', 2, lengthStatus, `${wc} words (aim for 250–900)`),
    check('dates', 'Dates present', 1, statusFrom(yearCount, 2, 1),
      `${yearCount} year${yearCount === 1 ? '' : 's'} found`),
    check('summary', 'Professional summary', 1,
      SECTION_PATTERNS[0].re.test(text) ? 'pass' : 'warn',
      SECTION_PATTERNS[0].re.test(text) ? 'Summary section found' : 'Add a short summary section'),
  ]

  const content: AtsCheck[] = [
    check('quantified', 'Quantified achievements', 3, statusFrom(quantified, 4, 1),
      `${quantified} number${quantified === 1 ? '' : 's'}/metrics found`),
    check('verbs', 'Strong action verbs', 2, statusFrom(verbs, 6, 2),
      `${verbs} distinct action verb${verbs === 1 ? '' : 's'}`),
    check('bullets', 'Bullet points', 2, statusFrom(bullets, 6, 1),
      `${bullets} bullet line${bullets === 1 ? '' : 's'}`),
    check('pronouns', 'Avoid first-person pronouns', 1, inverseStatus(pronouns, 3, 8),
      `${pronouns} pronoun${pronouns === 1 ? '' : 's'} found`),
    check('buzzwords', 'Avoid clichés & buzzwords', 1, inverseStatus(buzzwords, 0, 2),
      buzzwords === 0 ? 'None detected' : `${buzzwords} cliché phrase${buzzwords === 1 ? '' : 's'}`),
  ]

  const formatting: AtsCheck[] = [
    check('emoji', 'No emoji / odd symbols', 1, inverseStatus(emoji, 0, 4),
      emoji === 0 ? 'None detected' : `${emoji} emoji/symbol${emoji === 1 ? '' : 's'} found`),
    check('columns', 'No column / tab layouts', 1, inverseStatus(columns, 2, 6),
      columns === 0 ? 'Clean single-column flow' : `${columns} line(s) look table/column-like`),
    check('caps', 'Avoid long ALL-CAPS runs', 1, inverseStatus(caps, 2, 5),
      caps === 0 ? 'None detected' : `${caps} long ALL-CAPS line${caps === 1 ? '' : 's'}`),
  ]

  const categories: AtsCategory[] = [
    { id: 'contact', label: 'Contact & essentials', score: categoryScore(contact), checks: contact },
    { id: 'structure', label: 'Structure & length', score: categoryScore(structure), checks: structure },
    { id: 'content', label: 'Content quality', score: categoryScore(content), checks: content },
    { id: 'formatting', label: 'Formatting & parseability', score: categoryScore(formatting), checks: formatting },
  ]

  // Nothing to analyse: report every check as failed so the score is a clear zero.
  if (wc === 0) {
    for (const category of categories) {
      for (const item of category.checks) {
        item.status = 'fail'
        item.detail = 'Nothing to analyse yet'
      }
      category.score = 0
    }
  }

  let keywords: KeywordMatchReport | null = null
  if (jobDescription.trim()) {
    keywords = matchTextToJob(text, jobDescription)
    const keywordCheck = check('keywords', 'Job-description keyword match', 3,
      statusFrom(keywords.score, 70, 40), `${keywords.score}% of key terms found`)
    categories.push({ id: 'keywords', label: 'Job match', score: categoryScore([keywordCheck]), checks: [keywordCheck] })
  }

  const allChecks = categories.flatMap((category) => category.checks)
  const score = categoryScore(allChecks)
  const issues = allChecks
    .filter((item) => item.status !== 'pass')
    .sort((a, b) => b.weight - a.weight)

  return { score, grade: gradeFor(score), wordCount: wc, categories, issues, keywords }
}

const MARK: Record<AtsStatus, string> = { pass: 'PASS', warn: 'WARN', fail: 'FAIL' }

export function formatAtsReport(report: AtsReport): string {
  const lines: string[] = [
    'ATS Scanner report',
    `Score: ${report.score}/100 (${report.grade})`,
    `Words: ${report.wordCount}`,
    '',
  ]
  for (const category of report.categories) {
    lines.push(`${category.label} — ${category.score}%`)
    for (const item of category.checks) {
      lines.push(`  [${MARK[item.status]}] ${item.label}: ${item.detail}`)
    }
    lines.push('')
  }
  if (report.keywords) {
    lines.push(`Keyword match: ${report.keywords.score}%`)
    lines.push(`  Matched: ${report.keywords.matched.join(', ') || 'none'}`)
    lines.push(`  Missing: ${report.keywords.missing.join(', ') || 'none'}`)
  }
  return lines.join('\n')
}
