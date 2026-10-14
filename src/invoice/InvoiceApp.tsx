import { useMemo, useRef, useState } from 'react'
import { Copy, Download, FileText, ImagePlus, Printer, Save, Trash2, X } from 'lucide-react'
import { ToolHeader } from '../components/ui/ToolHeader'
import { toast } from '../lib/toast'
import { downloadBlob } from '../lib/helpers'
import { useInvoiceStore, draftFrom } from './store'
import {
  duplicateInvoice,
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
  'w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-2 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500'

const statusLabel: Record<Invoice['status'], string> = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
}

const statusBadge: Record<Invoice['status'], string> = {
  draft: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
  sent: 'bg-sky-100 text-sky-700',
  paid: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700',
}

export function InvoiceApp() {
  const invoices = useInvoiceStore((s) => s.invoices)
  const from = useInvoiceStore((s) => s.from)
  const setFrom = useInvoiceStore((s) => s.setFrom)
  const saveInvoice = useInvoiceStore((s) => s.saveInvoice)
  const removeInvoice = useInvoiceStore((s) => s.removeInvoice)
  const logoRef = useRef<HTMLInputElement>(null)

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

  const exportPdf = async () => {
    if (!invoiceValid(draft)) {
      toast.error('Add your details, a client and at least one line item')
      return
    }
    try {
      const [{ pdf }, { InvoicePdf }] = await Promise.all([import('@react-pdf/renderer'), import('./InvoicePdf')])
      const blob = await pdf(<InvoicePdf invoice={draft} totals={totals} />).toBlob()
      downloadBlob(blob, `${draft.number}.pdf`)
    } catch {
      toast.error('Could not export PDF')
    }
  }

  const onLogoSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (file.size > 1024 * 1024) {
      toast.error('Logo must be under 1MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string' && reader.result.startsWith('data:image/')) patch({ logo: reader.result })
    }
    reader.readAsDataURL(file)
  }

  const duplicate = () => {
    const numbers = [draft.number, ...invoices.map((invoice) => invoice.number)]
    setDraft(duplicateInvoice(draft, numbers))
    toast.success('Invoice duplicated')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800">
      <ToolHeader icon={FileText} title="Invoice Generator" subtitle="Create clean invoices and export them as PDF." />

      <main className="mx-auto grid max-w-5xl gap-4 px-4 py-6 lg:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
              Invoice number
              <input aria-label="Invoice number" className={inputClass} value={draft.number} onChange={(e) => patch({ number: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
              Currency
              <select
                aria-label="Currency"
                className="rounded-md border border-slate-200 dark:border-slate-700 px-2 py-2 text-sm text-slate-600 dark:text-slate-300"
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
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
              Issue date
              <input aria-label="Issue date" type="date" className={inputClass} value={draft.issueDate} onChange={(e) => patch({ issueDate: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
              Due date
              <input aria-label="Due date" type="date" className={inputClass} value={draft.dueDate} onChange={(e) => patch({ dueDate: e.target.value })} />
            </label>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
              Status
              <select
                aria-label="Status"
                className="rounded-md border border-slate-200 dark:border-slate-700 px-2 py-2 text-sm text-slate-600 dark:text-slate-300"
                value={draft.status}
                onChange={(e) => patch({ status: e.target.value as Invoice['status'] })}
              >
                {(['draft', 'sent', 'paid'] as const).map((status) => (
                  <option key={status} value={status}>
                    {statusLabel[status]}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Logo</span>
              <input ref={logoRef} aria-label="Upload logo" type="file" accept="image/*" className="hidden" onChange={onLogoSelected} />
              <div className="flex items-center gap-2">
                {draft.logo ? (
                  <>
                    <img src={draft.logo} alt="Logo preview" className="h-10 w-10 rounded-md border border-slate-200 dark:border-slate-700 object-contain" />
                    <button
                      type="button"
                      onClick={() => patch({ logo: '' })}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <X size={13} /> Remove
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => logoRef.current?.click()}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <ImagePlus size={13} /> Upload
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">From</span>
              <input aria-label="From name" className={inputClass} placeholder="Your name" value={from.name} onChange={(e) => { setFrom({ name: e.target.value }); patchParty('from', 'name', e.target.value) }} />
              <input aria-label="From email" className={inputClass} placeholder="you@example.com" value={from.email} onChange={(e) => { setFrom({ email: e.target.value }); patchParty('from', 'email', e.target.value) }} />
              <input aria-label="From address" className={inputClass} placeholder="Address" value={from.address} onChange={(e) => { setFrom({ address: e.target.value }); patchParty('from', 'address', e.target.value) }} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Bill to</span>
              <input aria-label="Client name" className={inputClass} placeholder="Client name" value={draft.to.name} onChange={(e) => patchParty('to', 'name', e.target.value)} />
              <input aria-label="Client email" className={inputClass} placeholder="client@example.com" value={draft.to.email} onChange={(e) => patchParty('to', 'email', e.target.value)} />
              <input aria-label="Client address" className={inputClass} placeholder="Address" value={draft.to.address} onChange={(e) => patchParty('to', 'address', e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Line items</span>
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
                  className="px-1 text-slate-400 dark:text-slate-500 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setDraft((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }))}
              className="self-start rounded-md border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Add line
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
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
            <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
              Notes
              <input aria-label="Notes" className={inputClass} value={draft.notes} onChange={(e) => patch({ notes: e.target.value })} />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            Payment details
            <textarea aria-label="Payment details" rows={2} className={inputClass} value={draft.paymentDetails} onChange={(e) => patch({ paymentDetails: e.target.value })} />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={save} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500">
              <Save size={15} /> Save
            </button>
            <button type="button" onClick={exportPdf} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
              <Download size={15} /> Export PDF
            </button>
            <button type="button" onClick={duplicate} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
              <Copy size={15} /> Duplicate
            </button>
            <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
              <Printer size={15} /> Print
            </button>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {draft.logo ? <img src={draft.logo} alt="Invoice logo" className="h-10 w-10 rounded-md border border-slate-200 dark:border-slate-700 object-contain" /> : null}
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Invoice</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{draft.number}</p>
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${statusBadge[draft.status]}`}>{statusLabel[draft.status]}</span>
                </div>
              </div>
              <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                <p>Issued {draft.issueDate}</p>
                <p>Due {draft.dueDate}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-medium text-slate-400 dark:text-slate-500">From</p>
                <p className="text-slate-700 dark:text-slate-200">{from.name || '—'}</p>
                <p className="text-slate-400 dark:text-slate-500">{from.email}</p>
              </div>
              <div>
                <p className="font-medium text-slate-400 dark:text-slate-500">Bill to</p>
                <p className="text-slate-700 dark:text-slate-200">{draft.to.name || '—'}</p>
                <p className="text-slate-400 dark:text-slate-500">{draft.to.email}</p>
              </div>
            </div>
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-left text-xs text-slate-400 dark:text-slate-500">
                  <th className="py-1.5 font-medium">Description</th>
                  <th className="py-1.5 text-right font-medium">Qty</th>
                  <th className="py-1.5 text-right font-medium">Price</th>
                  <th className="py-1.5 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {draft.items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-50">
                    <td className="py-1.5 text-slate-700 dark:text-slate-200">{item.description || '—'}</td>
                    <td className="py-1.5 text-right text-slate-500 dark:text-slate-400">{item.quantity}</td>
                    <td className="py-1.5 text-right text-slate-500 dark:text-slate-400">{formatMoney(item.unitPrice, draft.currency)}</td>
                    <td className="py-1.5 text-right text-slate-700 dark:text-slate-200">{formatMoney(lineTotal(item), draft.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dl className="mt-4 ml-auto w-48 text-sm">
              <div className="flex justify-between py-0.5">
                <dt className="text-slate-400 dark:text-slate-500">Subtotal</dt>
                <dd className="text-slate-700 dark:text-slate-200">{formatMoney(totals.subtotal, draft.currency)}</dd>
              </div>
              <div className="flex justify-between py-0.5">
                <dt className="text-slate-400 dark:text-slate-500">Tax ({draft.taxRate}%)</dt>
                <dd className="text-slate-700 dark:text-slate-200">{formatMoney(totals.tax, draft.currency)}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-1 text-base font-semibold">
                <dt className="text-slate-800 dark:text-slate-100">Total</dt>
                <dd className="text-slate-900 dark:text-slate-50">{formatMoney(totals.total, draft.currency)}</dd>
              </div>
            </dl>
            {draft.notes ? <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">{draft.notes}</p> : null}
            {draft.paymentDetails ? <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{draft.paymentDetails}</p> : null}
          </div>

          {invoices.length > 0 ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Saved invoices</span>
              <ul className="mt-2 flex flex-col gap-1.5">
                {invoices.map((invoice) => {
                  const record = invoiceTotals(invoice)
                  return (
                    <li key={invoice.id} className="flex items-center gap-2 text-sm">
                      <button
                        type="button"
                        onClick={() => setDraft(invoice)}
                        className="flex-1 truncate text-left text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        {invoice.number} · {invoice.to.name || 'Client'}
                      </button>
                      <span className="font-medium text-slate-800 dark:text-slate-100">{formatMoney(record.total, invoice.currency)}</span>
                      <button type="button" aria-label={`Delete ${invoice.number}`} onClick={() => removeInvoice(invoice.id)} className="text-slate-400 dark:text-slate-500 hover:text-red-500">
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