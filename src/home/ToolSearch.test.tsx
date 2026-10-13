import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ToolSearch } from './ToolSearch'

beforeEach(() => {
  window.location.hash = '#/'
})

describe('ToolSearch', () => {
  it('offers live tools as quick-open when focused with no query', () => {
    render(<ToolSearch />)
    fireEvent.focus(screen.getByLabelText('Search tools'))
    expect(screen.getByText(/Quick open/)).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /CV Builder/ })).toBeInTheDocument()
  })

  it('filters tools by the query', () => {
    render(<ToolSearch />)
    const input = screen.getByLabelText('Search tools')
    fireEvent.change(input, { target: { value: 'password' } })
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(1)
    expect(options[0]).toHaveTextContent('Password Generator')
  })

  it('shows a message when nothing matches', () => {
    render(<ToolSearch />)
    fireEvent.change(screen.getByLabelText('Search tools'), { target: { value: 'zzzzqqq' } })
    expect(screen.getByText(/No tools match/)).toBeInTheDocument()
  })

  it('opens a tool on click and clears the query', () => {
    render(<ToolSearch />)
    const input = screen.getByLabelText('Search tools') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'unit' } })
    fireEvent.click(screen.getByRole('option', { name: /Unit Converter/ }))
    expect(window.location.hash).toBe('#/convert')
    expect(input.value).toBe('')
  })

  it('opens the first result on Enter', () => {
    render(<ToolSearch />)
    const input = screen.getByLabelText('Search tools')
    fireEvent.change(input, { target: { value: 'tracker' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(window.location.hash).toBe('#/job-tracker')
  })
})
