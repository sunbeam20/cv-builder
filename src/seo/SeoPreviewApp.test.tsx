import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { SeoPreviewApp } from './SeoPreviewApp'

describe('SeoPreviewApp', () => {
  it('shows warnings for empty input', () => {
    render(<SeoPreviewApp />)
    expect(screen.getByText(/Add a page title/i)).toBeInTheDocument()
  })

  it('reflects the title in the Google preview', () => {
    render(<SeoPreviewApp />)
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'My great page' } })
    expect(screen.getAllByText('My great page').length).toBeGreaterThan(0)
  })

  it('clears warnings once the page is well formed', () => {
    render(<SeoPreviewApp />)
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'A clear, descriptive page title for search' } })
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'x'.repeat(150) } })
    fireEvent.change(screen.getByLabelText('URL'), { target: { value: 'https://example.com' } })
    fireEvent.change(screen.getByLabelText('Image alt text'), { target: { value: 'Dashboard screenshot' } })
    expect(screen.getByText(/no issues found/i)).toBeInTheDocument()
  })
})
