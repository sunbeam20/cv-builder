import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { HabitApp } from './HabitApp'
import { useHabitsStore } from './store'
import { dateKey, startOfDay } from './model'

beforeEach(() => {
  localStorage.clear()
  useHabitsStore.setState({ habits: [] })
})

describe('HabitApp', () => {
  it('shows an empty state before any habits exist', () => {
    render(<HabitApp />)
    expect(screen.getByText(/Add your first habit/i)).toBeInTheDocument()
  })

  it('adds a habit and lists it', () => {
    render(<HabitApp />)
    fireEvent.change(screen.getByLabelText('Habit name'), { target: { value: 'Read' } })
    fireEvent.click(screen.getByRole('button', { name: /Add habit/i }))
    expect(screen.getByDisplayValue('Read')).toBeInTheDocument()
  })

  it('toggles today complete', () => {
    render(<HabitApp />)
    fireEvent.change(screen.getByLabelText('Habit name'), { target: { value: 'Read' } })
    fireEvent.click(screen.getByRole('button', { name: /Add habit/i }))
    const today = screen.getByRole('button', {
      name: new RegExp(`Read ${dateKey(startOfDay(new Date()))}`),
    })
    fireEvent.click(today)
    expect(today).toHaveAttribute('aria-pressed', 'true')
  })
})
