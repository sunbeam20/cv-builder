import { beforeEach, describe, expect, it } from 'vitest'
import { useJobsStore } from './store'
import { emptyApplication } from '../lib/applications'

const get = () => useJobsStore.getState()

beforeEach(() => {
  get().setApplications([])
  useJobsStore.setState({ views: [], goal: 10 })
})

describe('jobsStore', () => {
  it('adds applications to the top of the list', () => {
    const first = { ...emptyApplication(), company: 'Acme', role: 'Engineer' }
    const second = { ...emptyApplication(), company: 'Globex', role: 'Designer' }
    get().addApplication(first)
    get().addApplication(second)
    expect(get().applications.map((a) => a.company)).toEqual(['Globex', 'Acme'])
  })

  it('updates an application immutably via immer', () => {
    const app = { ...emptyApplication(), company: 'Acme', role: 'Engineer' }
    get().addApplication(app)
    const before = get().applications
    get().updateApplication(app.id, (d) => {
      d.status = 'offer'
      d.notes = 'Great team'
    })
    const after = get().applications
    expect(after).not.toBe(before)
    expect(after[0].status).toBe('offer')
    expect(after[0].notes).toBe('Great team')
  })

  it('ignores updates for unknown ids', () => {
    const app = { ...emptyApplication(), company: 'Acme' }
    get().addApplication(app)
    get().updateApplication('missing', (d) => {
      d.company = 'Nope'
    })
    expect(get().applications[0].company).toBe('Acme')
  })

  it('removes an application by id', () => {
    const app = { ...emptyApplication(), company: 'Acme' }
    get().addApplication(app)
    get().removeApplication(app.id)
    expect(get().applications).toHaveLength(0)
  })

  it('replaces all applications (used by import)', () => {
    get().setApplications([
      { ...emptyApplication(), company: 'One' },
      { ...emptyApplication(), company: 'Two' },
    ])
    expect(get().applications.map((a) => a.company)).toEqual(['One', 'Two'])
  })

  it('records history when an application moves status', () => {
    const app = { ...emptyApplication(), company: 'Acme' }
    get().addApplication(app)
    get().moveApplication(app.id, 'applied', 'Submitted via site')
    const moved = get().applications[0]
    expect(moved.status).toBe('applied')
    expect(moved.history.at(-1)).toMatchObject({ status: 'applied', note: 'Submitted via site' })
    const length = moved.history.length
    get().moveApplication(app.id, 'applied')
    expect(get().applications[0].history).toHaveLength(length)
  })

  it('logs a note onto the timeline and ignores blank notes', () => {
    const app = { ...emptyApplication(), company: 'Acme' }
    get().addApplication(app)
    const before = get().applications[0].history.length
    get().addNote(app.id, 'Called the recruiter')
    const history = get().applications[0].history
    expect(history).toHaveLength(before + 1)
    expect(history.at(-1)).toMatchObject({ note: 'Called the recruiter', status: 'wishlist' })
    get().addNote(app.id, '   ')
    expect(get().applications[0].history).toHaveLength(before + 1)
  })

  it('archives and restores applications', () => {
    const app = { ...emptyApplication(), company: 'Acme' }
    get().addApplication(app)
    get().setArchived(app.id, true)
    expect(get().applications[0].archived).toBe(true)
    get().setArchived(app.id, false)
    expect(get().applications[0].archived).toBe(false)
  })

  it('clamps priority to 0-3', () => {
    const app = { ...emptyApplication(), company: 'Acme' }
    get().addApplication(app)
    get().setPriority(app.id, 9)
    expect(get().applications[0].priority).toBe(3)
    get().setPriority(app.id, -2)
    expect(get().applications[0].priority).toBe(0)
  })

  it('duplicates an application as an unarchived copy', () => {
    const app = { ...emptyApplication(), company: 'Acme', archived: true }
    get().addApplication(app)
    get().duplicateApplication(app.id)
    expect(get().applications).toHaveLength(2)
    const copy = get().applications[0]
    expect(copy.id).not.toBe(app.id)
    expect(copy.company).toBe('Acme')
    expect(copy.archived).toBe(false)
    expect(copy.history).toHaveLength(1)
  })

  it('imports by merging or replacing', () => {
    get().addApplication({ ...emptyApplication(), id: 'a', company: 'One' })
    get().importApplications([{ ...emptyApplication(), id: 'b', company: 'Two' }], 'merge')
    expect(get().applications.map((a) => a.id).sort()).toEqual(['a', 'b'])
    get().importApplications([{ ...emptyApplication(), id: 'c', company: 'Three' }], 'replace')
    expect(get().applications.map((a) => a.id)).toEqual(['c'])
  })

  it('restores a deleted application at the given index', () => {
    get().setApplications([
      { ...emptyApplication(), id: 'a', company: 'One' },
      { ...emptyApplication(), id: 'b', company: 'Two' },
    ])
    get().restoreApplication({ ...emptyApplication(), id: 'c', company: 'Three' }, 1)
    expect(get().applications.map((a) => a.id)).toEqual(['a', 'c', 'b'])
  })

  it('clears every application', () => {
    get().setApplications([{ ...emptyApplication(), company: 'One' }])
    get().clearAll()
    expect(get().applications).toEqual([])
  })

  it('saves, replaces, and removes named views', () => {
    const view = {
      id: 'v1',
      name: 'Favourites',
      query: '',
      status: 'all' as const,
      tag: null,
      starredOnly: true,
      followUpOnly: false,
      needsAttention: false,
      includeArchived: false,
      sort: 'updated-desc' as const,
      view: 'list' as const,
    }
    get().saveView(view)
    expect(get().views.map((v) => v.name)).toEqual(['Favourites'])
    get().saveView({ ...view, name: 'Starred' })
    expect(get().views).toHaveLength(1)
    expect(get().views[0].name).toBe('Starred')
    get().removeView('v1')
    expect(get().views).toHaveLength(0)
  })

  it('sets a clamped application goal', () => {
    get().setGoal(20)
    expect(get().goal).toBe(20)
    get().setGoal(-5)
    expect(get().goal).toBe(0)
    get().setGoal(2000)
    expect(get().goal).toBe(999)
  })
})
