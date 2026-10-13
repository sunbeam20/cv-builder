export interface Sender {
  name: string
  email: string
  phone: string
  location: string
  links: string[]
}

export interface CoverLetter {
  id: string
  company: string
  jobTitle: string
  hiringManager: string
  date: string
  opening: string
  body: string
  closing: string
  sender: Sender
  updatedAt: string
}

export const emptySender = (): Sender => ({ name: '', email: '', phone: '', location: '', links: [] })

export const uid = (): string => Math.random().toString(36).slice(2, 11)

export const emptyLetter = (): CoverLetter => ({
  id: uid(),
  company: '',
  jobTitle: '',
  hiringManager: '',
  date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
  opening: '',
  body: '',
  closing: 'Sincerely,',
  sender: emptySender(),
  updatedAt: new Date().toISOString(),
})

export const SAMPLE_BODY = `I'm excited to apply for the {jobTitle} role at {company}. Over the past several years I've built and shipped products end to end, and the challenges described in your posting map closely to the work I enjoy most.

In my current role I led a project that improved a key metric by 30% by simplifying the user journey and tightening up the release process. I like teams that care about craft, measure outcomes, and write things down.

I'd love the chance to bring that energy to {company}. Thank you for your time and consideration.`

export const TONE_SNIPPETS: { id: string; label: string; opening: string }[] = [
  {
    id: 'enthusiastic',
    label: 'Enthusiastic',
    opening:
      "I was genuinely excited when I saw the {jobTitle} opening at {company} — it reads like the kind of role I've been working toward.",
  },
  {
    id: 'direct',
    label: 'Direct',
    opening:
      "I'm applying for the {jobTitle} role at {company}. Here's why I think I'm a strong fit.",
  },
  {
    id: 'warm',
    label: 'Warm',
    opening:
      "Hello! I'd love to be considered for the {jobTitle} position at {company}. A little about me and why this role caught my eye.",
  },
]

/** Fill {jobTitle} and {company} placeholders. */
export function fillTemplate(template: string, letter: Pick<CoverLetter, 'jobTitle' | 'company'>): string {
  return template
    .replace(/\{jobTitle\}/g, letter.jobTitle || 'this role')
    .replace(/\{company\}/g, letter.company || 'your company')
}

export function renderLetter(letter: CoverLetter): string {
  const context = { jobTitle: letter.jobTitle, company: letter.company }
  const lines: string[] = []
  if (letter.date.trim()) lines.push(letter.date.trim(), '')
  if (letter.company.trim()) lines.push(letter.company.trim())
  if (letter.jobTitle.trim()) lines.push(letter.jobTitle.trim())
  if (letter.company.trim() || letter.jobTitle.trim()) lines.push('')
  lines.push(`Dear ${letter.hiringManager.trim() || 'Hiring Manager'},`, '')
  if (letter.opening.trim()) lines.push(fillTemplate(letter.opening.trim(), context), '')
  if (letter.body.trim()) lines.push(fillTemplate(letter.body.trim(), context), '')
  if (letter.closing.trim()) lines.push(letter.closing.trim())
  if (letter.sender.name.trim()) lines.push(letter.sender.name.trim())
  const contact = [letter.sender.email, letter.sender.phone, letter.sender.location]
    .map((value) => value.trim())
    .filter(Boolean)
  if (contact.length) lines.push(contact.join(' · '))
  if (letter.sender.links.length) lines.push(letter.sender.links.filter(Boolean).join(' · '))
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

export const letterWordCount = (letter: CoverLetter): number => {
  const text = renderLetter(letter)
  return text ? text.split(/\s+/).length : 0
}

export const letterTitle = (letter: CoverLetter): string =>
  [letter.jobTitle, letter.company].filter(Boolean).join(' · ') || 'Untitled letter'

export const sortLetters = (letters: CoverLetter[]): CoverLetter[] =>
  [...letters].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
