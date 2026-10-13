import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { CoverLetterApp } from './CoverLetterApp'
import { useCoverStore } from './store'
import { emptyLetter } from './model'

beforeEach(() => {
  localStorage.clear()
  useCoverStore.setState({ letters: [emptyLetter()] })
})

describe('CoverLetterApp', () => {
  it('renders a letter preview', () => {
    render(<CoverLetterApp />)
    expect(screen.getByText(/Dear Hiring Manager,/)).toBeInTheDocument()
  })

  it('reflects the job title in the preview', () => {
    render(<CoverLetterApp />)
    fireEvent.change(screen.getByLabelText('Job title'), { target: { value: 'Frontend Engineer' } })
    expect(screen.getAllByText(/Frontend Engineer/).length).toBeGreaterThan(0)
  })

  it('applies a tone snippet to the opening', () => {
    render(<CoverLetterApp />)
    fireEvent.change(screen.getByLabelText('Company'), { target: { value: 'Acme' } })
    fireEvent.click(screen.getByRole('button', { name: 'Direct' }))
    expect(screen.getByLabelText('Opening')).toHaveValue(
      "I'm applying for the {jobTitle} role at {company}. Here's why I think I'm a strong fit.",
    )
  })
})
