import { beforeEach, describe, expect, it } from 'vitest'
import { useResumeStore } from './resumeStore'
import { emptyResume } from '../lib/helpers'
import { emptyApplication } from '../lib/applications'
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

  it('applies, resets and clears design customization', () => {
    get().setCustomization({ accent: '#ff0000', baseFontSize: 12 })
    expect(get().customization).toEqual({ accent: '#ff0000', baseFontSize: 12 })

    get().resetCustomization()
    expect(get().customization).toEqual({})

    get().setCustomization({ fontId: 'georgia' })
    get().setTemplate('modern')
    expect(get().customization).toEqual({})
  })

  it('saves and removes custom presets from the current customization', () => {
    get().setCustomization({ accent: '#123456', bodyColor: '#222222' })
    get().saveCustomPreset('  My Look  ')
    const saved = get().customPresets.at(-1)
    expect(saved?.name).toBe('My Look')
    expect(saved?.customization).toEqual({ accent: '#123456', bodyColor: '#222222' })

    get().removeCustomPreset(saved!.id)
    expect(get().customPresets.find((p) => p.id === saved!.id)).toBeUndefined()
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

  it('reorders sections', () => {
    const before = [...get().resume.sectionOrder]
    get().moveSection(0, 2)
    const after = get().resume.sectionOrder
    expect(after[0]).toBe(before[1])
    expect(after[1]).toBe(before[2])
    expect(after[2]).toBe(before[0])
    expect(after).toHaveLength(before.length)
  })

  it('ignores out-of-range section moves', () => {
    const before = [...get().resume.sectionOrder]
    get().moveSection(-1, 3)
    get().moveSection(0, 99)
    expect(get().resume.sectionOrder).toEqual(before)
  })

  it('toggles a section between hidden and visible', () => {
    get().toggleSection('projects')
    expect(get().resume.hiddenSections).toContain('projects')
    get().toggleSection('projects')
    expect(get().resume.hiddenSections).not.toContain('projects')
  })

  it('undoes and redoes resume edits', () => {
    const original = get().resume.profile.fullName
    get().update((d) => {
      d.profile.fullName = 'New Name'
    })
    expect(get().resume.profile.fullName).toBe('New Name')

    get().undo()
    expect(get().resume.profile.fullName).toBe(original)

    get().redo()
    expect(get().resume.profile.fullName).toBe('New Name')
  })

  it('clears redo history after a new edit', () => {
    get().update((d) => void (d.profile.fullName = 'A'))
    get().undo()
    expect(get().future.length).toBe(1)
    get().update((d) => void (d.profile.headline = 'B'))
    expect(get().future.length).toBe(0)
  })

  it('does nothing when there is no history to undo', () => {
    expect(get().past.length).toBe(0)
    expect(() => get().undo()).not.toThrow()
  })

  it('updates and replaces the cover letter', () => {
    get().updateCoverLetter((d) => {
      d.company = 'Acme'
    })
    expect(get().coverLetter.company).toBe('Acme')
  })

  it('adds, updates and removes applications', () => {
    get().setApplications([])
    const app = { ...emptyApplication(), company: 'Acme', role: 'Engineer' }
    get().addApplication(app)
    expect(get().applications).toHaveLength(1)

    get().updateApplication(app.id, (d) => {
      d.status = 'offer'
    })
    expect(get().applications[0].status).toBe('offer')

    get().removeApplication(app.id)
    expect(get().applications).toHaveLength(0)
  })
})
