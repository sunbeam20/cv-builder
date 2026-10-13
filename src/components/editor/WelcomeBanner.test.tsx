import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { WelcomeBanner } from './WelcomeBanner'
import { useResumeStore } from '../../store/resumeStore'
import { emptyResume } from '../../lib/helpers'
import { sampleResume } from '../../lib/sampleData'
import type { Resume } from '../../types'

beforeEach(() => {
  useResumeStore.getState().replace(emptyResume() as Resume)
})

describe('WelcomeBanner', () => {
  it('shows onboarding guidance for a blank resume', () => {
    render(<WelcomeBanner />)
    expect(screen.getByText(/Build your CV in a few minutes/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Load example data/i })).toBeInTheDocument()
  })

  it('loads example data when clicked', () => {
    render(<WelcomeBanner />)
    fireEvent.click(screen.getByRole('button', { name: /Load example data/i }))
    expect(useResumeStore.getState().resume.profile.fullName).toBe(
      sampleResume().profile.fullName,
    )
  })

  it('renders nothing once the resume has content', () => {
    useResumeStore.getState().replace(sampleResume())
    const { container } = render(<WelcomeBanner />)
    expect(container).toBeEmptyDOMElement()
  })
})