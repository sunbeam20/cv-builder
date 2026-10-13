import type { Resume } from '../types'

const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
  'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below',
  'between', 'both', 'but', 'by', 'can', 'could', 'did', 'do', 'does', 'doing',
  'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have',
  'having', 'he', 'her', 'here', 'hers', 'him', 'his', 'how', 'i', 'if', 'in',
  'into', 'is', 'it', 'its', 'just', 'me', 'more', 'most', 'my', 'no', 'nor',
  'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours',
  'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than',
  'that', 'the', 'their', 'theirs', 'them', 'then', 'there', 'these', 'they',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was',
  'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why',
  'will', 'with', 'would', 'you', 'your', 'yours', 'whoever', 'whatever', 'also',
  'within', 'without', 'team', 'work', 'working', 'company',
  'join', 'looking', 'strong', 'good', 'great', 'new', 'role', 'position', 'job',
  'candidate', 'experience', 'skills', 'including', 'plus', 'etc',
  'apply', 'applicant', 'application', 'click', 'please', 'best', 'must', 'one',
  'two', 'time', 'years', 'year', 'day', 'days', 'per', 'well', 'across', 'often',
  'ability', 'able', 'part', 'help', 'support', 'use', 'using', 'used', 'like',
])

const PUNCT_TERMS = ['.net', 'node.js', 'c++', 'c#']

const tokenPattern = (): RegExp => {
  const special = PUNCT_TERMS.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .map((escaped) => `(?<![a-z0-9])${escaped}(?![a-z0-9])`)
    .join('|')
  return new RegExp(`(${special})|[a-z][a-z0-9-]{1,}`, 'gi')
}

const isStopword = (word: string): boolean => word.length < 2 || STOPWORDS.has(word)

export function tokenize(text: string): string[] {
  const raw = text.toLowerCase().match(tokenPattern())
  if (!raw) return []
  return raw.filter((word) => !isStopword(word))
}

export function extractKeywords(jobDescription: string, maxKeywords = 25): string[] {
  const counts = new Map<string, number>()
  for (const word of tokenize(jobDescription)) {
    counts.set(word, (counts.get(word) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, maxKeywords)
    .map(([word]) => word)
}

export function resumePlainText(resume: Resume): string {
  const parts: string[] = []
  const { profile, experience, education, skills, projects, certifications, languages } = resume
  parts.push(profile.fullName, profile.headline, profile.summary)
  parts.push(profile.email, profile.phone, profile.location, profile.website)
  for (const link of profile.links) parts.push(link.label, link.url)
  for (const entry of experience) {
    parts.push(entry.role, entry.company, entry.location, entry.start, entry.end, ...entry.bullets)
  }
  for (const entry of education) {
    parts.push(entry.school, entry.degree, entry.field, entry.location, entry.details)
  }
  for (const group of skills) parts.push(group.category, ...group.items)
  for (const project of projects) {
    parts.push(project.name, project.link, project.description, ...project.bullets)
  }
  for (const cert of certifications) parts.push(cert.name, cert.issuer, cert.link)
  for (const lang of languages) parts.push(lang.name, lang.proficiency)
  return parts.join(' ')
}

export interface KeywordMatchReport {
  keywords: string[]
  matched: string[]
  missing: string[]
  score: number
}

export function matchResumeToJob(
  resume: Resume,
  jobDescription: string,
  extraKeywords: string[] = [],
): KeywordMatchReport {
  const targets = [...new Set([...extraKeywords.flatMap(tokenize), ...extractKeywords(jobDescription)])]
  const haystack = resumePlainText(resume).toLowerCase()
  const matched = targets.filter((keyword) => haystack.includes(keyword))
  const missing = targets.filter((keyword) => !haystack.includes(keyword))
  const score = targets.length === 0 ? 0 : Math.round((matched.length / targets.length) * 100)
  return { keywords: targets, matched, missing, score }
}