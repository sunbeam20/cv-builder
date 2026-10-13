export interface Person {
  id: string
  name: string
}

export interface Expense {
  id: string
  description: string
  amount: number
  payerId: string
  participants: string[]
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

/** Net balance per person. Positive means they are owed money. */
export function computeBalances(people: Person[], expenses: Expense[]): Balance[] {
  const net = new Map<string, number>(people.map((person) => [person.id, 0]))

  for (const expense of expenses) {
    const participants = expense.participants.filter((id) => net.has(id))
    if (participants.length === 0) continue
    const share = expense.amount / participants.length
    if (net.has(expense.payerId)) net.set(expense.payerId, (net.get(expense.payerId) ?? 0) + expense.amount)
    for (const id of participants) net.set(id, (net.get(id) ?? 0) - share)
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
