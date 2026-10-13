import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { PortfolioApp } from './PortfolioApp'
import { Toaster } from '../components/ui/Toaster'
import { useResumeStore } from '../store/resumeStore'
import { useToastStore } from '../lib/toast'
import { emptyResume } from '../lib/helpers'
import { sampleResume } from '../lib/sampleData'
import type { Resume } from '../types'

beforeEach(() => {
  localStorage.clear()
  useToastStore.setState({ toasts: [] })
  useResumeStore.getState().replace(emptyResume() as Resume)
})

const preview = () => screen.getByTitle('Portfolio preview')

const importExample = (): void => {
  useResumeStore.getState().replace(sampleResume())
  render(<PortfolioApp />)
  fireEvent.click(screen.getByRole('button', { name: /Import from CV Builder/ }))
}

const goToDesign = (): void => {
  fireEvent.click(screen.getByRole('button', { name: 'Design' }))
}

describe('PortfolioApp', () => {
  it('renders the header and an empty state', () => {
    render(<PortfolioApp />)
    expect(screen.getByText('Portfolio Page')).toBeInTheDocument()
    expect(screen.getByText('Your page starts here')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Download HTML/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Share link/ })).toBeInTheDocument()
  })

  it('loads the example into a live preview', () => {
    render(<PortfolioApp />)
    fireEvent.click(screen.getByRole('button', { name: /Load example/ }))
    expect(preview().getAttribute('srcdoc')).toContain('Jordan Avery')
  })

  it('imports the details from the CV Builder', () => {
    importExample()
    expect(preview().getAttribute('srcdoc')).toContain('Jordan Avery')
  })

  it('warns when there is no saved CV to import', () => {
    render(
      <>
        <PortfolioApp />
        <Toaster />
      </>,
    )
    fireEvent.click(screen.getByRole('button', { name: /Import from CV Builder/ }))
    expect(screen.getByText('No saved CV found')).toBeInTheDocument()
  })

  it('applies the dark mode to the generated page', () => {
    importExample()
    goToDesign()
    fireEvent.click(screen.getByRole('button', { name: 'Dark' }))
    expect(preview().getAttribute('srcdoc')).toContain('#0b1120')
  })

  it('hides a section when toggled off', () => {
    importExample()
    goToDesign()
    expect(preview().getAttribute('srcdoc')).toContain('OpenCharts')
    fireEvent.click(screen.getByLabelText('Projects'))
    expect(preview().getAttribute('srcdoc')).not.toContain('OpenCharts')
  })

  it('edits the profile and updates the preview live', () => {
    importExample()
    const nameInput = screen.getByPlaceholderText('Your Name')
    fireEvent.change(nameInput, { target: { value: 'Sam Custom' } })
    expect(preview().getAttribute('srcdoc')).toContain('Sam Custom')
  })

  it('adds a skill from the editor', () => {
    importExample()
    fireEvent.click(screen.getByRole('button', { name: /Add skill/ }))
    const inputs = screen.getAllByPlaceholderText('TypeScript')
    fireEvent.change(inputs[inputs.length - 1], { target: { value: 'Tailwind' } })
    expect(screen.getAllByDisplayValue('Tailwind')).toHaveLength(1)
    expect(preview().getAttribute('srcdoc')).toContain('Tailwind')
  })

  it('exposes a share link with the encoded payload', () => {
    importExample()
    const field = screen.getByPlaceholderText('Add your details to get a link')
    expect((field as HTMLInputElement).value).toContain('#/p/')
  })

  it('keeps the share field empty until there is content', () => {
    render(<PortfolioApp />)
    const field = screen.getByPlaceholderText('Add your details to get a link')
    expect((field as HTMLInputElement).value).toBe('')
  })
})