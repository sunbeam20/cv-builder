import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ColorApp } from './ColorApp'

describe('ColorApp', () => {
  it('renders a full ramp of swatches', () => {
    render(<ColorApp />)
    expect(screen.getAllByTitle(/^#/).length).toBeGreaterThanOrEqual(11)
  })

  it('renders CSS variables for the brand ramp', () => {
    render(<ColorApp />)
    fireEvent.change(screen.getByLabelText('Base color hex'), { target: { value: '#ff0000' } })
    expect(screen.getByText(/--color-brand-500:/)).toBeInTheDocument()
  })

  it('switches to a Tailwind palette output', () => {
    render(<ColorApp />)
    fireEvent.click(screen.getByRole('button', { name: /Tailwind/i }))
    expect(screen.getByText(/brand: \{/)).toBeInTheDocument()
  })

  it('flags failing contrast', () => {
    render(<ColorApp />)
    fireEvent.change(screen.getByLabelText('Text color'), { target: { value: '#ffffff' } })
    fireEvent.change(screen.getByLabelText('Background color'), { target: { value: '#ffffff' } })
    expect(screen.getByText('1.00:1')).toBeInTheDocument()
    expect(screen.getByText('Fail')).toBeInTheDocument()
  })
})
