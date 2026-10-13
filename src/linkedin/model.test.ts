import { describe, expect, it } from 'vitest'
import { analyseProfile, emptyProfile, headlineLeft, parseSkills } from './model'

describe('parseSkills', () => {
  it('splits commas and newlines', () => {
    expect(parseSkills('Figma, Research\nPrototyping')).toEqual(['Figma', 'Research', 'Prototyping'])
  })
})

describe('headlineLeft', () => {
  it('counts remaining characters', () => {
    expect(headlineLeft('abc')).toBe(217)
  })
})

describe('analyseProfile', () => {
  it('scores an empty profile low', () => {
    expect(analyseProfile(emptyProfile()).score).toBe(0)
  })

  it('rewards a complete profile', () => {
    const report = analyseProfile({
      headline: 'Senior Product Designer building fintech design systems',
      about:
        'I design products that people actually enjoy using. I led a redesign that increased signups 30% and reduced support tickets by 40%. I mentored 5 designers.',
      skills: 'Figma, Design systems, User research, Prototyping, Accessibility, HTML, CSS, Analytics, Facilitation',
    })
    expect(report.score).toBeGreaterThanOrEqual(80)
    expect(report.verbs).toContain('led')
    expect(report.quantified).toBeGreaterThanOrEqual(2)
  })
})
