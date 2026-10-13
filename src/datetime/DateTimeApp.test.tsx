import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { DateTimeApp } from './DateTimeApp'

describe('DateTimeApp', () => {
  it('computes a date difference', () => {
    render(<DateTimeApp />)
    fireEvent.change(screen.getByLabelText('From date'), { target: { value: '2026-01-01' } })
    fireEvent.change(screen.getByLabelText('To date'), { target: { value: '2026-03-01' } })
    expect(screen.getByText('59')).toBeInTheDocument()
  })

  it('switches to the age calculator', () => {
    render(<DateTimeApp />)
    fireEvent.click(screen.getByRole('button', { name: 'Age' }))
    fireEvent.change(screen.getByLabelText('Date of birth'), { target: { value: '2000-01-01' } })
    expect(screen.getByText('Total days')).toBeInTheDocument()
    expect(screen.getByText('Next birthday')).toBeInTheDocument()
  })

  it('adds days to a date', () => {
    render(<DateTimeApp />)
    fireEvent.click(screen.getByRole('button', { name: 'Add / subtract' }))
    fireEvent.change(screen.getByLabelText('Starting date'), { target: { value: '2026-01-01' } })
    fireEvent.change(screen.getByLabelText('days'), { target: { value: '10' } })
    expect(screen.getByLabelText('Result date')).toHaveTextContent('2026-01-11')
  })
})
