import { Scale, Plus, Star, Trash2 } from 'lucide-react'
import { ToolHeader } from '../components/ui/ToolHeader'
import { useOfferStore } from './store'
import { adjustedComp, bestOfferId, formatMoney, monthlyTake, totalComp, type Offer } from './model'

const inputClass =
  'w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-indigo-500'

const numericFields: { key: keyof Offer; label: string }[] = [
  { key: 'base', label: 'Base' },
  { key: 'bonus', label: 'Bonus' },
  { key: 'equityPerYear', label: 'Equity / yr' },
  { key: 'benefits', label: 'Benefits' },
  { key: 'costOfLiving', label: 'Cost of living index' },
]

export function OfferCompareApp() {
  const offers = useOfferStore((s) => s.offers)
  const currency = useOfferStore((s) => s.currency)
  const addOffer = useOfferStore((s) => s.addOffer)
  const updateOffer = useOfferStore((s) => s.updateOffer)
  const removeOffer = useOfferStore((s) => s.removeOffer)
  const setCurrency = useOfferStore((s) => s.setCurrency)

  const bestId = bestOfferId(offers)

  return (
    <div className="min-h-screen bg-slate-50">
      <ToolHeader icon={Scale} title="Offer Comparison" subtitle="Compare job offers on total and cost-adjusted compensation." />

      <main className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={addOffer}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            <Plus size={15} /> Add offer
          </button>
          <label className="ml-auto flex items-center gap-2 text-xs font-medium text-slate-500">
            Currency
            <select
              aria-label="Currency"
              className="rounded-md border border-slate-200 px-2 py-1.5 text-sm text-slate-600"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR'].map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                <th className="p-3 font-medium">Offer</th>
                {numericFields.map((field) => (
                  <th key={field.key} className="p-3 font-medium">
                    {field.label}
                  </th>
                ))}
                <th className="p-3 font-medium">Total</th>
                <th className="p-3 font-medium">Adjusted</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => {
                const isBest = offer.id === bestId
                return (
                  <tr key={offer.id} className={`border-b border-slate-50 ${isBest ? 'bg-indigo-50/50' : ''}`}>
                    <td className="p-3">
                      <input
                        aria-label="Company"
                        className={inputClass}
                        value={offer.company}
                        onChange={(e) => updateOffer(offer.id, { company: e.target.value })}
                      />
                      <input
                        aria-label="Role"
                        className={`${inputClass} mt-1`}
                        placeholder="Role"
                        value={offer.role}
                        onChange={(e) => updateOffer(offer.id, { role: e.target.value })}
                      />
                    </td>
                    {numericFields.map((field) => (
                      <td key={field.key} className="p-3">
                        <input
                          aria-label={`${field.label} ${offer.company}`}
                          type="number"
                          min={0}
                          className={inputClass}
                          value={offer[field.key] as number}
                          onChange={(e) => updateOffer(offer.id, { [field.key]: Number(e.target.value) || 0 })}
                        />
                      </td>
                    ))}
                    <td className="p-3 font-medium text-slate-800">
                      <span title={formatMoney(totalComp(offer), currency)}>{formatMoney(totalComp(offer), currency)}</span>
                      <span className="block text-[11px] font-normal text-slate-400">{formatMoney(monthlyTake(offer), currency)}/mo</span>
                    </td>
                    <td className="p-3">
                      <span className={`font-medium ${isBest ? 'text-indigo-600' : 'text-slate-600'}`}>
                        {formatMoney(adjustedComp(offer), currency)}
                      </span>
                      {isBest ? (
                        <span className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-indigo-600">
                          <Star size={11} /> Best
                        </span>
                      ) : null}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        aria-label={`Delete ${offer.company || 'offer'}`}
                        onClick={() => removeOffer(offer.id)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {offers.length > 1 ? (
          <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
            Best cost-adjusted offer:{' '}
            <span className="font-semibold text-slate-800">
              {offers.find((offer) => offer.id === bestId)?.company || '—'}
            </span>{' '}
            at {formatMoney(adjustedComp(offers.find((offer) => offer.id === bestId) ?? offers[0]!), currency)} adjusted.
          </p>
        ) : null}
      </main>
    </div>
  )
}

export default OfferCompareApp
