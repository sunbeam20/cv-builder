import { useMemo, useState } from 'react'
import { Receipt, Plus, Trash2, UserPlus } from 'lucide-react'
import { ToolHeader } from '../components/ui/ToolHeader'
import { toast } from '../lib/toast'
import { useSplitStore } from './store'
import { computeBalances, formatMoney, simplifyDebts, totalSpend } from './model'

const inputClass =
  'w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500'

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

  const balances = useMemo(() => computeBalances(people, expenses), [people, expenses])
  const settlements = useMemo(() => simplifyDebts(balances), [balances])
  const total = useMemo(() => totalSpend(expenses), [expenses])

  const toggleParticipant = (id: string) =>
    setParticipants((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]))

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
    addExpense({
      description: description.trim(),
      amount: Math.round(value * 100) / 100,
      payerId: payerId || people[0]?.id || '',
      participants,
    })
    setDescription('')
    setAmount('')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ToolHeader icon={Receipt} title="Expense Splitter" subtitle="Track shared costs and settle up with the fewest transfers." />

      <main className="mx-auto grid max-w-5xl gap-4 px-4 py-6 lg:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <input
              aria-label="Group name"
              className={`${inputClass} max-w-[12rem]`}
              value={groupName}
              onChange={(e) => useSplitStore.getState().setGroupName(e.target.value)}
            />
            <select
              aria-label="Currency"
              className="rounded-md border border-slate-200 px-2 py-2 text-sm text-slate-600"
              value={currency}
              onChange={(e) => useSplitStore.getState().setCurrency(e.target.value)}
            >
              {['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR'].map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
            <span className="ml-auto text-sm text-slate-500">
              Total <span className="font-semibold text-slate-800">{formatMoney(total, currency)}</span>
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-400">People</span>
            <div className="flex flex-wrap gap-1.5">
              {people.map((person) => (
                <span key={person.id} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                  {person.name}
                  <button
                    type="button"
                    aria-label={`Remove ${person.name}`}
                    onClick={() => removePerson(person.id)}
                    className="text-slate-400 hover:text-red-500"
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
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <UserPlus size={14} />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
            <span className="text-xs font-medium text-slate-400">Add expense</span>
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
                className="rounded-md border border-slate-200 px-2 text-sm text-slate-600"
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
                      ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-500'
                  }`}
                >
                  {person.name}
                </button>
              ))}
            </div>
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
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-medium text-slate-400">Balances</span>
            <ul className="mt-2 flex flex-col gap-1.5">
              {balances.map((balance) => (
                <li key={balance.personId} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{balance.name}</span>
                  <span
                    className={
                      balance.net > 0.009 ? 'font-medium text-emerald-600' : balance.net < -0.009 ? 'text-red-500' : 'text-slate-400'
                    }
                  >
                    {balance.net > 0.009 ? 'is owed ' : balance.net < -0.009 ? 'owes ' : ''}
                    {formatMoney(Math.abs(balance.net), currency)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-medium text-slate-400">Settle up</span>
            {settlements.length === 0 ? (
              <p className="mt-2 text-sm text-slate-400">Everyone is settled up.</p>
            ) : (
              <ul className="mt-2 flex flex-col gap-1.5">
                {settlements.map((settlement, index) => (
                  <li key={index} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    <span className="font-medium">{settlement.from}</span> pays{' '}
                    <span className="font-medium">{settlement.to}</span>{' '}
                    <span className="font-semibold text-indigo-600">{formatMoney(settlement.amount, currency)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-medium text-slate-400">Expenses ({expenses.length})</span>
            {expenses.length === 0 ? (
              <p className="mt-2 text-sm text-slate-400">No expenses yet.</p>
            ) : (
              <ul className="mt-2 flex flex-col gap-1.5">
                {expenses.map((expense) => {
                  const payer = people.find((person) => person.id === expense.payerId)
                  return (
                    <li key={expense.id} className="flex items-center gap-2 text-sm">
                      <span className="flex-1 truncate text-slate-700">{expense.description}</span>
                      <span className="text-xs text-slate-400">{payer?.name ?? 'Unknown'} paid</span>
                      <span className="font-medium text-slate-800">{formatMoney(expense.amount, currency)}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${expense.description}`}
                        onClick={() => removeExpense(expense.id)}
                        className="text-slate-400 hover:text-red-500"
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
