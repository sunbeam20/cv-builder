import { describe, expect, it } from 'vitest'
import { buildCoverLetterDraft, emptyCoverLetter, todayLong } from './coverLetter'
import { sampleResume } from './sampleData'
import type { CoverLetter } from '../types'

const baseLetter = (): CoverLetter => ({
  company: 'Acme Inc.',
  role: 'Senior Frontend Engineer',
  recipient: 'Jane Doe',
  date: 'January 1, 2026',
  greeting: 'Dear Hiring Manager,',
  body: '',
  closing: 'Sincerely,',
  signature: 'Jordan Avery',
})

describe('emptyCoverLetter', () => {
  it('uses the profile name and headline as defaults', () => {
    const resume = sampleResume()
    const letter = emptyCoverLetter(resume.profile)
    expect(letter.signature).toBe(resume.profile.fullName)
    expect(letter.role).toBe(resume.profile.headline)
    expect(letter.greeting).toBe('Dear Hiring Manager,')
    expect(letter.date).toBe(todayLong())
  })
})

describe('buildCoverLetterDraft', () => {
  it('references the target role and company across three paragraphs', () => {
    const resume = sampleResume()
    const draft = buildCoverLetterDraft(resume, baseLetter())
    const paragraphs = draft.split(/\n{2,}/).filter(Boolean)

    expect(paragraphs).toHaveLength(3)
    expect(draft).toContain('Senior Frontend Engineer')
    expect(draft).toContain('Acme Inc.')
    expect(draft).toContain(resume.experience[0].company)
  })

  it('falls back gracefully without experience or skills', () => {
    const resume = sampleResume()
    resume.experience = []
    resume.skills = []
    const draft = buildCoverLetterDraft(resume, { ...baseLetter(), company: '' })
    expect(draft).toContain('your company')
    expect(draft.split(/\n{2,}/).filter(Boolean)).toHaveLength(3)
  })
})
