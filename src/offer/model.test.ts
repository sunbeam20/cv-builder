import { describe, expect, it } from 'vitest'
import { adjustedComp, bestOfferId, emptyOffer, formatMoney, monthlyTake, totalComp } from './model'

describe('totalComp / monthlyTake / adjustedComp', () => {
  it('sums all comp components', () => {
    const offer = { ...emptyOffer(), base: 100000, bonus: 10000, equityPerYear: 20000, benefits: 5000 }
    expect(totalComp(offer)).toBe(135000)
    expect(monthlyTake(offer)).toBe(11250)
  })

  it('normalises for cost of living', () => {
    const offer = { ...emptyOffer(), base: 120000, costOfLiving: 120 }
    expect(adjustedComp(offer)).toBe(100000)
  })

  it('treats a zero index as 100', () => {
    expect(adjustedComp({ ...emptyOffer(), base: 50000, costOfLiving: 0 })).toBe(50000)
  })
})

describe('bestOfferId', () => {
  it('picks the highest adjusted comp', () => {
    const cheap = { ...emptyOffer('Cheap'), id: 'a', base: 100000, costOfLiving: 80 }
    const pricey = { ...emptyOffer('Pricey'), id: 'b', base: 110000, costOfLiving: 150 }
    expect(bestOfferId([cheap, pricey])).toBe('a')
  })

  it('returns null for no offers', () => {
    expect(bestOfferId([])).toBeNull()
  })
})

describe('formatMoney', () => {
  it('formats with the given currency', () => {
    expect(formatMoney(1234, 'USD')).toBe('$1,234')
  })
})
