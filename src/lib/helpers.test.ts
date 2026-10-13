import { describe, expect, it } from 'vitest'
import { emptyResume, formatRange, resumeHasContent, slug, uid } from './helpers'
import { sampleResume } from './sampleData'

describe('formatRange', () => {
  it('returns empty string when both sides are empty', () => {
    expect(formatRange('', '', false)).toBe('')
  })

  it('returns just the start when end is empty', () => {
    expect(formatRange('2020', '', false)).toBe('2020')
  })

  it('returns just the end when start is empty', () => {
    expect(formatRange('', '2021', false)).toBe('2021')
  })

  it('joins start and end with an en dash', () => {
    expect(formatRange('2020', '2021', false)).toBe('2020 – 2021')
  })

  it('uses "Present" when current', () => {
    expect(formatRange('2020', '2021', true)).toBe('2020 – Present')
  })

  it('returns "Present" when current with no start', () => {
    expect(formatRange('', '', true)).toBe('Present')
  })
})

describe('slug', () => {
  it('replaces spaces with underscores', () => {
    expect(slug('Jordan Avery')).toBe('Jordan_Avery')
  })

  it('strips unsafe characters', () => {
    expect(slug('a/b*c')).toBe('abc')
  })

  it('falls back to "resume" for empty input', () => {
    expect(slug('   ')).toBe('resume')
  })
})

describe('uid', () => {
  it('produces unique ids', () => {
    const ids = new Set(Array.from({ length: 50 }, () => uid()))
    expect(ids.size).toBe(50)
  })
})

describe('emptyResume', () => {
  it('has empty collections and profile strings', () => {
    const resume = emptyResume()
    expect(resume.experience).toEqual([])
    expect(resume.profile.fullName).toBe('')
    expect(resume.profile.links).toEqual([])
  })
})

describe('resumeHasContent', () => {
  it('is false for a blank resume', () => {
    expect(resumeHasContent(emptyResume())).toBe(false)
  })

  it('is true for the sample resume', () => {
    expect(resumeHasContent(sampleResume())).toBe(true)
  })

  it('is true once a name is entered', () => {
    const resume = emptyResume()
    resume.profile.fullName = 'Jordan'
    expect(resumeHasContent(resume)).toBe(true)
  })
})
