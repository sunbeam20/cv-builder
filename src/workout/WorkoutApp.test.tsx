import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { WorkoutApp } from './WorkoutApp'
import { useWorkoutStore } from './store'

beforeEach(() => {
  localStorage.clear()
  useWorkoutStore.setState({ workouts: [] })
})

describe('WorkoutApp', () => {
  it('prompts when empty and requires an exercise', () => {
    render(<WorkoutApp />)
    expect(screen.getByText(/No workouts yet/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Save workout/i }))
    expect(screen.getByText(/No workouts yet/i)).toBeInTheDocument()
  })

  it('loads a template and saves a workout', () => {
    render(<WorkoutApp />)
    fireEvent.click(screen.getByRole('button', { name: 'Push' }))
    expect(screen.getAllByLabelText('Exercise name')).toHaveLength(4)
    fireEvent.click(screen.getByRole('button', { name: /Save workout/i }))
    expect(screen.getByText(/Avg volume/i)).toBeInTheDocument()
  })

  it('adds a custom exercise', () => {
    render(<WorkoutApp />)
    fireEvent.change(screen.getByLabelText('Add exercise'), { target: { value: 'Pull-up' } })
    fireEvent.click(screen.getByRole('button', { name: /Exercise/i }))
    expect(screen.getByDisplayValue('Pull-up')).toBeInTheDocument()
  })
})
