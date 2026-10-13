import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ToolMenu } from './ToolMenu'

beforeEach(() => {
  window.location.hash = '#/'
})

describe('ToolMenu', () => {
  it('lists tools grouped by category when opened', () => {
    render(<ToolMenu />)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Tools/ }))
    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByText('Career & job search')).toBeInTheDocument()
    expect(screen.getByText('Utilities & privacy')).toBeInTheDocument()
  })

  it('opens a tool and closes the menu', () => {
    render(<ToolMenu />)
    fireEvent.click(screen.getByRole('button', { name: /Tools/ }))
    fireEvent.click(screen.getByRole('menuitem', { name: /Job Tracker/ }))
    expect(window.location.hash).toBe('#/job-tracker')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
