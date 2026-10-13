import { describe, expect, it } from 'vitest'
import { extractKeywords, matchResumeToJob, resumePlainText, tokenize } from './match'
import { emptyResume } from './helpers'
import { sampleResume } from './sampleData'
import type { Resume } from '../types'

describe('tokenize', () => {
  it('keeps meaningful terms and drops stopwords', () => {
    const words = tokenize('We are looking for a Senior React engineer with SQL and the ability to lead')
    expect(words).toContain('react')
    expect(words).toContain('sql')
    expect(words).toContain('senior')
    expect(words).not.toContain('the')
    expect(words).not.toContain('we')
    expect(words).not.toContain('for')
  })

  it('recognizes short technical terms', () => {
    expect(tokenize('Experience with C++ and C#, API design')).toContain('c++')
    expect(tokenize('Experience with C++ and C#, API design')).toContain('c#')
    expect(tokenize('Experience with C++ and C#, API design')).toContain('api')
  })

  it('returns an empty array for empty input', () => {
    expect(tokenize('')).toEqual([])
    expect(tokenize('   ')).toEqual([])
  })
})

describe('extractKeywords', () => {
  it('ranks more frequent keywords first', () => {
    const keywords = extractKeywords('react react react typescript typescript docker', 10)
    expect(keywords[0]).toBe('react')
    expect(keywords).toContain('typescript')
    expect(keywords).toContain('docker')
  })

  it('respects the maxKeywords limit', () => {
    const keywords = extractKeywords('one two three four five six seven eight nine ten eleven twelve', 5)
    expect(keywords.length).toBeLessThanOrEqual(5)
  })
})

describe('resumePlainText', () => {
  it('flattens all sections into a single string', () => {
    const resume = sampleResume()
    const text = resumePlainText(resume).toLowerCase()
    expect(text).toContain('jordan aver')
    expect(text).toContain('react')
    expect(text).toContain('typescript')
    expect(text).toContain('northwind')
    expect(text).toContain('university of texas')
  })
})

describe('matchResumeToJob', () => {
  it('reports matched keywords from the sample resume', () => {
    const report = matchResumeToJob(
      sampleResume(),
      'Senior Frontend Engineer with React, TypeScript, and accessibility experience',
    )
    expect(report.matched).toContain('react')
    expect(report.matched).toContain('typescript')
    expect(report.matched).toContain('accessibility')
    expect(report.score).toBeGreaterThan(0)
  })

  it('flags keywords missing from the resume', () => {
    const report = matchResumeToJob(sampleResume(), 'GraphQL, Docker and Kubernetes are a must')
    expect(report.missing).toContain('graphql')
    expect(report.missing).toContain('docker')
    expect(report.missing).toContain('kubernetes')
  })

  it('includes extra keywords provided by the user', () => {
    const report = matchResumeToJob(
      sampleResume(),
      'Frontend engineer',
      ['react', 'microservices', 'graphql'],
    )
    expect(report.keywords).toContain('microservices')
    expect(report.matched).toContain('react')
    expect(report.missing).toContain('graphql')
  })

  it('handles an empty resume and empty description', () => {
    const report = matchResumeToJob(emptyResume() as Resume, '')
    expect(report.keywords).toEqual([])
    expect(report.score).toBe(0)
  })

  it('computes a 100% score when everything is covered', () => {
    const resume = sampleResume()
    const report = matchResumeToJob(resume, 'Frontend React engineer with TypeScript')
    const targeted = tokenize('Frontend React engineer with TypeScript')
    expect(report.missing.length).toBe(0)
    expect(report.score).toBe(100)
    expect(report.score).toBe(Math.round((targeted.filter((k) => resumePlainText(resume).toLowerCase().includes(k)).length / targeted.length) * 100))
  })
})