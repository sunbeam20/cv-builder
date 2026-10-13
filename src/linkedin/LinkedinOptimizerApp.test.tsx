import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { LinkedinOptimizerApp } from './LinkedinOptimizerApp'

describe('LinkedinOptimizerApp', () => {
  it('updates the score as the profile is filled in', () => {
    render(<LinkedinOptimizerApp />)
    expect(screen.getByLabelText('Profile score')).toHaveTextContent('0%')
    fireEvent.change(screen.getByLabelText('Headline'), {
      target: { value: 'Senior Product Designer building fintech design systems' },
    })
    expect(screen.getByLabelText('Profile score')).not.toHaveTextContent('0%')
  })

  it('suggests a headline', () => {
    render(<LinkedinOptimizerApp />)
    fireEvent.change(screen.getByLabelText('Skills'), { target: { value: 'Figma, Research, Prototyping' } })
    fireEvent.click(screen.getByRole('button', { name: /Suggest headline/i }))
    expect((screen.getByLabelText('Headline') as HTMLInputElement).value).toContain('I help teams ship')
  })
})
