import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
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

  it('clears warnings once the page is well formed', async () => {
    render(<SeoPreviewApp />)
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'A clear, descriptive page title for search' } })
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'x'.repeat(150) } })
    fireEvent.change(screen.getByLabelText('URL'), { target: { value: 'https://example.com' } })
    fireEvent.change(screen.getByLabelText('Image alt text'), { target: { value: 'Dashboard screenshot' } })
    const file = new File(['x'], 'x.png', { type: 'image/png' })
    fireEvent.change(screen.getByLabelText('Upload OG image'), { target: { files: [file] } })
    await waitFor(() => expect(screen.getByText(/no issues found/i)).toBeInTheDocument())
  })

  it('shows the social image preview after uploading one', async () => {
    render(<SeoPreviewApp />)
    const file = new File(['x'], 'x.png', { type: 'image/png' })
    fireEvent.change(screen.getByLabelText('Upload OG image'), { target: { files: [file] } })
    await waitFor(() => {
      expect(screen.getAllByAltText('Social share image').length).toBeGreaterThan(0)
    })
  })
})
