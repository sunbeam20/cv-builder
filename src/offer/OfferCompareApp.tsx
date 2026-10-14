import { Scale, Plus, Star, Trash2, TrendingUp } from 'lucide-react'
import { ToolHeader } from '../components/ui/ToolHeader'
import { useOfferStore } from './store'
import {
  adjustedComp,
  bestOfferId,
  effectiveTotal,
  formatCompact,
  formatMoney,
  monthlyTake,
  projectedComp,
  totalComp,
  type Offer,
} from './model'

const inputClass =
  'w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500'

const numericFields: { key: keyof Offer; label: string; max?: number }[] = [
  { key: 'base', label: 'Base' },
  { key: 'targetBonusPct', label: 'Target bonus %', max: 100 },
  { key: 'signOn', label: 'Sign-on' },
  { key: 'equityTotal', label: 'Equity total' },
  { key: 'vestingYears', label: 'Vesting years' },
  { key: 'cliffYears', label: 'Cliff years' },
  { key: 'taxRate', label: 'Tax %', max: 100 },
  { key: 'costOfLiving', label: 'Cost of living index' },
  { key: 'remoteDays', label: 'Remote days' },
]

const CHART_YEARS = 4
const CHART_HEIGHT = 84
const CHART_BAR_MAX = 52
const CHART_BASE_Y = 56

function ProjectionChart({ offer, currency }: { offer: Offer; currency: string }) {
  const values = projectedComp(offer, CHART_YEARS)
  const max = Math.max(...values, 1)
  const gap = 46
  const barWidth = 34
  const chartWidth = values.length * gap
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
      <div className="flex items-baseline justify-between gap-2">
        <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">{offer.company || 'Offer'}</p>
        <p className="shrink-0 text-[11px] text-slate-400 dark:text-slate-500">{formatMoney(projectedComp(offer, CHART_YEARS)[0], currency)} first year</p>
      </div>
      <svg
        viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}
        className="mt-3 w-full"
        role="img"
        aria-label={`4-year projection for ${offer.company || 'offer'}`}
      >
        {values.map((value, index) => {
          const barHeight = Math.max((value / max) * CHART_BAR_MAX, 2)
          const x = index * gap + (gap - barWidth) / 2
          const y = CHART_BASE_Y - barHeight
          return (
            <g key={index}>
              <rect x={x} y={y} width={barWidth} height={barHeight} rx={3} className="fill-indigo-500" />
              <text x={x + barWidth / 2} y={y - 4} textAnchor="middle" className="fill-slate-500 text-[10px]">
                {formatCompact(value)}
              </text>
              <text x={x + barWidth / 2} y={CHART_HEIGHT - 8} textAnchor="middle" className="fill-slate-400 text-[10px]">
                {index + 1}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export function OfferCompareApp() {
  const offers = useOfferStore((s) => s.offers)
  const currency = useOfferStore((s) => s.currency)
  const addOffer = useOfferStore((s) => s.addOffer)
  const updateOffer = useOfferStore((s) => s.updateOffer)
  const removeOffer = useOfferStore((s) => s.removeOffer)
  const setCurrency = useOfferStore((s) => s.setCurrency)

  const bestId = bestOfferId(offers)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800">
      <ToolHeader icon={Scale} title="Offer Comparison" subtitle="Compare job offers on total, after-tax and cost-adjusted compensation." />

      <main className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={addOffer}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            <Plus size={15} /> Add offer
          </button>
          <label className="ml-auto flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            Currency
            <select
              aria-label="Currency"
              className="rounded-md border border-slate-200 dark:border-slate-700 px-2 py-1.5 text-sm text-slate-600 dark:text-slate-300"
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

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full min-w-[1100px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-left text-xs text-slate-400 dark:text-slate-500">
                <th className="p-3 font-medium">Offer</th>
                {numericFields.map((field) => (
                  <th key={field.key} className="p-3 font-medium">
                    {field.label}
                  </th>
                ))}
                <th className="p-3 font-medium">Total</th>
                <th className="p-3 font-medium">After-tax</th>
                <th className="p-3 font-medium">Cost-adjusted</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => {
                const isBest = offer.id === bestId
                return (
                  <tr key={offer.id} className={`border-b border-slate-50 ${isBest ? 'bg-indigo-50/50 dark:bg-indigo-950/50' : ''}`}>
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
                      {offer.remoteDays > 0 ? (
                        <span className="mt-1 block text-[11px] text-slate-400 dark:text-slate-500">{offer.remoteDays} remote days / yr</span>
                      ) : null}
                    </td>
                    {numericFields.map((field) => (
                      <td key={field.key} className="p-3">
                        <input
                          aria-label={`${field.label} ${offer.company}`}
                          type="number"
                          min={0}
                          max={field.max}
                          className={inputClass}
                          value={offer[field.key] as number}
                          onChange={(e) => updateOffer(offer.id, { [field.key]: Number(e.target.value) || 0 })}
                        />
                      </td>
                    ))}
                    <td className="p-3 font-medium text-slate-800 dark:text-slate-100">
                      <span title={formatMoney(totalComp(offer), currency)}>{formatMoney(totalComp(offer), currency)}</span>
                      <span className="block text-[11px] font-normal text-slate-400 dark:text-slate-500">{formatMoney(monthlyTake(offer), currency)}/mo</span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">
                      <span title={formatMoney(effectiveTotal(offer), currency)}>{formatMoney(effectiveTotal(offer), currency)}</span>
                      <span className="block text-[11px] text-slate-400 dark:text-slate-500">{offer.taxRate}% tax</span>
                    </td>
                    <td className="p-3">
                      <span className={`font-medium ${isBest ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}>
                        {formatMoney(adjustedComp(offer), currency)}
                      </span>
                      {isBest ? (
                        <span className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                          <Star size={11} /> Best
                        </span>
                      ) : null}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        aria-label={`Delete ${offer.company || 'offer'}`}
                        onClick={() => removeOffer(offer.id)}
                        className="text-slate-400 dark:text-slate-500 hover:text-red-500"
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
          <p className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm text-slate-500 dark:text-slate-400 shadow-sm">
            Best cost-adjusted offer:{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-100">
              {offers.find((offer) => offer.id === bestId)?.company || '—'}
            </span>{' '}
            at {formatMoney(adjustedComp(offers.find((offer) => offer.id === bestId) ?? offers[0]!), currency)} adjusted.
          </p>
        ) : null}

        {offers.length > 0 ? (
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <TrendingUp size={16} className="text-indigo-600 dark:text-indigo-400" />
              4-year projection
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {offers.map((offer) => (
                <ProjectionChart key={offer.id} offer={offer} currency={currency} />
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  )
}

export default OfferCompareApp