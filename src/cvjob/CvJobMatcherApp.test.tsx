import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { CvJobMatcherApp } from './CvJobMatcherApp'
import { useMatcherStore } from './store'
import { useResumeStore } from '../store/resumeStore'

beforeEach(() => {
  localStorage.clear()
  useMatcherStore.setState({ jobDescription: '', history: [] })
  useResumeStore.getState().reset()
})

describe('CvJobMatcherApp', () => {
  it('analyses a job description', () => {
    render(<CvJobMatcherApp />)
    fireEvent.change(screen.getByLabelText('Job description'), {
      target: { value: 'We need react typescript graphql experience' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Analyse match/i }))
    expect(screen.getByLabelText('Match score')).toBeInTheDocument()
  })

  it('saves an analysis to history', () => {
    render(<CvJobMatcherApp />)
    fireEvent.change(screen.getByLabelText('Job description'), { target: { value: 'react typescript' } })
    fireEvent.click(screen.getByRole('button', { name: /Analyse match/i }))
    fireEvent.change(screen.getByLabelText('Analysis label'), { target: { value: 'Acme role' } })
    fireEvent.click(screen.getByRole('button', { name: /Save/i }))
    expect(screen.getByText('Acme role')).toBeInTheDocument()
  })
})
