import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { TrackerView } from './TrackerView'
import { Toaster } from '../ui/Toaster'
import { useResumeStore } from '../../store/resumeStore'
import { useToastStore } from '../../lib/toast'

beforeEach(() => {
  useResumeStore.getState().setApplications([])
  useToastStore.setState({ toasts: [] })
})

describe('TrackerView', () => {
  it('adds an application from the form', () => {
    render(<TrackerView />)

    fireEvent.change(screen.getByLabelText('Company'), { target: { value: 'Acme' } })
    fireEvent.change(screen.getByLabelText('Role'), { target: { value: 'Engineer' } })
    fireEvent.click(screen.getByRole('button', { name: /Add/ }))

    expect(useResumeStore.getState().applications).toHaveLength(1)
    expect(useResumeStore.getState().applications[0].company).toBe('Acme')
  })

  it('updates status and removes an application after confirming', () => {
    const app = {
      id: 'a1',
      company: 'Globex',
      role: 'Designer',
      location: '',
      url: '',
      status: 'applied' as const,
      date: '',
      notes: '',
    }
    useResumeStore.getState().setApplications([app])
    render(
      <>
        <TrackerView />
        <Toaster />
      </>,
    )

    fireEvent.change(screen.getByLabelText('Status for Globex'), { target: { value: 'offer' } })
    expect(useResumeStore.getState().applications[0].status).toBe('offer')

    fireEvent.click(screen.getByLabelText('Remove Globex'))
    expect(useResumeStore.getState().applications).toHaveLength(1)

    fireEvent.click(screen.getByRole('button', { name: 'Remove' }))
    expect(useResumeStore.getState().applications).toHaveLength(0)
  })

  it('shows an empty state when there are no applications', () => {
    render(<TrackerView />)
    expect(screen.getByText(/No applications yet/)).toBeInTheDocument()
  })
})