import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { InvoiceApp } from './InvoiceApp'
import { useInvoiceStore } from './store'
import { emptyParty } from './model'

beforeEach(() => {
  localStorage.clear()
  useInvoiceStore.setState({ invoices: [], from: emptyParty() })
})

describe('InvoiceApp', () => {
  it('calculates the total from line items', () => {
    render(<InvoiceApp />)
    fireEvent.change(screen.getByLabelText('Item description'), { target: { value: 'Consulting' } })
    fireEvent.change(screen.getByLabelText('Item quantity'), { target: { value: '2' } })
    fireEvent.change(screen.getByLabelText('Item unit price'), { target: { value: '100' } })
    expect(screen.getAllByText('$200.00').length).toBeGreaterThan(0)
  })

  it('adds a line item', () => {
    render(<InvoiceApp />)
    fireEvent.click(screen.getByRole('button', { name: /Add line/i }))
    expect(screen.getAllByLabelText('Item description')).toHaveLength(2)
  })

  it('refuses to save an incomplete invoice', () => {
    render(<InvoiceApp />)
    fireEvent.click(screen.getByRole('button', { name: /^Save$/i }))
    expect(useInvoiceStore.getState().invoices).toHaveLength(0)
  })
})
