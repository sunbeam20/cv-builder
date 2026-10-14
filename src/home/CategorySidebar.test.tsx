import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { CategorySidebar } from './CategorySidebar'

beforeEach(() => {
  window.location.hash = '#/'
})

describe('CategorySidebar', () => {
  it('renders a collapsed category for each group', () => {
    render(<CategorySidebar />)
    const career = screen.getByRole('button', { name: /Career & job search/ })
    expect(career).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('button', { name: /CV Builder/ })).not.toBeInTheDocument()
  })

  it('expands a category to reveal its tools', () => {
    render(<CategorySidebar />)
    fireEvent.click(screen.getByRole('button', { name: /Career & job search/ }))
    expect(screen.getByRole('button', { name: /Career & job search/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByRole('button', { name: /CV Builder/ })).toBeInTheDocument()
  })

  it('opens a tool from an expanded category', () => {
    render(<CategorySidebar />)
    fireEvent.click(screen.getByRole('button', { name: /Career & job search/ }))
    fireEvent.click(screen.getByRole('button', { name: /CV Builder/ }))
    expect(window.location.hash).toBe('#/cv-builder')
  })

  it('collapses an expanded category again', () => {
    render(<CategorySidebar />)
    const career = () => screen.getByRole('button', { name: /Career & job search/ })
    fireEvent.click(career())
    fireEvent.click(career())
    expect(career()).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('button', { name: /CV Builder/ })).not.toBeInTheDocument()
  })
})
