import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { emptyInvoice, emptyParty, nextInvoiceNumber, type Invoice, type Party } from './model'

export const STORAGE_KEY = 'invoice-generator-v1'

interface InvoiceState {
  invoices: Invoice[]
  from: Party
  setFrom: (patch: Partial<Party>) => void
  saveInvoice: (invoice: Invoice) => void
  removeInvoice: (id: string) => void
}

export const useInvoiceStore = create<InvoiceState>()(
  persist(
    immer((set) => ({
      invoices: [],
      from: emptyParty(),

      setFrom: (patch) =>
        set((state) => {
          Object.assign(state.from, patch)
        }),

      saveInvoice: (invoice) =>
        set((state) => {
          const index = state.invoices.findIndex((item) => item.id === invoice.id)
          if (index === -1) state.invoices.unshift(invoice)
          else state.invoices[index] = invoice
        }),

      removeInvoice: (id) =>
        set((state) => {
          const index = state.invoices.findIndex((item) => item.id === id)
          if (index !== -1) state.invoices.splice(index, 1)
        }),
    })),
    { name: STORAGE_KEY, storage: createJSONStorage(() => localStorage), version: 2,
      migrate: (persisted) => {
        const state = persisted as { invoices?: Partial<Invoice>[] | undefined; from?: Partial<Party> | undefined }
        return {
          invoices: (state?.invoices ?? []).map((invoice) => ({ ...emptyInvoice(), ...invoice })),
          from: { ...emptyParty(), ...state?.from },
        }
      } },
  ),
)

export const draftFrom = (from: Party, numbers: string[]): Invoice => {
  const invoice = emptyInvoice(nextInvoiceNumber(numbers))
  invoice.from = { ...from }
  return invoice
}
