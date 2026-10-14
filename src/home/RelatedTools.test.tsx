import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { RelatedTools } from './RelatedTools'
import { TOOL_BY_SLUG } from './tools'

beforeEach(() => {
  window.location.hash = '#/'
})

describe('RelatedTools', () => {
  it('shows a related-tools region excluding the current tool', () => {
    const cv = TOOL_BY_SLUG.get('cv')
    expect(cv).toBeDefined()
    render(<RelatedTools tool={cv!} />)
    expect(screen.getByRole('region', { name: 'Related tools' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /CV Builder/ })).not.toBeInTheDocument()
  })

  it('opens a related tool on click', () => {
    render(<RelatedTools tool={TOOL_BY_SLUG.get('cv')!} />)
    fireEvent.click(screen.getByRole('button', { name: /ATS Scanner/ }))
    expect(window.location.hash).toBe('#/ats-scanner')
  })
})
