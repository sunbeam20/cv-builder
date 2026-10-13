import { beforeEach, describe, expect, it } from 'vitest'
import { useResumeStore } from './resumeStore'
import { emptyResume } from '../lib/helpers'
import { sampleResume } from '../lib/sampleData'
import type { Resume } from '../types'

const get = () => useResumeStore.getState()

beforeEach(() => {
  get().replace(sampleResume())
  get().setTemplate('ats')
})

describe('resumeStore', () => {
  it('defaults to the ats template', () => {
    expect(get().template).toBe('ats')
  })

  it('updates the template', () => {
    get().setTemplate('modern')
    expect(get().template).toBe('modern')
  })

  it('updates resume immutably', () => {
    const before = get().resume
    get().update((d) => {
      d.profile.fullName = 'Changed Name'
    })
    const after = get().resume

    expect(after).not.toBe(before)
    expect(before.profile.fullName).toBe('Jordan Avery')
    expect(after.profile.fullName).toBe('Changed Name')
  })

  it('supports nested array mutations via immer', () => {
    get().update((d) => {
      d.experience[0].bullets.push('New highlight')
    })
    expect(get().resume.experience[0].bullets).toContain('New highlight')
  })

  it('replaces the whole resume', () => {
    const next = emptyResume() as Resume
    next.profile.fullName = 'Replaced'
    get().replace(next)
    expect(get().resume.profile.fullName).toBe('Replaced')
    expect(get().resume.experience).toEqual([])
  })

  it('resets to an empty resume', () => {
    get().reset()
    expect(get().resume.profile.fullName).toBe('')
    expect(get().resume.experience).toEqual([])
  })

  it('loads sample data', () => {
    get().reset()
    get().loadSample()
    expect(get().resume.experience.length).toBeGreaterThan(0)
  })
})
