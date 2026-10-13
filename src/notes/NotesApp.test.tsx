import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { NotesApp } from './NotesApp'
import { useNotesStore } from './store'
import { createNote } from './model'

beforeEach(() => {
  localStorage.clear()
  useNotesStore.setState({ notes: [createNote('# Hello world')] })
})

describe('NotesApp', () => {
  it('shows a live preview of the active note', () => {
    render(<NotesApp />)
    expect(screen.getByLabelText('Preview').innerHTML).toContain('<h1>Hello world</h1>')
  })

  it('updates the preview as you type', () => {
    render(<NotesApp />)
    fireEvent.change(screen.getByLabelText('Markdown'), { target: { value: '## New heading' } })
    expect(screen.getByLabelText('Preview').innerHTML).toContain('<h2>New heading</h2>')
  })

  it('creates a new note', () => {
    render(<NotesApp />)
    fireEvent.click(screen.getByRole('button', { name: /New note/i }))
    expect(screen.getByLabelText('Markdown')).toHaveValue('# New note\n\n')
  })

  it('filters notes by search', () => {
    render(<NotesApp />)
    fireEvent.change(screen.getByLabelText('Search notes'), { target: { value: 'zzz' } })
    expect(screen.getByText(/No notes match/i)).toBeInTheDocument()
  })
})
