import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MedicineApp } from './MedicineApp'
import { useMedicineStore } from './store'

beforeEach(() => {
  localStorage.clear()
  useMedicineStore.setState({ medicines: [], taken: {} })
})

describe('MedicineApp', () => {
  it('shows an empty state', () => {
    render(<MedicineApp />)
    expect(screen.getByText(/No medicines yet/i)).toBeInTheDocument()
  })

  it('adds a medicine and lists its doses', () => {
    render(<MedicineApp />)
    fireEvent.change(screen.getByLabelText('Medicine name'), { target: { value: 'Vitamin D' } })
    fireEvent.change(screen.getByLabelText('Dose times'), { target: { value: '09:00' } })
    fireEvent.click(screen.getByRole('button', { name: /^Add$/i }))
    expect(screen.getByText('Vitamin D')).toBeInTheDocument()
    expect(screen.getByText(/Today’s doses/i)).toBeInTheDocument()
  })

  it('marks a dose as taken', () => {
    render(<MedicineApp />)
    fireEvent.change(screen.getByLabelText('Medicine name'), { target: { value: 'Vitamin D' } })
    fireEvent.change(screen.getByLabelText('Dose times'), { target: { value: '09:00' } })
    fireEvent.click(screen.getByRole('button', { name: /^Add$/i }))
    const dose = screen.getByRole('button', { name: /Vitamin D 09:00/ })
    fireEvent.click(dose)
    expect(dose).toHaveAttribute('aria-pressed', 'true')
  })
})
