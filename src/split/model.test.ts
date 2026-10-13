import { describe, expect, it } from 'vitest'
import { computeBalances, simplifyDebts, totalSpend, type Expense, type Person } from './model'

const people: Person[] = [
  { id: 'a', name: 'Alice' },
  { id: 'b', name: 'Bob' },
  { id: 'c', name: 'Cara' },
]

const expense = (over: Partial<Expense>): Expense => ({
  id: Math.random().toString(36).slice(2),
  description: 'x',
  amount: 0,
  payerId: 'a',
  participants: ['a', 'b', 'c'],
  ...over,
})

describe('computeBalances', () => {
  it('splits an expense equally among participants', () => {
    const balances = computeBalances(people, [expense({ amount: 30, payerId: 'a' })])
    expect(balances.find((b) => b.personId === 'a')?.net).toBe(20)
    expect(balances.find((b) => b.personId === 'b')?.net).toBe(-10)
    expect(balances.find((b) => b.personId === 'c')?.net).toBe(-10)
  })

  it('ignores participants that are not in the group', () => {
    const balances = computeBalances(people, [expense({ amount: 20, payerId: 'a', participants: ['b', 'x'] })])
    expect(balances.find((b) => b.personId === 'a')?.net).toBe(20)
    expect(balances.find((b) => b.personId === 'b')?.net).toBe(-20)
  })
})

describe('simplifyDebts', () => {
  it('produces the minimum transfers', () => {
    const balances = computeBalances(people, [expense({ amount: 30, payerId: 'a' })])
    const settlements = simplifyDebts(balances)
    expect(settlements).toHaveLength(2)
    expect(settlements.every((s) => s.to === 'Alice' && s.amount === 10)).toBe(true)
  })

  it('returns nothing when balanced', () => {
    expect(simplifyDebts(computeBalances(people, []))).toEqual([])
  })
})

describe('totalSpend', () => {
  it('sums all expenses', () => {
    expect(totalSpend([expense({ amount: 30 }), expense({ amount: 12.5 })])).toBe(42.5)
  })
})
