import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { SplitApp } from './SplitApp'
import { useSplitStore } from './store'
import { emptyPerson } from './model'

beforeEach(() => {
  localStorage.clear()
  useSplitStore.setState({
    groupName: 'Trip',
    currency: 'USD',
    people: [emptyPerson('You'), emptyPerson('Friend')],
    expenses: [],
  })
})

describe('SplitApp', () => {
  it('adds and splits an expense', () => {
    render(<SplitApp />)
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Dinner' } })
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '40' } })
    fireEvent.click(screen.getByRole('button', { name: /Add expense/i }))
    expect(screen.getByText('Dinner')).toBeInTheDocument()
    expect(screen.queryByText('Everyone is settled up.')).not.toBeInTheDocument()
  })

  it('adds a person', () => {
    render(<SplitApp />)
    fireEvent.change(screen.getByLabelText('New person name'), { target: { value: 'Cara' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add person' }))
    expect(screen.getAllByText('Cara').length).toBeGreaterThan(0)
  })
})
