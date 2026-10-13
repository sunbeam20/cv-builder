import { describe, expect, it, beforeEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { HomePage } from './HomePage'
import { BRAND } from './config'

describe('HomePage', () => {
  beforeEach(() => {
    window.location.hash = '#/'
  })

  it('renders the brand, hero, and tool cards', () => {
    render(<HomePage />)
    expect(screen.getAllByText(BRAND).length).toBeGreaterThan(0)
    expect(screen.getByText('CV Builder')).toBeInTheDocument()
    expect(screen.getAllByText('Coming soon').length).toBeGreaterThan(1)
    expect(screen.getByLabelText(`${BRAND} home`)).toBeInTheDocument()
  })

  it('navigates to the app when opening the CV Builder', () => {
    render(<HomePage />)
    const ctas = screen.getAllByRole('button', { name: 'Open CV Builder' })
    expect(ctas.length).toBeGreaterThan(1)
    fireEvent.click(ctas[0])
    expect(window.location.hash).toBe('#/cv-builder')
  })

  it('launches the tool from its card', () => {
    render(<HomePage />)
    fireEvent.click(screen.getByText('Launch CV Builder'))
    expect(window.location.hash).toBe('#/cv-builder')
  })

  it('shows the privacy banner', () => {
    render(<HomePage />)
    expect(screen.getByText('Your data never leaves your browser')).toBeInTheDocument()
  })
})