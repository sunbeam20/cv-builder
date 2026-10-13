import { describe, expect, it } from 'vitest'
import { analyzeAts, formatAtsReport, gradeFor, wordCount, SAMPLE_ATS_TEXT } from './ats'

const BLANK = ''

describe('wordCount', () => {
  it('counts whitespace-separated tokens', () => {
    expect(wordCount('one two   three')).toBe(3)
    expect(wordCount('')).toBe(0)
  })
})

describe('gradeFor', () => {
  it('maps scores to grades', () => {
    expect(gradeFor(90)).toBe('Excellent')
    expect(gradeFor(75)).toBe('Good')
    expect(gradeFor(55)).toBe('Needs work')
    expect(gradeFor(20)).toBe('Poor')
  })
})

describe('analyzeAts', () => {
  it('scores the sample resume highly', () => {
    const report = analyzeAts(SAMPLE_ATS_TEXT)
    expect(report.score).toBeGreaterThanOrEqual(70)
    expect(report.grade).toBe('Excellent')
    expect(report.wordCount).toBeGreaterThan(100)
    expect(report.keywords).toBeNull()
  })

  it('penalises a blank document', () => {
    const report = analyzeAts(BLANK)
    expect(report.score).toBe(0)
    expect(report.issues.length).toBe(report.categories.flatMap((c) => c.checks).length)
  })

  it('flags first-person pronouns and buzzwords', () => {
    const bad = `My name is Alex. I am a team player and a hard worker.
I built things. I like to think outside the box. I am a proactive self-starter.
I deliver results because I am detail-oriented and dynamic.`
    const report = analyzeAts(bad)
    const pronouns = report.categories
      .flatMap((c) => c.checks)
      .find((check) => check.id === 'pronouns')
    const buzzwords = report.categories
      .flatMap((c) => c.checks)
      .find((check) => check.id === 'buzzwords')
    expect(pronouns?.status).not.toBe('pass')
    expect(buzzwords?.status).not.toBe('pass')
  })

  it('rewards contact details and standard sections', () => {
    const report = analyzeAts(SAMPLE_ATS_TEXT)
    const byId = new Map(report.categories.flatMap((c) => c.checks).map((c) => [c.id, c]))
    expect(byId.get('email')?.status).toBe('pass')
    expect(byId.get('links')?.status).toBe('pass')
    expect(byId.get('sections')?.status).toBe('pass')
  })

  it('adds a keyword-match category when a job description is supplied', () => {
    const report = analyzeAts(SAMPLE_ATS_TEXT, 'React, TypeScript and GraphQL engineer. Kubernetes.')
    expect(report.keywords).not.toBeNull()
    expect(report.categories.some((c) => c.id === 'keywords')).toBe(true)
    expect(report.keywords?.matched).toContain('react')
    expect(report.keywords?.missing).toContain('kubernetes')
  })

  it('sorts issues by weight and lists only non-passing checks', () => {
    const report = analyzeAts('Short.')
    expect(report.issues.length).toBeGreaterThan(0)
    expect(report.issues.every((issue) => issue.status !== 'pass')).toBe(true)
    const weights = report.issues.map((issue) => issue.weight)
    expect([...weights].sort((a, b) => b - a)).toEqual(weights)
  })

  it('flags emoji in the text', () => {
    const report = analyzeAts(`${SAMPLE_ATS_TEXT}\nGreat culture 🚀🎉🔥`)
    const emoji = report.categories.flatMap((c) => c.checks).find((check) => check.id === 'emoji')
    expect(emoji?.status).not.toBe('pass')
  })
})

describe('formatAtsReport', () => {
  it('renders a readable text report', () => {
    const text = formatAtsReport(analyzeAts(SAMPLE_ATS_TEXT, 'React TypeScript'))
    expect(text).toContain('ATS Scanner report')
    expect(text).toContain('Score:')
    expect(text).toContain('Keyword match:')
    expect(text).toContain('[PASS]')
  })
})
