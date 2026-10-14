export interface Person {
  id: string
  name: string
}

export type SplitMode = 'even' | 'percent' | 'exact' | 'shares'

export interface Expense {
  id: string
  description: string
  amount: number
  payerId: string
  participants: string[]
  split: { mode: SplitMode; values: Record<string, number> }
}

export const uid = (): string => Math.random().toString(36).slice(2, 11)

export const emptyPerson = (name: string): Person => ({ id: uid(), name })

export interface Balance {
  personId: string
  name: string
  net: number
}

export interface Settlement {
  from: string
  to: string
  amount: number
}

const round = (value: number): number => Math.round(value * 100) / 100

function sharesFor(expense: Expense, participants: string[]): Map<string, number> {
  const result = new Map<string, number>()
  if (participants.length === 0) return result
  const { mode, values } = expense.split

  if (mode === 'percent') {
    for (const id of participants) result.set(id, (expense.amount * (values[id] ?? 0)) / 100)
    return result
  }

  if (mode === 'exact') {
    for (const id of participants) result.set(id, values[id] ?? 0)
    return result
  }

  if (mode === 'shares') {
    const total = participants.reduce((sum, id) => sum + (values[id] ?? 0), 0)
    if (total > 0) {
      for (const id of participants) result.set(id, (expense.amount * (values[id] ?? 0)) / total)
      return result
    }
  }

  const evenShare = expense.amount / participants.length
  for (const id of participants) result.set(id, evenShare)
  return result
}

export function shareFor(expense: Expense, personId: string): number {
  if (!expense.participants.includes(personId)) return 0
  const shares = sharesFor(expense, expense.participants)
  return round(shares.get(personId) ?? 0)
}

export function validateSplit(expense: Expense): string | null {
  const { mode, values } = expense.split
  if (mode === 'even') return null
  const participants = expense.participants
  if (participants.length === 0) return 'Select at least one participant.'

  if (mode === 'percent') {
    const total = participants.reduce((sum, id) => sum + (values[id] ?? 0), 0)
    if (Math.abs(total - 100) > 0.01) return 'Percentages should add up to 100%.'
    return null
  }

  if (mode === 'exact') {
    const total = participants.reduce((sum, id) => sum + (values[id] ?? 0), 0)
    if (Math.abs(total - expense.amount) > 0.01) return 'Exact amounts should add up to the total.'
    return null
  }

  const positive = participants.every((id) => (values[id] ?? 0) > 0)
  if (!positive) return 'Each share weight must be greater than zero.'
  return null
}

/** Net balance per person. Positive means they are owed money. */
export function computeBalances(people: Person[], expenses: Expense[]): Balance[] {
  const net = new Map<string, number>(people.map((person) => [person.id, 0]))

  for (const expense of expenses) {
    const participants = expense.participants.filter((id) => net.has(id))
    if (participants.length === 0) continue
    const shares = sharesFor(expense, participants)
    if (net.has(expense.payerId)) net.set(expense.payerId, (net.get(expense.payerId) ?? 0) + expense.amount)
    for (const id of participants) net.set(id, (net.get(id) ?? 0) - (shares.get(id) ?? 0))
  }

  return people.map((person) => ({ personId: person.id, name: person.name, net: round(net.get(person.id) ?? 0) }))
}

export function simplifyDebts(balances: Balance[]): Settlement[] {
  const creditors = balances.filter((b) => b.net > 0.009).map((b) => ({ ...b })).sort((a, b) => b.net - a.net)
  const debtors = balances.filter((b) => b.net < -0.009).map((b) => ({ ...b, net: -b.net })).sort((a, b) => b.net - a.net)

  const settlements: Settlement[] = []
  let i = 0
  let j = 0
  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i]!
    const debtor = debtors[j]!
    const amount = Math.min(creditor.net, debtor.net)
    if (amount > 0.009) {
      settlements.push({ from: debtor.name, to: creditor.name, amount: round(amount) })
    }
    creditor.net -= amount
    debtor.net -= amount
    if (creditor.net <= 0.009) i += 1
    if (debtor.net <= 0.009) j += 1
  }
  return settlements
}

export const totalSpend = (expenses: Expense[]): number =>
  round(expenses.reduce((sum, expense) => sum + expense.amount, 0))

export const formatMoney = (value: number, currency: string): string => {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value)
  } catch {
    return `${value.toFixed(2)} ${currency}`
  }
}
