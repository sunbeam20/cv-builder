import { describe, expect, it } from 'vitest'
import {
  computeBalances,
  simplifyDebts,
  totalSpend,
  validateSplit,
  type Expense,
  type Person,
} from './model'

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
  split: { mode: 'even', values: {} },
  ...over,
})

const net = (balances: ReturnType<typeof computeBalances>, id: string): number =>
  balances.find((b) => b.personId === id)?.net ?? 0

describe('computeBalances', () => {
  it('splits an expense equally among participants', () => {
    const balances = computeBalances(people, [expense({ amount: 30, payerId: 'a' })])
    expect(net(balances, 'a')).toBe(20)
    expect(net(balances, 'b')).toBe(-10)
    expect(net(balances, 'c')).toBe(-10)
  })

  it('ignores participants that are not in the group', () => {
    const balances = computeBalances(people, [expense({ amount: 20, payerId: 'a', participants: ['b', 'x'] })])
    expect(net(balances, 'a')).toBe(20)
    expect(net(balances, 'b')).toBe(-20)
  })

  it('splits by percent', () => {
    const balances = computeBalances(people, [
      expense({ amount: 100, payerId: 'c', participants: ['a', 'b'], split: { mode: 'percent', values: { a: 50, b: 50 } } }),
    ])
    expect(net(balances, 'a')).toBe(-50)
    expect(net(balances, 'b')).toBe(-50)
    expect(net(balances, 'c')).toBe(100)
  })

  it('splits by exact amounts', () => {
    const balances = computeBalances(people, [
      expense({ amount: 100, payerId: 'c', participants: ['a', 'b'], split: { mode: 'exact', values: { a: 70, b: 30 } } }),
    ])
    expect(net(balances, 'a')).toBe(-70)
    expect(net(balances, 'b')).toBe(-30)
    expect(net(balances, 'c')).toBe(100)
  })

  it('splits by shares', () => {
    const balances = computeBalances(people, [
      expense({ amount: 30, payerId: 'c', participants: ['a', 'b'], split: { mode: 'shares', values: { a: 2, b: 1 } } }),
    ])
    expect(net(balances, 'a')).toBe(-20)
    expect(net(balances, 'b')).toBe(-10)
    expect(net(balances, 'c')).toBe(30)
  })
})

describe('validateSplit', () => {
  it('accepts an even split', () => {
    expect(validateSplit(expense({ amount: 30 }))).toBeNull()
  })

  it('rejects percentages that do not sum to 100', () => {
    const message = validateSplit(
      expense({ amount: 100, participants: ['a', 'b'], split: { mode: 'percent', values: { a: 40, b: 40 } } }),
    )
    expect(message).toBeTruthy()
    expect(message).toMatch(/100/)
  })

  it('rejects exact amounts that do not sum to the total', () => {
    expect(
      validateSplit(expense({ amount: 100, participants: ['a', 'b'], split: { mode: 'exact', values: { a: 40, b: 40 } } })),
    ).toBeTruthy()
  })

  it('rejects shares that are not all positive', () => {
    expect(
      validateSplit(expense({ amount: 100, participants: ['a', 'b'], split: { mode: 'shares', values: { a: 2, b: 0 } } })),
    ).toBeTruthy()
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
