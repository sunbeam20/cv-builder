import { useMemo, useState } from 'react'
import { Check, Pill, Plus, Trash2 } from 'lucide-react'
import { ToolHeader } from '../components/ui/ToolHeader'
import { toast } from '../lib/toast'
import { useMedicineStore } from './store'
import {
  REFILL_THRESHOLD,
  dateKey,
  dayProgress,
  needsRefill,
  parseTimes,
  scheduledDoses,
} from './model'

const inputClass =
  'rounded-md border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500'

export function MedicineApp() {
  const medicines = useMedicineStore((s) => s.medicines)
  const taken = useMedicineStore((s) => s.taken)
  const addMedicine = useMedicineStore((s) => s.addMedicine)
  const removeMedicine = useMedicineStore((s) => s.removeMedicine)
  const toggleDose = useMedicineStore((s) => s.toggleDose)

  const [name, setName] = useState('')
  const [dosage, setDosage] = useState('')
  const [times, setTimes] = useState('09:00, 21:00')
  const [remaining, setRemaining] = useState(30)

  const today = dateKey(new Date())
  const progress = useMemo(() => dayProgress(medicines, taken), [medicines, taken])

  const submit = () => {
    const parsed = parseTimes(times)
    if (!name.trim()) {
      toast.error('Enter a medicine name')
      return
    }
    if (parsed.length === 0) {
      toast.error('Add at least one dose time (HH:MM)')
      return
    }
    addMedicine({ name, dosage, times: parsed, remaining })
    setName('')
    setDosage('')
    toast.success('Medicine added')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ToolHeader icon={Pill} title="Medicine Reminder" subtitle="Keep track of doses, schedules, and refills." />

      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
        <section className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Medicine
            <input
              aria-label="Medicine name"
              className={`${inputClass} w-44`}
              value={name}
              placeholder="Vitamin D"
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Dosage
            <input
              aria-label="Dosage"
              className={`${inputClass} w-28`}
              value={dosage}
              placeholder="1 tablet"
              onChange={(e) => setDosage(e.target.value)}
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-slate-600">
            Times
            <input
              aria-label="Dose times"
              className={inputClass}
              value={times}
              placeholder="09:00, 21:00"
              onChange={(e) => setTimes(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Doses left
            <input
              aria-label="Doses left"
              type="number"
              min={0}
              className={`${inputClass} w-24`}
              value={remaining}
              onChange={(e) => setRemaining(Number(e.target.value))}
            />
          </label>
          <button
            type="button"
            onClick={submit}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            <Plus size={15} />
            Add
          </button>
        </section>

        {medicines.length > 0 ? (
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Today’s doses</span>
              <span>
                {progress.taken}/{progress.total} taken
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress.percent}%` }} />
            </div>
          </section>
        ) : null}

        <section className="flex flex-col gap-3">
          {medicines.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
              No medicines yet. Add one above to build today’s checklist.
            </p>
          ) : (
            medicines.map((medicine) => {
              const doses = scheduledDoses(medicine, taken)
              return (
                <div key={medicine.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-rose-50 text-rose-500">
                      <Pill size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-slate-800">{medicine.name}</h3>
                      <p className="text-[11px] text-slate-400">
                        {medicine.dosage || 'As directed'} · {medicine.remaining} doses left
                      </p>
                    </div>
                    {needsRefill(medicine) ? (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-600">
                        Refill soon
                      </span>
                    ) : null}
                    <button
                      type="button"
                      aria-label={`Delete ${medicine.name}`}
                      onClick={() => removeMedicine(medicine.id)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {doses.map((dose) => (
                      <button
                        key={dose.key}
                        type="button"
                        aria-pressed={dose.taken}
                        aria-label={`${medicine.name} ${dose.time}${dose.taken ? ' taken' : ''}`}
                        onClick={() => toggleDose(medicine.id, today, dose.time)}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                          dose.taken
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-600'
                            : dose.overdue
                              ? 'border-amber-300 bg-amber-50 text-amber-600'
                              : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {dose.taken ? <Check size={13} /> : <span className="font-mono">{dose.time}</span>}
                        {dose.taken ? <span className="font-mono">{dose.time}</span> : null}
                      </button>
                    ))}
                  </div>
                  {medicine.remaining <= REFILL_THRESHOLD ? (
                    <p className="mt-2 text-[11px] text-amber-600">
                      Only {medicine.remaining} doses left — time to refill.
                    </p>
                  ) : null}
                </div>
              )
            })
          )}
        </section>
      </main>
    </div>
  )
}

export default MedicineApp
