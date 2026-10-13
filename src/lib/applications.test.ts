import { describe, expect, it } from 'vitest'
import { STATUS_LABELS, applicationsToCsv, emptyApplication } from './applications'
import type { Application } from '../types'

describe('emptyApplication', () => {
  it('creates a wishlist draft with empty fields', () => {
    const app = emptyApplication()
    expect(app.id).toBeTruthy()
    expect(app.status).toBe('wishlist')
    expect(app.company).toBe('')
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
    expect(lines[0]).toBe('Company,Role,Status,Location,URL,Date,Notes')
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
