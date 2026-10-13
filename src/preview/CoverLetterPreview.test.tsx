import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CoverLetterPage, CoverLetterPreview } from './CoverLetterPreview'
import { sampleResume } from '../lib/sampleData'
import { buildCoverLetterDraft, emptyCoverLetter } from '../lib/coverLetter'
import { TEMPLATES } from '../lib/templates'
import type { CoverLetter } from '../types'

const letterWithBody = (): CoverLetter => {
  const resume = sampleResume()
  const letter = emptyCoverLetter(resume.profile)
  letter.company = 'Acme Inc.'
  letter.role = 'Frontend Engineer'
  letter.body = buildCoverLetterDraft(resume, letter)
  return letter
}

describe('CoverLetterPage', () => {
  it('renders profile, company and body paragraphs', () => {
    const ref = createRef<HTMLDivElement>()
    const resume = sampleResume()
    render(
      <CoverLetterPage
        letter={letterWithBody()}
        profile={resume.profile}
        pageRef={ref}
        theme={TEMPLATES.ats}
      />,
    )

    expect(screen.getAllByText('Jordan Avery').length).toBeGreaterThan(0)
    expect(screen.getByText('Acme Inc.')).toBeInTheDocument()
    expect(screen.getByText(/express my interest in the Frontend Engineer position/)).toBeInTheDocument()
  })
})

describe('CoverLetterPreview', () => {
  it('renders a scaled page', () => {
    const ref = createRef<HTMLDivElement>()
    const resume = sampleResume()
    const { container } = render(
      <CoverLetterPreview
        letter={letterWithBody()}
        profile={resume.profile}
        pageRef={ref}
        theme={TEMPLATES.ats}
      />,
    )
    expect(container.querySelector('.resume-page')).toBeInTheDocument()
  })
})
