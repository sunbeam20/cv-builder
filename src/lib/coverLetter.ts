import type { CoverLetter, Profile, Resume } from '../types'

export const todayLong = (): string =>
  new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })

export const emptyCoverLetter = (profile: Profile): CoverLetter => ({
  company: '',
  role: profile.headline,
  recipient: '',
  date: todayLong(),
  greeting: 'Dear Hiring Manager,',
  body: '',
  closing: 'Sincerely,',
  signature: profile.fullName,
})

const firstName = (fullName: string): string => fullName.trim().split(/\s+/)[0] || fullName.trim()

export function buildCoverLetterDraft(resume: Resume, letter: CoverLetter): string {
  const { profile, experience, skills } = resume
  const name = firstName(profile.fullName) || 'I'
  const role = (letter.role || profile.headline || 'this role').trim()
  const company = letter.company.trim() || 'your company'

  const latest = experience[0]
  const topSkills = skills
    .flatMap((g) => g.items)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3)

  const paragraphs: string[] = []

  paragraphs.push(
    `I am writing to express my interest in the ${role} position at ${company}. ` +
      `With my background as a ${profile.headline || 'professional'}, I am confident I can ` +
      `contribute from day one and would welcome the opportunity to grow with your team.`,
  )

  const experienceSentence = latest
    ? `Most recently, as ${latest.role || 'a team member'} at ${latest.company || 'my previous company'}, ` +
      `I delivered results that made a measurable impact, and I bring that same focus to every project.`
    : ''
  const skillsSentence = topSkills.length
    ? `My core strengths include ${topSkills.join(', ')}, which map directly to the needs of this role.`
    : ''
  const summarySentence = profile.summary.trim()
    ? profile.summary.trim()
    : `${name} is a results-driven professional who values clarity, ownership, and continuous improvement.`

  paragraphs.push([summarySentence, experienceSentence, skillsSentence].filter(Boolean).join(' '))

  paragraphs.push(
    `I would love the chance to discuss how my experience aligns with ${company}'s goals. ` +
      `Thank you for your time and consideration — I look forward to speaking with you.`,
  )

  return paragraphs.join('\n\n')
}
