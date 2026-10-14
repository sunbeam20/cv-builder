import { describe, expect, it } from 'vitest'
import { emptyLetter, fillTemplate, letterTitle, letterWordCount, renderLetter, sortLetters } from './model'

const letter = () => ({
  ...emptyLetter(),
  company: 'Acme',
  jobTitle: 'Engineer',
  hiringManager: 'Alex',
  opening: 'I am keen to join {company} as a {jobTitle}.',
  body: 'Body paragraph.',
})

describe('fillTemplate', () => {
  it('substitutes job title and company', () => {
    expect(fillTemplate('{jobTitle} at {company}', { jobTitle: 'Dev', company: 'Acme' })).toBe('Dev at Acme')
  })

  it('falls back to friendly defaults', () => {
    expect(fillTemplate('{jobTitle} / {company}', { jobTitle: '', company: '' })).toBe('this role / your company')
  })
})

describe('renderLetter', () => {
  it('assembles a letter with greeting and signature', () => {
    const text = renderLetter(letter())
    expect(text).toContain('Dear Alex,')
    expect(text).toContain('I am keen to join Acme as a Engineer.')
    expect(text).toContain('Sincerely,')
  })

  it('defaults the greeting when no manager is set', () => {
    expect(renderLetter(emptyLetter())).toContain('Dear Hiring Manager,')
  })
})

describe('letter style defaults', () => {
  it('defaults to sans, an accent colour and a margin', () => {
    const letter = emptyLetter()
    expect(letter.font).toBe('sans')
    expect(letter.accent).toMatch(/^#/)
    expect(letter.margin).toBeGreaterThan(0)
  })
})

describe('letterTitle / wordCount / sortLetters', () => {
  it('builds a readable title', () => {
    expect(letterTitle(letter())).toBe('Engineer · Acme')
    expect(letterTitle(emptyLetter())).toBe('Untitled letter')
  })

  it('counts words in the rendered letter', () => {
    expect(letterWordCount(letter())).toBeGreaterThan(10)
  })

  it('sorts by most recently updated', () => {
    const a = { ...letter(), id: 'a', updatedAt: '2026-01-01T00:00:00.000Z' }
    const b = { ...letter(), id: 'b', updatedAt: '2026-02-01T00:00:00.000Z' }
    expect(sortLetters([a, b]).map((item) => item.id)).toEqual(['b', 'a'])
  })
})
