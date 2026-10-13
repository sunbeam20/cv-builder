import { describe, expect, it } from 'vitest'
import { analyzeResume } from './completeness'
import { sampleResume } from './sampleData'
import { emptyResume } from './helpers'
import type { Resume } from '../types'

describe('analyzeResume', () => {
  it('scores a complete sample resume highly', () => {
    const report = analyzeResume(sampleResume())
    expect(report.score).toBeGreaterThanOrEqual(90)
    expect(report.missing).toHaveLength(0)
  })

  it('scores an empty resume low and lists missing items', () => {
    const report = analyzeResume(emptyResume() as Resume)
    expect(report.score).toBeLessThan(20)
    expect(report.missing.length).toBeGreaterThan(0)
    expect(report.missing.map((c) => c.id)).toContain('name')
    expect(report.missing.map((c) => c.id)).toContain('experience')
  })

  it('awards the quantified-achievement check when a bullet has a number', () => {
    const resume = sampleResume()
    resume.experience = [
      {
        id: 'x',
        company: 'Acme',
        role: 'Engineer',
        location: '',
        start: '',
        end: '',
        current: false,
        bullets: ['Shipped a feature'],
      },
    ]
    resume.projects = []
    const withoutNumber = analyzeResume(resume)
    expect(withoutNumber.missing.map((c) => c.id)).toContain('quantified')

    resume.experience[0].bullets = ['Cut load time by 42%']
    const withNumber = analyzeResume(resume)
    expect(withNumber.missing.map((c) => c.id)).not.toContain('quantified')
  })

  it('returns a score between 0 and 100', () => {
    const report = analyzeResume(sampleResume())
    expect(report.score).toBeGreaterThanOrEqual(0)
    expect(report.score).toBeLessThanOrEqual(100)
  })
})
