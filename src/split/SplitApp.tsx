import { useMemo, useState } from 'react'
import { Receipt, Copy, Plus, Trash2, UserPlus } from 'lucide-react'
import { ToolHeader } from '../components/ui/ToolHeader'
import { toast } from '../lib/toast'
import { useSplitStore } from './store'
import {
  computeBalances,
  formatMoney,
  simplifyDebts,
  totalSpend,
  validateSplit,
  type Expense,
  type SplitMode,
} from './model'

const inputClass =
  'w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-2 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500'

export function SplitApp() {
  const groupName = useSplitStore((s) => s.groupName)
  const currency = useSplitStore((s) => s.currency)
  const people = useSplitStore((s) => s.people)
  const expenses = useSplitStore((s) => s.expenses)
  const addPerson = useSplitStore((s) => s.addPerson)
  const removePerson = useSplitStore((s) => s.removePerson)
  const addExpense = useSplitStore((s) => s.addExpense)
  const removeExpense = useSplitStore((s) => s.removeExpense)

  const [newName, setNewName] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [payerId, setPayerId] = useState(people[0]?.id ?? '')
  const [participants, setParticipants] = useState<string[]>(people.map((person) => person.id))
  const [mode, setMode] = useState<SplitMode>('even')
  const [values, setValues] = useState<Record<string, string>>({})

  const balances = useMemo(() => computeBalances(people, expenses), [people, expenses])
  const settlements = useMemo(() => simplifyDebts(balances), [balances])
  const total = useMemo(() => totalSpend(expenses), [expenses])

  const seedValues = (next: SplitMode, ids: string[], amountValue: string): Record<string, string> => {
    if (next === 'even') return {}
    const count = ids.length || 1
    const numericAmount = Number(amountValue) || 0
    const seeded: Record<string, string> = {}
    for (const id of ids) {
      if (next === 'percent') seeded[id] = String(100 / count)
      else if (next === 'exact') seeded[id] = String(numericAmount / count)
      else seeded[id] = '1'
    }
    return seeded
  }

  const switchMode = (next: SplitMode) => {
    setMode(next)
    setValues(seedValues(next, participants, amount))
  }

  const setValue = (id: string, value: string) => setValues((prev) => ({ ...prev, [id]: value }))

  const toggleParticipant = (id: string) => {
    const next = participants.includes(id)
      ? participants.filter((value) => value !== id)
      : [...participants, id]
    setParticipants(next)
    if (mode !== 'even') setValues((prev) => ({ ...seedValues(mode, next, amount), ...prev }))
  }

  const draftExpense = (): Expense => {
    const numeric: Record<string, number> = {}
    for (const id of participants) numeric[id] = Number(values[id]) || 0
    return {
      id: 'draft',
      description: description.trim(),
      amount: Math.round((Number(amount) || 0) * 100) / 100,
      payerId: payerId || people[0]?.id || '',
      participants,
      split: { mode, values: numeric },
    }
  }

  const splitError = mode === 'even' ? null : validateSplit(draftExpense())

  const submitExpense = () => {
    const value = Number(amount)
    if (!description.trim() || !value || value <= 0) {
      toast.error('Enter a description and positive amount')
      return
    }
    if (participants.length === 0) {
      toast.error('Select at least one participant')
      return
    }
    const draft = draftExpense()
    const error = validateSplit(draft)
    if (error) {
      toast.error(error)
      return
    }
    addExpense({
      description: draft.description,
      amount: draft.amount,
      payerId: draft.payerId,
      participants,
      split: draft.split,
    })
    setDescription('')
    setAmount('')
  }

  const copySettleUp = async () => {
    const text = settlements.map((s) => `${s.from} pays ${s.to} ${formatMoney(s.amount, currency)}`).join('\n')
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Settle-up copied')
    } catch {
      toast.error('Clipboard unavailable')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800">
      <ToolHeader icon={Receipt} title="Expense Splitter" subtitle="Track shared costs and settle up with the fewest transfers." />

      <main className="mx-auto grid max-w-5xl gap-4 px-4 py-6 lg:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <input
              aria-label="Group name"
              className={`${inputClass} max-w-[12rem]`}
              value={groupName}
              onChange={(e) => useSplitStore.getState().setGroupName(e.target.value)}
            />
            <select
              aria-label="Currency"
              className="rounded-md border border-slate-200 dark:border-slate-700 px-2 py-2 text-sm text-slate-600 dark:text-slate-300"
              value={currency}
              onChange={(e) => useSplitStore.getState().setCurrency(e.target.value)}
            >
              {['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR'].map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
            <span className="ml-auto text-sm text-slate-500 dark:text-slate-400">
              Total <span className="font-semibold text-slate-800 dark:text-slate-100">{formatMoney(total, currency)}</span>
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">People</span>
            <div className="flex flex-wrap gap-1.5">
              {people.map((person) => (
                <span key={person.id} className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300">
                  {person.name}
                  <button
                    type="button"
                    aria-label={`Remove ${person.name}`}
                    onClick={() => removePerson(person.id)}
                    className="text-slate-400 dark:text-slate-500 hover:text-red-500"
                  >
                    <Trash2 size={11} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                aria-label="New person name"
                className={inputClass}
                placeholder="Add a person"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addPerson(newName)
                    setNewName('')
                  }
                }}
              />
              <button
                type="button"
                aria-label="Add person"
                onClick={() => {
                  addPerson(newName)
                  setNewName('')
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <UserPlus size={14} />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Add expense</span>
            <input
              aria-label="Description"
              className={inputClass}
              placeholder="Dinner"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="flex gap-2">
              <input
                aria-label="Amount"
                type="number"
                min={0}
                className={inputClass}
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <select
                aria-label="Paid by"
                className="rounded-md border border-slate-200 dark:border-slate-700 px-2 text-sm text-slate-600 dark:text-slate-300"
                value={payerId}
                onChange={(e) => setPayerId(e.target.value)}
              >
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {people.map((person) => (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => toggleParticipant(person.id)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                    participants.includes(person.id)
                      ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {person.name}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Split mode"
                className="rounded-md border border-slate-200 dark:border-slate-700 px-2 py-2 text-sm text-slate-600 dark:text-slate-300"
                value={mode}
                onChange={(e) => switchMode(e.target.value as SplitMode)}
              >
                <option value="even">Even</option>
                <option value="percent">%</option>
                <option value="exact">Exact</option>
                <option value="shares">Shares</option>
              </select>
              {mode !== 'even' ? <span className="text-xs text-slate-400 dark:text-slate-500">Set each person&apos;s share</span> : null}
            </div>
            {mode !== 'even' ? (
              <div className="flex flex-col gap-1.5">
                {people
                  .filter((person) => participants.includes(person.id))
                  .map((person) => (
                    <label key={person.id} className="flex items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <span>{person.name}</span>
                      <input
                        aria-label={`${person.name} split value`}
                        type="number"
                        min={0}
                        className={`${inputClass} max-w-[7rem]`}
                        value={values[person.id] ?? ''}
                        onChange={(e) => setValue(person.id, e.target.value)}
                      />
                    </label>
                  ))}
              </div>
            ) : null}
            {splitError ? <p className="text-xs text-red-500">{splitError}</p> : null}
            <button
              type="button"
              onClick={submitExpense}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              <Plus size={15} /> Add expense
            </button>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Balances</span>
            <ul className="mt-2 flex flex-col gap-1.5">
              {balances.map((balance) => (
                <li key={balance.personId} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700 dark:text-slate-200">{balance.name}</span>
                  <span
                    className={
                      balance.net > 0.009 ? 'font-medium text-emerald-600 dark:text-emerald-400' : balance.net < -0.009 ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'
                    }
                  >
                    {balance.net > 0.009 ? 'is owed ' : balance.net < -0.009 ? 'owes ' : ''}
                    {formatMoney(Math.abs(balance.net), currency)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Settle up</span>
            {settlements.length === 0 ? (
              <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">Everyone is settled up.</p>
            ) : (
              <ul className="mt-2 flex flex-col gap-1.5">
                {settlements.map((settlement, index) => (
                  <li key={index} className="rounded-lg bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-200">
                    <span className="font-medium">{settlement.from}</span> pays{' '}
                    <span className="font-medium">{settlement.to}</span>{' '}
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{formatMoney(settlement.amount, currency)}</span>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={copySettleUp}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Copy size={13} /> Copy settle-up
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Expenses ({expenses.length})</span>
            {expenses.length === 0 ? (
              <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">No expenses yet.</p>
            ) : (
              <ul className="mt-2 flex flex-col gap-1.5">
                {expenses.map((expense) => {
                  const payer = people.find((person) => person.id === expense.payerId)
                  return (
                    <li key={expense.id} className="flex items-center gap-2 text-sm">
                      <span className="flex-1 truncate text-slate-700 dark:text-slate-200">{expense.description}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{payer?.name ?? 'Unknown'} paid</span>
                      <span className="font-medium text-slate-800 dark:text-slate-100">{formatMoney(expense.amount, currency)}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${expense.description}`}
                        onClick={() => removeExpense(expense.id)}
                        className="text-slate-400 dark:text-slate-500 hover:text-red-500"
                      >
                        <Trash2 size={13} />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default SplitApp
