import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { DiffApp } from './DiffApp'

describe('DiffApp', () => {
  it('prompts for input when both boxes are empty', () => {
    render(<DiffApp />)
    expect(screen.getByText(/Paste text into both boxes/)).toBeInTheDocument()
  })

  it('says the texts are identical when equal', () => {
    render(<DiffApp />)
    fireEvent.change(screen.getByLabelText('Original text'), { target: { value: 'same' } })
    fireEvent.change(screen.getByLabelText('Changed text'), { target: { value: 'same' } })
    expect(screen.getByText(/texts are identical/i)).toBeInTheDocument()
  })

  it('reports added and removed line counts', () => {
    render(<DiffApp />)
    fireEvent.change(screen.getByLabelText('Original text'), { target: { value: 'a\nb' } })
    fireEvent.change(screen.getByLabelText('Changed text'), { target: { value: 'a\nc' } })
    expect(screen.getByText('+1')).toBeInTheDocument()
    expect(screen.getByText('\u22121')).toBeInTheDocument()
  })

  it('switches to the word-level view', () => {
    render(<DiffApp />)
    fireEvent.change(screen.getByLabelText('Original text'), { target: { value: 'foo bar' } })
    fireEvent.change(screen.getByLabelText('Changed text'), { target: { value: 'foo baz' } })
    fireEvent.click(screen.getByRole('button', { name: 'words' }))
    expect(screen.getAllByText(/baz/).length).toBeGreaterThan(0)
  })
})
