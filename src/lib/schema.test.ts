import { describe, expect, it } from 'vitest'
import { bundleSchema, resumeSchema } from './schema'
import { emptyResume } from './helpers'
import { sampleResume } from './sampleData'

describe('resumeSchema', () => {
  it('accepts an empty resume', () => {
    expect(() => resumeSchema.parse(emptyResume())).not.toThrow()
  })

  it('accepts the sample resume', () => {
    const parsed = resumeSchema.parse(sampleResume())
    expect(parsed.experience.length).toBeGreaterThan(0)
  })

  it('rejects a resume missing profile fields', () => {
    const bad = { ...emptyResume() } as Record<string, unknown>
    delete (bad.profile as Record<string, unknown>).email
    expect(resumeSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects bullets that are not an array', () => {
    const bad = sampleResume()
    // @ts-expect-error intentionally invalid for the test
    bad.experience[0].bullets = 'not-an-array'
    expect(resumeSchema.safeParse(bad).success).toBe(false)
  })

  it('defaults sectionOrder when missing', () => {
    const input = emptyResume() as Record<string, unknown>
    delete input.sectionOrder
    const parsed = resumeSchema.parse(input)
    expect(parsed.sectionOrder).toEqual([
      'summary',
      'experience',
      'education',
      'skills',
      'projects',
      'certifications',
      'languages',
    ])
  })

  it('defaults hiddenSections to an empty array when missing', () => {
    const input = emptyResume() as Record<string, unknown>
    delete input.hiddenSections
    const parsed = resumeSchema.parse(input)
    expect(parsed.hiddenSections).toEqual([])
  })
})

describe('bundleSchema', () => {
  it('accepts a backup bundle without custom presets', () => {
    const parsed = bundleSchema.parse({ resume: emptyResume() })
    expect(parsed.customPresets).toBeUndefined()
  })

  it('round-trips custom design presets', () => {
    const parsed = bundleSchema.parse({
      resume: emptyResume(),
      customPresets: [{ id: 'p1', name: 'My Theme', customization: { accent: '#123456' } }],
    })
    expect(parsed.customPresets).toHaveLength(1)
    expect(parsed.customPresets?.[0].customization.accent).toBe('#123456')
  })
})
