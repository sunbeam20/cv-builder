import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PortfolioViewer } from './PortfolioViewer'
import { encodePortfolio } from './share'
import { DEFAULT_SETTINGS, resumeToPortfolio } from './model'
import { sampleResume } from '../lib/sampleData'

describe('PortfolioViewer', () => {
  it('renders the shared portfolio in a full-screen iframe', () => {
    const payload = encodePortfolio(resumeToPortfolio(sampleResume()), DEFAULT_SETTINGS)
    render(<PortfolioViewer payload={payload} />)
    const frame = screen.getByTitle('Portfolio')
    expect(frame.getAttribute('srcdoc')).toContain('Jordan Avery')
    expect(frame.getAttribute('srcdoc')).toContain('OpenCharts')
  })

  it('sets the document title to the portfolio owner', () => {
    const payload = encodePortfolio(resumeToPortfolio(sampleResume()), DEFAULT_SETTINGS)
    render(<PortfolioViewer payload={payload} />)
    expect(document.title).toBe('Jordan Avery · Portfolio')
  })

  it('shows an error state for an invalid payload', () => {
    render(<PortfolioViewer payload="definitely-not-valid" />)
    expect(screen.getByText("This portfolio link couldn’t be opened")).toBeInTheDocument()
  })
})