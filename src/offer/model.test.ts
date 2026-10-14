import { describe, expect, it } from 'vitest'
import {
  adjustedComp,
  annualBonus,
  bestOfferId,
  costAdjusted,
  effectiveTotal,
  emptyOffer,
  formatMoney,
  monthlyTake,
  projectedComp,
  totalComp,
  yearlyEquity,
} from './model'

describe('totalComp / monthlyTake', () => {
  it('sums base, bonus, first-year equity and sign-on', () => {
    const offer = { ...emptyOffer(), base: 100000, targetBonusPct: 10, signOn: 20000, equityTotal: 40000 }
    expect(annualBonus(offer)).toBe(10000)
    expect(totalComp(offer)).toBe(130000)
    expect(monthlyTake(offer)).toBe(10833)
  })
})

describe('yearlyEquity', () => {
  it('returns zero before the cliff', () => {
    const offer = { ...emptyOffer(), equityTotal: 60000, vestingYears: 4, cliffYears: 1 }
    expect(yearlyEquity(offer, 0)).toBe(0)
  })

  it('vests the full grant across the remaining post-cliff years', () => {
    const offer = { ...emptyOffer(), equityTotal: 100000, vestingYears: 4, cliffYears: 1 }
    const yearly = [0, 1, 2, 3].map((year) => yearlyEquity(offer, year))
    expect(yearly).toEqual([0, 33333, 33333, 33333])
    expect(yearly.reduce((sum, amount) => sum + amount, 0)).toBeCloseTo(offer.equityTotal, -2)
  })

  it('vests immediately across all years with no cliff', () => {
    const offer = { ...emptyOffer(), equityTotal: 80000, vestingYears: 4, cliffYears: 0 }
    const yearly = [0, 1, 2, 3].map((year) => yearlyEquity(offer, year))
    expect(yearly).toEqual([20000, 20000, 20000, 20000])
  })

  it('vests everything in year one when vestingYears is zero', () => {
    const offer = { ...emptyOffer(), equityTotal: 50000, vestingYears: 0, cliffYears: 0 }
    expect(yearlyEquity(offer, 0)).toBe(50000)
    expect(yearlyEquity(offer, 1)).toBe(0)
  })
})

describe('projectedComp', () => {
  it('returns the requested number of years', () => {
    const offer = { ...emptyOffer(), base: 120000, targetBonusPct: 10 }
    expect(projectedComp(offer)).toHaveLength(4)
    expect(projectedComp(offer, 6)).toHaveLength(6)
  })

  it('includes the sign-on only in year one', () => {
    const offer = { ...emptyOffer(), base: 100000, targetBonusPct: 10, signOn: 25000, equityTotal: 40000 }
    const yearly = projectedComp(offer)
    expect(yearly[0]).toBe(135000)
    expect(yearly[1]).toBe(123333)
    expect(yearly[2]).toBe(123333)
    expect(yearly[3]).toBe(123333)
  })
})

describe('effectiveTotal', () => {
  it('applies the tax rate and rounds', () => {
    expect(effectiveTotal({ ...emptyOffer(), base: 100000, taxRate: 25 })).toBe(75000)
  })

  it('leaves total comp untouched at 0% tax', () => {
    const offer = { ...emptyOffer(), base: 90000, targetBonusPct: 10 }
    expect(totalComp(offer)).toBe(99000)
    expect(effectiveTotal(offer)).toBe(99000)
  })
})

describe('cost of living / adjusted', () => {
  it('normalises the after-tax total for cost of living', () => {
    const offer = { ...emptyOffer(), base: 120000, costOfLiving: 120 }
    expect(effectiveTotal(offer)).toBe(120000)
    expect(adjustedComp(offer)).toBe(100000)
    expect(costAdjusted(offer)).toBe(adjustedComp(offer))
  })

  it('treats a zero index as 100', () => {
    expect(adjustedComp({ ...emptyOffer(), base: 50000, costOfLiving: 0 })).toBe(50000)
  })
})

describe('bestOfferId', () => {
  it('picks the highest cost-adjusted comp', () => {
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