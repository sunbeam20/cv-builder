import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { BannerApp } from './BannerApp'
import { Toaster } from '../components/ui/Toaster'
import { useResumeStore } from '../store/resumeStore'
import { useToastStore } from '../lib/toast'
import { emptyResume } from '../lib/helpers'
import { sampleResume } from '../lib/sampleData'
import type { Resume } from '../types'

beforeEach(() => {
  localStorage.clear()
  useToastStore.setState({ toasts: [] })
  useResumeStore.getState().replace(emptyResume() as Resume)
})

describe('BannerApp', () => {
  it('renders the header, canvas controls and a preview', () => {
    render(<BannerApp />)
    expect(screen.getByText('Banner Maker')).toBeInTheDocument()
    expect(screen.getByText(/Preview · 1584×396px/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Download PNG/ })).toBeInTheDocument()
  })

  it('updates the preview when the title changes', () => {
    render(<BannerApp />)
    const title = screen.getByDisplayValue('Your Name')
    fireEvent.change(title, { target: { value: 'Ada Lovelace' } })
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
  })

  it('changes canvas dimensions with a preset', () => {
    render(<BannerApp />)
    fireEvent.change(screen.getByRole('combobox', { name: 'Preset size' }), {
      target: { value: 'x' },
    })
    expect(screen.getByText(/Preview · 1500×500px/)).toBeInTheDocument()
  })

  it('imports the name and headline from the CV Builder', () => {
    useResumeStore.getState().replace(sampleResume())
    render(<BannerApp />)
    fireEvent.click(screen.getByRole('button', { name: /Import name/ }))
    expect(screen.getByDisplayValue('Jordan Avery')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Senior Frontend Engineer')).toBeInTheDocument()
  })

  it('warns when there is no saved CV to import', () => {
    render(
      <>
        <BannerApp />
        <Toaster />
      </>,
    )
    fireEvent.click(screen.getByRole('button', { name: /Import name/ }))
    expect(screen.getByText('No saved CV found')).toBeInTheDocument()
  })

  it('confirms before resetting the design', () => {
    render(
      <>
        <BannerApp />
        <Toaster />
      </>,
    )
    fireEvent.change(screen.getByDisplayValue('Your Name'), { target: { value: 'Temp' } })
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.getByText('Reset the banner?')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Reset banner' }))
    expect(screen.getByDisplayValue('Your Name')).toBeInTheDocument()
  })
})
