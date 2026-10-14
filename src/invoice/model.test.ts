import { describe, expect, it } from 'vitest'
import { duplicateInvoice, emptyInvoice, invoiceTotals, invoiceValid, lineTotal, nextInvoiceNumber } from './model'

describe('lineTotal / invoiceTotals', () => {
  it('computes line and invoice totals with tax', () => {
    expect(lineTotal({ id: '1', description: 'x', quantity: 3, unitPrice: 25 })).toBe(75)
    const invoice = emptyInvoice()
    invoice.items = [
      { id: '1', description: 'a', quantity: 2, unitPrice: 50 },
      { id: '2', description: 'b', quantity: 1, unitPrice: 20 },
    ]
    invoice.taxRate = 10
    expect(invoiceTotals(invoice)).toEqual({ subtotal: 120, tax: 12, total: 132 })
  })
})

describe('nextInvoiceNumber', () => {
  it('increments the highest existing number for the year', () => {
    const year = new Date().getFullYear()
    expect(nextInvoiceNumber([`INV-${year}-004`, `INV-${year}-002`])).toBe(`INV-${year}-005`)
    expect(nextInvoiceNumber([])).toBe(`INV-${year}-001`)
  })
})

describe('invoiceValid', () => {
  it('requires sender, client and a described line item', () => {
    const invoice = emptyInvoice()
    expect(invoiceValid(invoice)).toBe(false)
    invoice.from.name = 'Me'
    invoice.to.name = 'Client'
    invoice.items = [{ id: '1', description: 'Work', quantity: 1, unitPrice: 100 }]
    expect(invoiceValid(invoice)).toBe(true)
  })
})

describe('emptyInvoice defaults', () => {
  it('defaults to draft with no logo and empty payment details', () => {
    const invoice = emptyInvoice()
    expect(invoice.status).toBe('draft')
    expect(invoice.logo).toBe('')
    expect(invoice.paymentDetails).toBe('')
  })
})

describe('duplicateInvoice', () => {
  it('creates a fresh id, an incremented number and new item ids', () => {
    const year = new Date().getFullYear()
    const invoice = emptyInvoice()
    invoice.items = [{ id: 'i1', description: 'a', quantity: 2, unitPrice: 50 }]
    const copy = duplicateInvoice(invoice, [`INV-${year}-002`, invoice.number])
    expect(copy.id).not.toBe(invoice.id)
    expect(copy.number).toBe(`INV-${year}-003`)
    expect(copy.items[0].id).not.toBe('i1')
  })

  it('keeps totals, note, term and tax identical to the original', () => {
    const invoice = emptyInvoice()
    invoice.items = [
      { id: 'i1', description: 'a', quantity: 2, unitPrice: 50 },
      { id: 'i2', description: 'b', quantity: 1, unitPrice: 20 },
    ]
    invoice.taxRate = 10
    invoice.status = 'sent'
    invoice.paymentDetails = 'IBAN 123'
    const copy = duplicateInvoice(invoice, [invoice.number])
    expect(invoiceTotals(copy)).toEqual(invoiceTotals(invoice))
    expect(copy.status).toBe('sent')
    expect(copy.paymentDetails).toBe('IBAN 123')
    expect(copy.notes).toBe(invoice.notes)
  })
})
