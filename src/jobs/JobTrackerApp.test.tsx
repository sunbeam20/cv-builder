import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { JobTrackerApp } from './JobTrackerApp'
import { Toaster } from '../components/ui/Toaster'
import { useJobsStore } from './store'
import { useToastStore } from '../lib/toast'
import { emptyApplication } from '../lib/applications'
import type { Application } from '../types'

const base = (overrides: Partial<Application> = {}): Application => ({
  ...emptyApplication(),
  id: 'a1',
  company: 'Globex',
  role: 'Designer',
  status: 'applied',
  ...overrides,
})

beforeEach(() => {
  useJobsStore.getState().setApplications([])
  useJobsStore.setState({ views: [], goal: 10 })
  useToastStore.setState({ toasts: [] })
})

describe('JobTrackerApp', () => {
  it('adds an application from the form', () => {
    render(<JobTrackerApp />)

    fireEvent.click(screen.getByRole('button', { name: 'New' }))
    const dialog = screen.getByRole('dialog', { name: 'Add application' })
    fireEvent.change(within(dialog).getByLabelText('Company'), { target: { value: 'Acme' } })
    fireEvent.change(within(dialog).getByLabelText('Role'), { target: { value: 'Engineer' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add application' }))

    const apps = useJobsStore.getState().applications
    expect(apps).toHaveLength(1)
    expect(apps[0].company).toBe('Acme')
    expect(screen.getByText('Acme')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('moves status, then removes and can undo', () => {
    useJobsStore.getState().setApplications([base()])
    render(
      <>
        <JobTrackerApp />
        <Toaster />
      </>,
    )

    fireEvent.change(screen.getByLabelText('Status for Globex'), { target: { value: 'offer' } })
    expect(useJobsStore.getState().applications[0].status).toBe('offer')

    fireEvent.click(screen.getByLabelText('Remove Globex'))
    expect(useJobsStore.getState().applications).toHaveLength(0)

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(useJobsStore.getState().applications).toHaveLength(1)
  })

  it('sets priority from the card stars', () => {
    useJobsStore.getState().setApplications([base()])
    render(<JobTrackerApp />)

    fireEvent.click(screen.getByLabelText('Set priority 2'))
    expect(useJobsStore.getState().applications[0].priority).toBe(2)
  })

  it('duplicates an application', () => {
    useJobsStore.getState().setApplications([base()])
    render(<JobTrackerApp />)

    fireEvent.click(screen.getByLabelText('Duplicate Globex'))
    expect(useJobsStore.getState().applications).toHaveLength(2)
  })

  it('archives an application and hides it until archived are shown', () => {
    useJobsStore.getState().setApplications([base()])
    render(<JobTrackerApp />)

    fireEvent.click(screen.getByLabelText('Archive'))
    expect(screen.queryByLabelText('Status for Globex')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Archived' }))
    expect(screen.getByLabelText('Status for Globex')).toBeInTheDocument()
  })

  it('filters applications by status', () => {
    useJobsStore.getState().setApplications([
      base(),
      base({ id: 'a2', company: 'Initech', status: 'offer' }),
    ])
    render(<JobTrackerApp />)

    fireEvent.click(screen.getByRole('button', { name: /Offer: 1/ }))
    expect(screen.queryByLabelText('Status for Globex')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Status for Initech')).toBeInTheDocument()
  })

  it('searches across company, role, and notes', () => {
    useJobsStore.getState().setApplications([
      base(),
      base({ id: 'a2', company: 'Initech', notes: 'dream job' }),
    ])
    render(<JobTrackerApp />)

    fireEvent.change(screen.getByLabelText('Search applications'), { target: { value: 'initech' } })
    expect(screen.queryByLabelText('Status for Globex')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Status for Initech')).toBeInTheDocument()
  })

  it('bulk-moves selected applications', () => {
    useJobsStore.getState().setApplications([base()])
    render(<JobTrackerApp />)

    fireEvent.click(screen.getByLabelText('Select Globex'))
    fireEvent.change(screen.getByLabelText('Move selected to status'), { target: { value: 'interview' } })
    expect(useJobsStore.getState().applications[0].status).toBe('interview')
  })

  it('switches to the board view', () => {
    useJobsStore.getState().setApplications([base()])
    render(<JobTrackerApp />)

    fireEvent.click(screen.getByRole('button', { name: 'board' }))
    expect(screen.getByLabelText('Drag Globex')).toBeInTheDocument()
    expect(screen.getAllByText('Drop here').length).toBeGreaterThan(0)
  })

  it('logs a note to the timeline from the edit dialog', () => {
    useJobsStore.getState().setApplications([base()])
    render(<JobTrackerApp />)

    fireEvent.click(screen.getByLabelText('Edit Globex'))
    const dialog = screen.getByRole('dialog', { name: 'Edit application' })
    fireEvent.change(within(dialog).getByLabelText('Log a note'), {
      target: { value: 'Sent a follow-up email' },
    })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add' }))

    expect(within(dialog).getByText(/Sent a follow-up email/)).toBeInTheDocument()
    const history = useJobsStore.getState().applications[0].history
    expect(history.at(-1)).toMatchObject({ note: 'Sent a follow-up email' })
  })

  it('filters to applications needing attention', () => {
    useJobsStore.getState().setApplications([
      base({ id: 'due', company: 'Urgent', followUpDate: '2000-01-01' }),
      base({ id: 'fine', company: 'Calm' }),
    ])
    render(<JobTrackerApp />)

    fireEvent.click(screen.getByRole('button', { name: 'Needs attention' }))
    expect(screen.getByLabelText('Status for Urgent')).toBeInTheDocument()
    expect(screen.queryByLabelText('Status for Calm')).not.toBeInTheDocument()
  })

  it('opens the new-application dialog with the N shortcut', () => {
    render(<JobTrackerApp />)
    fireEvent.keyDown(document.body, { key: 'n' })
    expect(screen.getByRole('dialog', { name: 'Add application' })).toBeInTheDocument()
  })

  it('focuses search with the / shortcut and ignores it while typing', () => {
    useJobsStore.getState().setApplications([base()])
    render(<JobTrackerApp />)

    fireEvent.keyDown(document.body, { key: '/' })
    expect(screen.getByLabelText('Search applications')).toHaveFocus()

    fireEvent.keyDown(screen.getByLabelText('Search applications'), { key: 'n' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('toggles the board with the B shortcut', () => {
    useJobsStore.getState().setApplications([base()])
    render(<JobTrackerApp />)

    fireEvent.keyDown(document.body, { key: 'b' })
    expect(screen.getByLabelText('Drag Globex')).toBeInTheDocument()
    fireEvent.keyDown(document.body, { key: 'b' })
    expect(screen.queryByLabelText('Drag Globex')).not.toBeInTheDocument()
  })

  it('saves, applies, and removes a named view', () => {
    useJobsStore.getState().setApplications([base()])
    render(<JobTrackerApp />)

    fireEvent.click(screen.getByRole('button', { name: 'Starred' }))
    fireEvent.click(screen.getByRole('button', { name: /Save current view/ }))
    fireEvent.change(screen.getByLabelText('View name'), { target: { value: 'Faves' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByRole('button', { name: 'Faves' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Starred' }))
    expect(screen.getByRole('button', { name: 'Starred' })).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(screen.getByRole('button', { name: 'Faves' }))
    expect(screen.getByRole('button', { name: 'Starred' })).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(screen.getByLabelText('Remove view Faves'))
    expect(screen.queryByRole('button', { name: 'Faves' })).not.toBeInTheDocument()
  })

  it('updates the 30-day application goal', () => {
    render(<JobTrackerApp />)
    fireEvent.change(screen.getByLabelText('Application goal'), { target: { value: '25' } })
    expect(useJobsStore.getState().goal).toBe(25)
  })

  it('shows an empty state when there are no applications', () => {
    render(<JobTrackerApp />)
    expect(screen.getByText(/No applications yet/)).toBeInTheDocument()
  })
})
