import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { HeroPrompt } from './HeroPrompt'

beforeEach(() => {
  window.location.hash = '#/'
})

describe('HeroPrompt', () => {
  it('suggests tools for a plain-language query', () => {
    render(<HeroPrompt />)
    fireEvent.change(screen.getByLabelText('What do you want to do?'), {
      target: { value: 'resume' },
    })
    expect(screen.getByRole('option', { name: /CV Builder/ })).toBeInTheDocument()
  })

  it('matches a multi-word intent', () => {
    render(<HeroPrompt />)
    fireEvent.change(screen.getByLabelText('What do you want to do?'), {
      target: { value: 'split a bill' },
    })
    expect(screen.getByRole('option', { name: /Expense Splitter/ })).toBeInTheDocument()
  })

  it('opens a tool from an example chip', () => {
    render(<HeroPrompt />)
    fireEvent.click(screen.getByRole('button', { name: 'Split a bill' }))
    expect(window.location.hash).toBe('#/split-bill')
  })

  it('shows a friendly empty state', () => {
    render(<HeroPrompt />)
    fireEvent.change(screen.getByLabelText('What do you want to do?'), {
      target: { value: 'zzzzqqq' },
    })
    expect(screen.getByText(/No match/)).toBeInTheDocument()
  })
})
