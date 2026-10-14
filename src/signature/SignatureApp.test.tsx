import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { SignatureApp } from './SignatureApp'

beforeEach(() => {
  localStorage.clear()
})

describe('SignatureApp', () => {
  it('renders a preview of the signature', () => {
    render(<SignatureApp />)
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
  })

  it('reflects a changed name in the preview', () => {
    render(<SignatureApp />)
    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Grace Hopper' } })
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument()
  })

  it('adds a social link', () => {
    render(<SignatureApp />)
    fireEvent.click(screen.getByRole('button', { name: /Add social/i }))
    expect(screen.getAllByLabelText('Social url')).toHaveLength(2)
  })

  it('changes the preview with the layout selector', () => {
    render(<SignatureApp />)
    fireEvent.change(screen.getByLabelText('Layout'), { target: { value: 'banner' } })
    expect(screen.getByText('Preview').parentElement?.innerHTML).toContain('background:#4f46e5')
  })

  it('shows an upload photo control', () => {
    render(<SignatureApp />)
    expect(screen.getByLabelText('Upload photo')).toBeInTheDocument()
  })
})
