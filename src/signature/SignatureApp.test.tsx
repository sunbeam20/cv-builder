import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { SignatureApp } from './SignatureApp'

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
})
