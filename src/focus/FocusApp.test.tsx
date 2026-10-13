import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { FocusApp } from './FocusApp'
import { useFocusStore } from './store'
import { DEFAULT_SETTINGS } from './model'

beforeEach(() => {
  localStorage.clear()
  useFocusStore.setState({ sessions: [], settings: DEFAULT_SETTINGS })
})

describe('FocusApp', () => {
  it('starts on a 25 minute focus block', () => {
    render(<FocusApp />)
    expect(screen.getByLabelText('Time remaining')).toHaveTextContent('25:00')
    expect(screen.getByText('Focus')).toBeInTheDocument()
  })

  it('toggles start and pause', () => {
    render(<FocusApp />)
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
  })

  it('reflects a changed focus length', () => {
    render(<FocusApp />)
    fireEvent.change(screen.getByLabelText('Focus min'), { target: { value: '50' } })
    expect(screen.getByLabelText('Time remaining')).toHaveTextContent('50:00')
  })
})
