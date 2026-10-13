import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { EditorPanel } from './EditorPanel'
import { useResumeStore } from '../../store/resumeStore'
import { sampleResume } from '../../lib/sampleData'

describe('EditorPanel', () => {
  it('renders the section-order panel and all section forms', () => {
    useResumeStore.getState().replace(sampleResume())
    render(<EditorPanel />)

    expect(screen.getByText('Section order')).toBeInTheDocument()
    for (const title of [
      'Personal details',
      'Experience',
      'Education',
      'Skills',
      'Projects',
      'Certifications',
      'Languages',
    ]) {
      expect(screen.getAllByText(title).length).toBeGreaterThan(0)
    }
  })

  it('exposes draggable section handles when expanded', () => {
    render(<EditorPanel />)
    fireEvent.click(screen.getByText('Section order'))
    expect(screen.getByLabelText('Reorder Professional Summary')).toBeInTheDocument()
    expect(screen.getByLabelText('Reorder Experience')).toBeInTheDocument()
  })

  it('exposes draggable handles for list entries', () => {
    useResumeStore.getState().replace(sampleResume())
    render(<EditorPanel />)
    expect(screen.getByLabelText('Reorder Senior Frontend Engineer')).toBeInTheDocument()
  })

  it('exposes drag handles for links and bullet points', () => {
    useResumeStore.getState().replace(sampleResume())
    render(<EditorPanel />)
    expect(screen.getByLabelText('Reorder LinkedIn')).toBeInTheDocument()
    expect(screen.getAllByLabelText('Reorder highlight 1').length).toBeGreaterThan(0)
  })

  it('toggles a section between hidden and visible', () => {
    useResumeStore.getState().replace(sampleResume())
    render(<EditorPanel />)
    fireEvent.click(screen.getByText('Section order'))

    fireEvent.click(screen.getByLabelText('Hide Experience'))
    expect(useResumeStore.getState().resume.hiddenSections).toContain('experience')

    fireEvent.click(screen.getByLabelText('Show Experience'))
    expect(useResumeStore.getState().resume.hiddenSections).not.toContain('experience')
  })
})
