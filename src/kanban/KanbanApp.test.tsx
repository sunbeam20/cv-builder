import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { KanbanApp } from './KanbanApp'
import { useKanbanStore } from './store'
import { emptyBoard } from './model'

beforeEach(() => {
  localStorage.clear()
  useKanbanStore.setState({ board: emptyBoard() })
})

describe('KanbanApp', () => {
  it('renders the default columns', () => {
    render(<KanbanApp />)
    expect(screen.getByDisplayValue('To do')).toBeInTheDocument()
    expect(screen.getByDisplayValue('In progress')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Done')).toBeInTheDocument()
  })

  it('adds a card through the editor', () => {
    render(<KanbanApp />)
    fireEvent.click(screen.getAllByRole('button', { name: /Add card/i })[0]!)
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Write tests' } })
    fireEvent.click(screen.getByRole('button', { name: /Save card/i }))
    expect(screen.getByText('Write tests')).toBeInTheDocument()
  })

  it('adds a new column', () => {
    render(<KanbanApp />)
    fireEvent.change(screen.getByLabelText('New column name'), { target: { value: 'Blocked' } })
    fireEvent.click(screen.getByRole('button', { name: 'Column' }))
    expect(screen.getByDisplayValue('Blocked')).toBeInTheDocument()
  })

  it('opens and edits an existing card', () => {
    render(<KanbanApp />)
    fireEvent.click(screen.getAllByRole('button', { name: /Add card/i })[0]!)
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Draft' } })
    fireEvent.click(screen.getByRole('button', { name: /Save card/i }))
    fireEvent.click(screen.getByRole('button', { name: /^Draft/ }))
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Final' } })
    fireEvent.click(screen.getByRole('button', { name: /Save card/i }))
    expect(screen.getByText('Final')).toBeInTheDocument()
  })
})
