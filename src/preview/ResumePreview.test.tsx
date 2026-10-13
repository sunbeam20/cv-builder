import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ResumePage, ResumePreview } from './ResumePreview'
import { sampleResume } from '../lib/sampleData'
import { emptyResume } from '../lib/helpers'
import { TEMPLATES } from '../lib/templates'
import type { Resume } from '../types'

describe('ResumePage', () => {
  it('renders the profile and section content', () => {
    const ref = createRef<HTMLDivElement>()
    render(<ResumePage resume={sampleResume()} pageRef={ref} theme={TEMPLATES.ats} />)

    expect(screen.getByText('Jordan Avery')).toBeInTheDocument()
    expect(screen.getByText('Experience')).toBeInTheDocument()
    expect(
      screen.getByText(/Led migration of a legacy dashboard/i),
    ).toBeInTheDocument()
  })

  it('falls back to placeholder name when empty', () => {
    const ref = createRef<HTMLDivElement>()
    render(<ResumePage resume={emptyResume() as Resume} pageRef={ref} theme={TEMPLATES.ats} />)
    expect(screen.getByText('Your Name')).toBeInTheDocument()
  })

  it('applies the accent color to section titles for the modern theme', () => {
    const ref = createRef<HTMLDivElement>()
    render(<ResumePage resume={sampleResume()} pageRef={ref} theme={TEMPLATES.modern} />)
    const heading = screen.getByText('Experience')
    expect(heading).toHaveStyle({ color: 'rgb(79, 70, 229)' })
  })

  it('uses a serif font and no heading rule for the elegant theme', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(
      <ResumePage resume={sampleResume()} pageRef={ref} theme={TEMPLATES.elegant} />,
    )
    const page = container.querySelector('.resume-page') as HTMLElement
    expect(page.style.fontFamily).toContain('Georgia')
    expect(screen.getByText('Experience')).not.toHaveClass('border-b')
  })
})

describe('ResumePreview', () => {
  it('renders a scaled page', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(
      <ResumePreview resume={sampleResume()} pageRef={ref} theme={TEMPLATES.ats} />,
    )
    expect(container.querySelector('.resume-page')).toBeInTheDocument()
  })

  it('shows a page indicator', () => {
    const ref = createRef<HTMLDivElement>()
    render(<ResumePreview resume={sampleResume()} pageRef={ref} theme={TEMPLATES.ats} />)
    expect(screen.getByText(/Page 1 of 1/)).toBeInTheDocument()
  })
})
