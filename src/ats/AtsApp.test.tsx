import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { AtsApp } from './AtsApp'
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

describe('AtsApp', () => {
  it('shows an empty state before any résumé is provided', () => {
    render(<AtsApp />)
    expect(screen.getByText('Ready to scan')).toBeInTheDocument()
    expect(screen.queryByText(/ATS score/)).not.toBeInTheDocument()
  })

  it('analyses pasted résumé text', () => {
    render(<AtsApp />)
    fireEvent.change(screen.getByLabelText('Résumé text'), {
      target: { value: 'Alex Doe\nalex@doe.com\nExperience\n- Built 12 features' },
    })
    expect(screen.getByText(/ATS score/)).toBeInTheDocument()
    expect(screen.getByText('Contact & essentials')).toBeInTheDocument()
  })

  it('loads the example résumé', () => {
    render(<AtsApp />)
    fireEvent.click(screen.getByRole('button', { name: /Example/ }))
    expect(screen.getByText(/ATS score/)).toBeInTheDocument()
    expect(screen.getByText(/Excellent/)).toBeInTheDocument()
  })

  it('imports the saved CV from the CV Builder', () => {
    useResumeStore.getState().replace(sampleResume())
    render(<AtsApp />)
    fireEvent.click(screen.getByRole('button', { name: /Import from CV Builder/ }))
    const textarea = screen.getByLabelText('Résumé text') as HTMLTextAreaElement
    expect(textarea.value).toContain('Jordan Avery')
    expect(screen.getByText(/ATS score/)).toBeInTheDocument()
  })

  it('warns when there is no saved CV to import', () => {
    render(
      <>
        <AtsApp />
        <Toaster />
      </>,
    )
    fireEvent.click(screen.getByRole('button', { name: /Import from CV Builder/ }))
    expect(screen.getByText('No saved CV found')).toBeInTheDocument()
  })

  it('loads and analyses an uploaded text file', async () => {
    render(<AtsApp />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(
      ['Alex Doe\nalex@doe.com\nExperience\n- Built 12 features'],
      'cv.txt',
      { type: 'text/plain' },
    )
    fireEvent.change(input, { target: { files: [file] } })
    expect(await screen.findByText(/ATS score/)).toBeInTheDocument()
  })

  it('shows keyword matching once a job description is added', () => {
    render(<AtsApp />)
    fireEvent.click(screen.getByRole('button', { name: /Example/ }))
    fireEvent.change(screen.getByLabelText('Job description'), {
      target: { value: 'We need React, TypeScript, Kubernetes and Terraform experience.' },
    })
    expect(screen.getByText('Keyword match')).toBeInTheDocument()
    expect(screen.getByText('Missing')).toBeInTheDocument()
  })
})
