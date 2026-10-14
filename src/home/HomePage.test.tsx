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
    expect(screen.getAllByText('CV Builder').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Live').length).toBeGreaterThan(0)
    expect(screen.getByLabelText(`${BRAND} home`)).toBeInTheDocument()
  })

  it('opens the tool shown in the hero preview', () => {
    render(<HomePage />)
    fireEvent.click(screen.getByRole('button', { name: 'Try CV Builder' }))
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

  it('renders the bento tiles with a working demo', () => {
    render(<HomePage />)
    expect(screen.getByText('Try it now')).toBeInTheDocument()
    expect(screen.getByText('By the numbers')).toBeInTheDocument()
    expect(screen.getByText('On the roadmap')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }))
    expect(screen.getByText('Copied')).toBeInTheDocument()
  })
})