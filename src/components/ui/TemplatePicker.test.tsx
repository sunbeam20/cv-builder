import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { TemplatePicker } from './TemplatePicker'
import { useResumeStore } from '../../store/resumeStore'

beforeEach(() => {
  useResumeStore.getState().setTemplate('ats')
})

describe('TemplatePicker', () => {
  it('shows the current template name', () => {
    render(<TemplatePicker />)
    expect(screen.getByLabelText('Template')).toHaveTextContent('ATS Classic')
  })

  it('opens the list and applies a template', () => {
    render(<TemplatePicker />)
    expect(screen.queryByRole('option')).not.toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Template'))
    fireEvent.click(screen.getByRole('option', { name: /Modern Accent/ }))

    expect(useResumeStore.getState().template).toBe('modern')
    expect(screen.queryByRole('option')).not.toBeInTheDocument()
  })

  it('renders an option for every template', () => {
    render(<TemplatePicker />)
    fireEvent.click(screen.getByLabelText('Template'))
    expect(screen.getAllByRole('option')).toHaveLength(6)
  })
})
