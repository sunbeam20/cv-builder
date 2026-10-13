import { describe, expect, it } from 'vitest'
import {
  STATUS_LABELS,
  applicationsToCsv,
  csvToApplications,
  emptyApplication,
} from './applications'
import type { Application } from '../types'

describe('emptyApplication', () => {
  it('creates a wishlist draft with empty fields and a seeded history', () => {
    const app = emptyApplication()
    expect(app.id).toBeTruthy()
    expect(app.status).toBe('wishlist')
    expect(app.company).toBe('')
    expect(app.tags).toEqual([])
    expect(app.archived).toBe(false)
    expect(app.history).toHaveLength(1)
    expect(app.history[0].status).toBe('wishlist')
    expect(app.createdAt).toBeTruthy()
  })
})

describe('applicationsToCsv', () => {
  it('writes a header row and one row per application', () => {
    const app: Application = {
      ...emptyApplication(),
      company: 'Acme',
      role: 'Engineer',
      status: 'offer',
    }
    const csv = applicationsToCsv([app])
    const lines = csv.split('\n')
    expect(lines[0]).toBe(
      'Company,Role,Status,Priority,Location,Salary,Source,URL,Applied,Follow-up,Contact,Email,Tags,Resume,Updated,Archived,Notes',
    )
    expect(lines[1]).toContain('Acme,Engineer,Offer')
  })

  it('escapes commas, quotes and newlines', () => {
    const app: Application = {
      ...emptyApplication(),
      company: 'Acme, Inc.',
      role: 'He said "hi"',
      notes: 'line1\nline2',
      status: 'applied',
    }
    const csv = applicationsToCsv([app])
    expect(csv).toContain('"Acme, Inc."')
    expect(csv).toContain('"He said ""hi"""')
    expect(csv).toContain('"line1\nline2"')
    expect(csv).toContain(STATUS_LABELS.applied)
  })
})

describe('csvToApplications', () => {
  it('round-trips the fields written by applicationsToCsv', () => {
    const app: Application = {
      ...emptyApplication(),
      company: 'Acme',
      role: 'Engineer',
      status: 'offer',
      priority: 2,
      location: 'Remote',
      salary: '£70k',
      source: 'LinkedIn',
      date: '2024-01-02',
      followUpDate: '2024-02-01',
      contactName: 'Jo Bloggs',
      contactEmail: 'jo@acme.test',
      tags: ['remote', 'senior'],
      resumeVersion: 'Frontend v2',
      notes: 'Great team',
    }
    const [back] = csvToApplications(applicationsToCsv([app]))
    expect(back.company).toBe('Acme')
    expect(back.role).toBe('Engineer')
    expect(back.status).toBe('offer')
    expect(back.priority).toBe(2)
    expect(back.location).toBe('Remote')
    expect(back.salary).toBe('£70k')
    expect(back.source).toBe('LinkedIn')
    expect(back.date).toBe('2024-01-02')
    expect(back.followUpDate).toBe('2024-02-01')
    expect(back.contactName).toBe('Jo Bloggs')
    expect(back.contactEmail).toBe('jo@acme.test')
    expect(back.tags).toEqual(['remote', 'senior'])
    expect(back.resumeVersion).toBe('Frontend v2')
    expect(back.notes).toBe('Great team')
  })

  it('accepts a minimal header-less file of Company,Role', () => {
    const [app] = csvToApplications('Acme,Engineer')
    expect(app.company).toBe('Acme')
    expect(app.role).toBe('Engineer')
    expect(app.status).toBe('wishlist')
  })

  it('returns an empty list for blank input', () => {
    expect(csvToApplications('')).toEqual([])
  })
})
