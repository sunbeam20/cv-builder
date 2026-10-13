import { describe, expect, it } from 'vitest'
import { analyseText, coverage, parseExtraKeywords, scoreBand } from './model'

describe('scoreBand', () => {
  it('classifies ranges', () => {
    expect(scoreBand(80).tone).toBe('high')
    expect(scoreBand(50).tone).toBe('medium')
    expect(scoreBand(10).tone).toBe('low')
  })
})

describe('parseExtraKeywords', () => {
  it('splits commas and newlines and lowercases', () => {
    expect(parseExtraKeywords('React, Node\nSQL')).toEqual(['react', 'node', 'sql'])
  })
})

describe('analyseText', () => {
  it('reports matched and missing keywords with a score', () => {
    const report = analyseText('I use react and typescript daily', 'We need react, typescript and graphql skills')
    expect(report.matched).toContain('react')
    expect(report.matched).toContain('typescript')
    expect(report.missing).toContain('graphql')
    expect(report.score).toBeGreaterThan(0)
  })
})

describe('coverage', () => {
  it('is zero when there are no keywords', () => {
    expect(coverage({ keywords: [], matched: [], missing: [], score: 0 })).toBe(0)
  })
})
