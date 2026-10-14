import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { LogoApp } from './LogoApp'
import { useLogoStore } from './store'
import { emptyLogo } from './model'

beforeEach(() => {
  localStorage.clear()
  useLogoStore.setState({ config: emptyLogo() })
})

describe('LogoApp', () => {
  it('renders a preview of the logo', () => {
    render(<LogoApp />)
    expect(screen.getByLabelText('Logo preview').querySelector('svg')).toBeTruthy()
  })

  it('updates the preview when the brand name changes', () => {
    render(<LogoApp />)
    fireEvent.change(screen.getByLabelText('Brand name'), { target: { value: 'Zenith' } })
    expect(screen.getByLabelText('Logo preview').innerHTML).toContain('Zenith')
  })

  it('randomises styling', () => {
    render(<LogoApp />)
    fireEvent.change(screen.getByLabelText('Tagline'), { target: { value: 'Keep me' } })
    fireEvent.click(screen.getByRole('button', { name: /Randomise/i }))
    expect(screen.getByLabelText('Tagline')).toHaveValue('Keep me')
  })

  it('updates the preview when an icon is chosen', () => {
    render(<LogoApp />)
    fireEvent.click(screen.getByRole('button', { name: /Bolt icon/i }))
    expect(screen.getByLabelText('Logo preview').innerHTML).toContain('<path d=')
  })

  it('toggles the gradient in the preview', () => {
    render(<LogoApp />)
    fireEvent.click(screen.getByLabelText('Gradient'))
    expect(screen.getByLabelText('Logo preview').innerHTML).toContain('linearGradient')
  })
})
