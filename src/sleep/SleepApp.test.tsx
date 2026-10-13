import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { SleepApp } from './SleepApp'
import { useSleepStore } from './store'

beforeEach(() => {
  localStorage.clear()
  useSleepStore.setState({ entries: [] })
})

describe('SleepApp', () => {
  it('prompts when there is nothing logged', () => {
    render(<SleepApp />)
    expect(screen.getByText(/No sleep logged yet/i)).toBeInTheDocument()
  })

  it('logs a night and shows the summary', () => {
    render(<SleepApp />)
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-03-10' } })
    fireEvent.click(screen.getByRole('button', { name: /Log sleep/i }))
    expect(screen.getByText('2026-03-10')).toBeInTheDocument()
    expect(screen.getByText('Avg sleep')).toBeInTheDocument()
  })

  it('rejects a duplicate date', () => {
    render(<SleepApp />)
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-03-10' } })
    fireEvent.click(screen.getByRole('button', { name: /Log sleep/i }))
    fireEvent.click(screen.getByRole('button', { name: /Log sleep/i }))
    expect(screen.getAllByText('2026-03-10')).toHaveLength(1)
  })
})
