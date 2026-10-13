import { describe, expect, it } from 'vitest'
import {
  activityByWeek,
  collectTags,
  computeStats,
  countByStatus,
  daysBetween,
  filterApplications,
  followUpInfo,
  isStale,
  mergeApplications,
  normalizeApplication,
  parseDateOnly,
  relativeTime,
  sortApplications,
  toIcs,
} from './model'
import { emptyApplication } from '../lib/applications'
import type { Application } from '../types'

const app = (overrides: Partial<Application> = {}): Application => ({
  ...emptyApplication(),
  ...overrides,
})

describe('normalizeApplication', () => {
  it('fills defaults for a bare partial', () => {
    const result = normalizeApplication({ company: 'Acme' })
    expect(result.company).toBe('Acme')
    expect(result.status).toBe('wishlist')
    expect(result.tags).toEqual([])
    expect(result.archived).toBe(false)
    expect(result.history.length).toBeGreaterThan(0)
    expect(result.id).toBeTruthy()
  })
})

describe('date helpers', () => {
  it('parses yyyy-mm-dd into a local date', () => {
    const date = parseDateOnly('2024-03-05')
    expect(date?.getFullYear()).toBe(2024)
    expect(date?.getMonth()).toBe(2)
    expect(date?.getDate()).toBe(5)
    expect(parseDateOnly('nope')).toBeNull()
  })

  it('computes whole-day differences', () => {
    expect(daysBetween(new Date(2024, 0, 1), new Date(2024, 0, 11))).toBe(10)
    expect(daysBetween(new Date(2024, 0, 11), new Date(2024, 0, 1))).toBe(-10)
  })

  it('renders relative time', () => {
    const now = new Date(2024, 0, 10)
    expect(relativeTime('2024-01-10', now)).toBe('today')
    expect(relativeTime('2024-01-09', now)).toBe('yesterday')
    expect(relativeTime('2024-01-05', now)).toBe('5 days ago')
    expect(relativeTime('2024-01-12', now)).toBe('in 2 days')
  })
})

describe('followUpInfo', () => {
  const now = new Date(2024, 0, 10)
  it('classifies overdue, today, soon, scheduled, and none', () => {
    expect(followUpInfo(app({ followUpDate: '2024-01-05' }), now).state).toBe('overdue')
    expect(followUpInfo(app({ followUpDate: '2024-01-10' }), now).state).toBe('today')
    expect(followUpInfo(app({ followUpDate: '2024-01-12' }), now).state).toBe('soon')
    expect(followUpInfo(app({ followUpDate: '2024-02-20' }), now).state).toBe('scheduled')
    expect(followUpInfo(app(), now).state).toBe('none')
  })
})

describe('isStale', () => {
  const now = new Date(2024, 0, 30)
  it('is true for applied apps untouched for 14+ days', () => {
    expect(isStale(app({ status: 'applied', updatedAt: new Date(2024, 0, 1).toISOString() }), now)).toBe(true)
  })
  it('ignores other statuses and archived apps', () => {
    expect(isStale(app({ status: 'interview', updatedAt: new Date(2024, 0, 1).toISOString() }), now)).toBe(false)
    expect(
      isStale(app({ status: 'applied', archived: true, updatedAt: new Date(2024, 0, 1).toISOString() }), now),
    ).toBe(false)
  })
})

describe('filterApplications', () => {
  const a = app({ id: '1', company: 'Acme', status: 'applied', tags: ['remote'], priority: 2 })
  const b = app({ id: '2', company: 'Globex', status: 'offer', archived: true })
  const list = [a, b]

  it('excludes archived by default and includes them when asked', () => {
    expect(filterApplications(list).map((x) => x.id)).toEqual(['1'])
    expect(filterApplications(list, { includeArchived: true }).map((x) => x.id)).toEqual(['1', '2'])
  })

  it('filters by status, tag, and starred', () => {
    expect(filterApplications(list, { status: 'offer', includeArchived: true }).map((x) => x.id)).toEqual(['2'])
    expect(filterApplications(list, { tag: 'remote' }).map((x) => x.id)).toEqual(['1'])
    expect(filterApplications(list, { starredOnly: true }).map((x) => x.id)).toEqual(['1'])
  })

  it('matches the search query across fields', () => {
    expect(filterApplications(list, { query: 'globe', includeArchived: true }).map((x) => x.id)).toEqual(['2'])
    expect(filterApplications(list, { query: 'remote' }).map((x) => x.id)).toEqual(['1'])
  })

  it('filters to applications needing attention', () => {
    const due = app({ id: 'due', followUpDate: '2000-01-01' })
    const stale = app({ id: 'stale', status: 'applied', updatedAt: new Date(2000, 0, 1).toISOString() })
    const fine = app({ id: 'fine' })
    expect(filterApplications([due, stale, fine], { needsAttention: true }).map((x) => x.id).sort()).toEqual([
      'due',
      'stale',
    ])
  })
})

describe('sortApplications', () => {
  const a = app({ id: '1', company: 'Beta', priority: 1, updatedAt: new Date(2024, 0, 1).toISOString() })
  const b = app({ id: '2', company: 'Alpha', priority: 3, updatedAt: new Date(2024, 0, 5).toISOString() })
  const list = [a, b]

  it('sorts by company, priority, and recency', () => {
    expect(sortApplications(list, 'company-asc').map((x) => x.id)).toEqual(['2', '1'])
    expect(sortApplications(list, 'priority-desc').map((x) => x.id)).toEqual(['2', '1'])
    expect(sortApplications(list, 'updated-desc').map((x) => x.id)).toEqual(['2', '1'])
    expect(sortApplications(list, 'updated-asc').map((x) => x.id)).toEqual(['1', '2'])
  })
})

describe('computeStats', () => {
  const now = new Date(2024, 0, 10)
  const list = [
    app({ status: 'wishlist' }),
    app({ status: 'applied', date: '2024-01-09' }),
    app({ status: 'interview' }),
    app({ status: 'offer' }),
    app({ status: 'rejected' }),
    app({ status: 'applied', archived: true }),
  ]

  it('computes counts and rates', () => {
    const stats = computeStats(list, now)
    expect(stats.total).toBe(6)
    expect(stats.submitted).toBe(4)
    expect(stats.interviews).toBe(2)
    expect(stats.offers).toBe(1)
    expect(stats.responseRate).toBe(75)
    expect(stats.archived).toBe(1)
    expect(stats.thisWeek).toBe(1)
  })
})

describe('activityByWeek', () => {
  it('buckets applications into the last N weeks', () => {
    const now = new Date(2024, 0, 10)
    const buckets = activityByWeek([app({ date: '2024-01-10' }), app({ date: '2024-01-01' })], 4, now)
    expect(buckets).toHaveLength(4)
    expect(buckets[3]).toBe(1)
    expect(buckets.reduce((sum, n) => sum + n, 0)).toBe(2)
  })
})

describe('collectTags / mergeApplications / countByStatus', () => {
  it('collects sorted unique tags', () => {
    expect(collectTags([app({ tags: ['b', 'a'] }), app({ tags: ['a', 'c'] })])).toEqual(['a', 'b', 'c'])
  })

  it('merges by id with the incoming record winning', () => {
    const merged = mergeApplications([app({ id: '1', company: 'Old' })], [
      app({ id: '1', company: 'New' }),
      app({ id: '2' }),
    ])
    expect(merged.map((m) => m.company)).toContain('New')
    expect(merged).toHaveLength(2)
  })

  it('counts applications by status', () => {
    expect(
      countByStatus([app({ status: 'offer' }), app({ status: 'offer' }), app({ status: 'rejected' })]),
    ).toEqual({ wishlist: 0, applied: 0, interview: 0, offer: 2, rejected: 1 })
  })
})

describe('toIcs', () => {
  it('emits a VCALENDAR with all-day follow-ups and timed interview events', () => {
    const interview = app({
      id: 'x',
      company: 'Acme',
      role: 'Dev',
      followUpDate: '2024-01-15',
      url: 'https://acme.test/job',
    })
    interview.history = [{ id: 'h1', status: 'interview', at: '2024-01-12T10:00:00.000Z' }]

    const ics = toIcs([interview], new Date(2024, 0, 1))
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('END:VCALENDAR')
    expect(ics).toContain('DTSTART;VALUE=DATE:20240115')
    expect(ics).toContain('DTEND;VALUE=DATE:20240116')
    expect(ics).toContain('SUMMARY:Follow up: Acme – Dev')
    expect(ics).toContain('URL:https://acme.test/job')
    expect(ics).toContain('DTSTART:20240112T100000Z')
    expect(ics).toContain('SUMMARY:Interview: Acme – Dev')
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true)
  })

  it('escapes special characters and skips archived applications', () => {
    const escaped = app({ id: 'e', company: 'Acme, Inc.', role: 'Dev;Ops', followUpDate: '2024-02-01' })
    const archived = app({ id: 'z', archived: true, followUpDate: '2024-01-15' })

    const ics = toIcs([escaped, archived], new Date(2024, 0, 1))
    expect(ics).toContain('SUMMARY:Follow up: Acme\\, Inc. – Dev\\;Ops')
    expect(ics.split('BEGIN:VEVENT')).toHaveLength(2)
  })
})
