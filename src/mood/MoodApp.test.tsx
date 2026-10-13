import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MoodApp } from './MoodApp'
import { useMoodStore } from './store'

beforeEach(() => {
  localStorage.clear()
  useMoodStore.setState({ entries: [] })
})

describe('MoodApp', () => {
  it('shows an empty state', () => {
    render(<MoodApp />)
    expect(screen.getByText(/Nothing journaled yet/i)).toBeInTheDocument()
  })

  it('saves an entry with mood, tag, and gratitude', () => {
    render(<MoodApp />)
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-03-10' } })
    fireEvent.click(screen.getByRole('radio', { name: 'Great' }))
    fireEvent.click(screen.getByRole('button', { name: 'rest' }))
    fireEvent.change(screen.getByLabelText('Grateful for'), { target: { value: 'Sunshine' } })
    fireEvent.click(screen.getByRole('button', { name: /Save entry/i }))
    expect(screen.getByText('2026-03-10')).toBeInTheDocument()
    expect(screen.getByText('Sunshine')).toBeInTheDocument()
  })

  it('will not save twice for the same day', () => {
    render(<MoodApp />)
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-03-10' } })
    fireEvent.click(screen.getByRole('button', { name: /Save entry/i }))
    fireEvent.click(screen.getByRole('button', { name: /Save entry/i }))
    expect(screen.getAllByText('2026-03-10')).toHaveLength(1)
  })
})
