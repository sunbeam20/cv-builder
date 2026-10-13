import { useMemo, useState } from 'react'
import { FileText, Printer, Save, Trash2 } from 'lucide-react'
import { ToolHeader } from '../components/ui/ToolHeader'
import { toast } from '../lib/toast'
import { useInvoiceStore, draftFrom } from './store'
import {
  emptyItem,
  formatMoney,
  invoiceTotals,
  invoiceValid,
  lineTotal,
  type Invoice,
  type LineItem,
  type Party,
} from './model'

const inputClass =
  'w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500'

export function InvoiceApp() {
  const invoices = useInvoiceStore((s) => s.invoices)
  const from = useInvoiceStore((s) => s.from)
  const setFrom = useInvoiceStore((s) => s.setFrom)
  const saveInvoice = useInvoiceStore((s) => s.saveInvoice)
  const removeInvoice = useInvoiceStore((s) => s.removeInvoice)

  const [draft, setDraft] = useState<Invoice>(() => draftFrom(from, []))
  const totals = useMemo(() => invoiceTotals(draft), [draft])

  const patch = (updater: Partial<Invoice>) => setDraft((prev) => ({ ...prev, ...updater }))
  const patchParty = (which: 'from' | 'to', field: keyof Party, value: string) =>
    setDraft((prev) => ({ ...prev, [which]: { ...prev[which], [field]: value } }))
  const patchItem = (id: string, updater: Partial<LineItem>) =>
    setDraft((prev) => ({ ...prev, items: prev.items.map((item) => (item.id === id ? { ...item, ...updater } : item)) }))

  const save = () => {
    if (!invoiceValid(draft)) {
      toast.error('Add your details, a client and at least one line item')
      return
    }
    const invoice = { ...draft, from: { ...from } }
    saveInvoice(invoice)
    toast.success('Invoice saved')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ToolHeader icon={FileText} title="Invoice Generator" subtitle="Create clean invoices and print them to PDF." />

      <main className="mx-auto grid max-w-5xl gap-4 px-4 py-6 lg:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
              Invoice number
              <input aria-label="Invoice number" className={inputClass} value={draft.number} onChange={(e) => patch({ number: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
              Currency
              <select
                aria-label="Currency"
                className="rounded-md border border-slate-200 px-2 py-2 text-sm text-slate-600"
                value={draft.currency}
                onChange={(e) => patch({ currency: e.target.value })}
              >
                {['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR'].map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
              Issue date
              <input aria-label="Issue date" type="date" className={inputClass} value={draft.issueDate} onChange={(e) => patch({ issueDate: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
              Due date
              <input aria-label="Due date" type="date" className={inputClass} value={draft.dueDate} onChange={(e) => patch({ dueDate: e.target.value })} />
            </label>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-400">From</span>
              <input aria-label="From name" className={inputClass} placeholder="Your name" value={from.name} onChange={(e) => { setFrom({ name: e.target.value }); patchParty('from', 'name', e.target.value) }} />
              <input aria-label="From email" className={inputClass} placeholder="you@example.com" value={from.email} onChange={(e) => { setFrom({ email: e.target.value }); patchParty('from', 'email', e.target.value) }} />
              <input aria-label="From address" className={inputClass} placeholder="Address" value={from.address} onChange={(e) => { setFrom({ address: e.target.value }); patchParty('from', 'address', e.target.value) }} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-400">Bill to</span>
              <input aria-label="Client name" className={inputClass} placeholder="Client name" value={draft.to.name} onChange={(e) => patchParty('to', 'name', e.target.value)} />
              <input aria-label="Client email" className={inputClass} placeholder="client@example.com" value={draft.to.email} onChange={(e) => patchParty('to', 'email', e.target.value)} />
              <input aria-label="Client address" className={inputClass} placeholder="Address" value={draft.to.address} onChange={(e) => patchParty('to', 'address', e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-400">Line items</span>
            {draft.items.map((item) => (
              <div key={item.id} className="flex gap-1.5">
                <input
                  aria-label="Item description"
                  className={inputClass}
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => patchItem(item.id, { description: e.target.value })}
                />
                <input
                  aria-label="Item quantity"
                  type="number"
                  min={0}
                  className={`${inputClass} w-16`}
                  value={item.quantity}
                  onChange={(e) => patchItem(item.id, { quantity: Number(e.target.value) || 0 })}
                />
                <input
                  aria-label="Item unit price"
                  type="number"
                  min={0}
                  className={`${inputClass} w-24`}
                  value={item.unitPrice}
                  onChange={(e) => patchItem(item.id, { unitPrice: Number(e.target.value) || 0 })}
                />
                <button
                  type="button"
                  aria-label="Remove item"
                  onClick={() => setDraft((prev) => ({ ...prev, items: prev.items.filter((entry) => entry.id !== item.id) }))}
                  className="px-1 text-slate-400 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setDraft((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }))}
              className="self-start rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50"
            >
              Add line
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
              Tax %
              <input
                aria-label="Tax rate"
                type="number"
                min={0}
                className={`${inputClass} w-20`}
                value={draft.taxRate}
                onChange={(e) => patch({ taxRate: Number(e.target.value) || 0 })}
              />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-slate-600">
              Notes
              <input aria-label="Notes" className={inputClass} value={draft.notes} onChange={(e) => patch({ notes: e.target.value })} />
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={save} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500">
              <Save size={15} /> Save
            </button>
            <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              <Printer size={15} /> Print / PDF
            </button>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Invoice</h2>
                <p className="text-xs text-slate-400">{draft.number}</p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <p>Issued {draft.issueDate}</p>
                <p>Due {draft.dueDate}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-medium text-slate-400">From</p>
                <p className="text-slate-700">{from.name || '—'}</p>
                <p className="text-slate-400">{from.email}</p>
              </div>
              <div>
                <p className="font-medium text-slate-400">Bill to</p>
                <p className="text-slate-700">{draft.to.name || '—'}</p>
                <p className="text-slate-400">{draft.to.email}</p>
              </div>
            </div>
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                  <th className="py-1.5 font-medium">Description</th>
                  <th className="py-1.5 text-right font-medium">Qty</th>
                  <th className="py-1.5 text-right font-medium">Price</th>
                  <th className="py-1.5 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {draft.items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-50">
                    <td className="py-1.5 text-slate-700">{item.description || '—'}</td>
                    <td className="py-1.5 text-right text-slate-500">{item.quantity}</td>
                    <td className="py-1.5 text-right text-slate-500">{formatMoney(item.unitPrice, draft.currency)}</td>
                    <td className="py-1.5 text-right text-slate-700">{formatMoney(lineTotal(item), draft.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dl className="mt-4 ml-auto w-48 text-sm">
              <div className="flex justify-between py-0.5">
                <dt className="text-slate-400">Subtotal</dt>
                <dd className="text-slate-700">{formatMoney(totals.subtotal, draft.currency)}</dd>
              </div>
              <div className="flex justify-between py-0.5">
                <dt className="text-slate-400">Tax ({draft.taxRate}%)</dt>
                <dd className="text-slate-700">{formatMoney(totals.tax, draft.currency)}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-1 text-base font-semibold">
                <dt className="text-slate-800">Total</dt>
                <dd className="text-slate-900">{formatMoney(totals.total, draft.currency)}</dd>
              </div>
            </dl>
            {draft.notes ? <p className="mt-4 text-xs text-slate-400">{draft.notes}</p> : null}
          </div>

          {invoices.length > 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="text-xs font-medium text-slate-400">Saved invoices</span>
              <ul className="mt-2 flex flex-col gap-1.5">
                {invoices.map((invoice) => {
                  const record = invoiceTotals(invoice)
                  return (
                    <li key={invoice.id} className="flex items-center gap-2 text-sm">
                      <button
                        type="button"
                        onClick={() => setDraft(invoice)}
                        className="flex-1 truncate text-left text-slate-700 hover:text-indigo-600"
                      >
                        {invoice.number} · {invoice.to.name || 'Client'}
                      </button>
                      <span className="font-medium text-slate-800">{formatMoney(record.total, invoice.currency)}</span>
                      <button type="button" aria-label={`Delete ${invoice.number}`} onClick={() => removeInvoice(invoice.id)} className="text-slate-400 hover:text-red-500">
                        <Trash2 size={13} />
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  )
}

export default InvoiceApp
