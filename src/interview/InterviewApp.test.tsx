import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { InterviewApp } from './InterviewApp'
import { useInterviewStore } from './store'

beforeEach(() => {
  localStorage.clear()
  useInterviewStore.setState({ answers: [], practiced: [], notes: {} })
})

describe('InterviewApp', () => {
  it('shows the practice prompt and toggles the timer', () => {
    render(<InterviewApp />)
    expect(screen.getByText('Practice mode')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Start timer/i }))
    expect(screen.getByRole('button', { name: /Pause/i })).toBeInTheDocument()
  })

  it('builds and saves a STAR answer', () => {
    render(<InterviewApp />)
    fireEvent.click(screen.getAllByRole('button', { name: /Tell me about a time you disagreed/i })[0]!)
    fireEvent.change(screen.getByLabelText('situation'), { target: { value: 'At work' } })
    fireEvent.change(screen.getByLabelText('action'), { target: { value: 'I listened' } })
    fireEvent.click(screen.getByRole('button', { name: /Save answer/i }))
    expect(screen.getByLabelText('Delete answer')).toBeInTheDocument()
  })

  it('shows live feedback while building an answer', () => {
    render(<InterviewApp />)
    fireEvent.click(screen.getAllByRole('button', { name: /Tell me about a time you disagreed/i })[0]!)
    fireEvent.change(screen.getByLabelText('situation'), { target: { value: 'At work' } })
    expect(screen.getByLabelText('Feedback score')).toBeInTheDocument()
  })

  it('persists practice notes in the store', () => {
    render(<InterviewApp />)
    fireEvent.change(screen.getByLabelText('Practice notes'), { target: { value: 'Remember the metrics' } })
    expect(Object.values(useInterviewStore.getState().notes)).toContain('Remember the metrics')
  })

  it('updates the question list when the role pack changes', () => {
    render(<InterviewApp />)
    fireEvent.change(screen.getByLabelText('Role pack'), { target: { value: 'product' } })
    expect(screen.getByRole('button', { name: /prioritise a product roadmap/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /design a URL shortener/i })).not.toBeInTheDocument()
  })

  it('reveals STAR hints', () => {
    render(<InterviewApp />)
    fireEvent.click(screen.getByRole('button', { name: /Show hints/i }))
    expect(screen.getByRole('button', { name: /Hide hints/i })).toBeInTheDocument()
  })
})
