export interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

export interface Party {
  name: string
  email: string
  address: string
}

export interface Invoice {
  id: string
  number: string
  issueDate: string
  dueDate: string
  currency: string
  from: Party
  to: Party
  items: LineItem[]
  taxRate: number
  notes: string
  logo: string
  status: 'draft' | 'sent' | 'paid'
  paymentDetails: string
}

export interface Totals {
  subtotal: number
  tax: number
  total: number
}

export const uid = (): string => Math.random().toString(36).slice(2, 11)

export const emptyParty = (): Party => ({ name: '', email: '', address: '' })

export const emptyItem = (): LineItem => ({ id: uid(), description: '', quantity: 1, unitPrice: 0 })

const today = (): string => new Date().toISOString().slice(0, 10)

const plusDays = (days: number): string => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export const nextInvoiceNumber = (existing: string[] = []): string => {
  const year = new Date().getFullYear()
  const prefix = `INV-${year}-`
  const highest = existing
    .filter((value) => value.startsWith(prefix))
    .map((value) => Number.parseInt(value.slice(prefix.length), 10))
    .filter((value) => !Number.isNaN(value))
    .reduce((max, value) => Math.max(max, value), 0)
  return `${prefix}${String(highest + 1).padStart(3, '0')}`
}

export const emptyInvoice = (number = nextInvoiceNumber()): Invoice => ({
  id: uid(),
  number,
  issueDate: today(),
  dueDate: plusDays(14),
  currency: 'USD',
  from: emptyParty(),
  to: emptyParty(),
  items: [emptyItem()],
  taxRate: 0,
  notes: 'Thank you for your business.',
  logo: '',
  status: 'draft',
  paymentDetails: '',
})

export const duplicateInvoice = (invoice: Invoice, numbers: string[]): Invoice => ({
  ...invoice,
  id: uid(),
  number: nextInvoiceNumber(numbers),
  items: invoice.items.map((item) => ({ ...item, id: uid() })),
})

export const lineTotal = (item: LineItem): number => round(item.quantity * item.unitPrice)

export function invoiceTotals(invoice: Invoice): Totals {
  const subtotal = round(invoice.items.reduce((sum, item) => sum + lineTotal(item), 0))
  const tax = round((subtotal * invoice.taxRate) / 100)
  return { subtotal, tax, total: round(subtotal + tax) }
}

const round = (value: number): number => Math.round((Number.isFinite(value) ? value : 0) * 100) / 100

export const formatMoney = (value: number, currency: string): string => {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value)
  } catch {
    return `${value.toFixed(2)} ${currency}`
  }
}

export const invoiceValid = (invoice: Invoice): boolean =>
  invoice.from.name.trim().length > 0 &&
  invoice.to.name.trim().length > 0 &&
  invoice.items.some((item) => item.description.trim() && item.quantity > 0)
