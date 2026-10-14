export interface Offer {
  id: string
  company: string
  role: string
  base: number
  targetBonusPct: number
  signOn: number
  equityTotal: number
  vestingYears: number
  cliffYears: number
  taxRate: number
  costOfLiving: number
  remoteDays: number
}

export const uid = (): string => Math.random().toString(36).slice(2, 11)

export const emptyOffer = (company = ''): Offer => ({
  id: uid(),
  company,
  role: '',
  base: 0,
  targetBonusPct: 0,
  signOn: 0,
  equityTotal: 0,
  vestingYears: 4,
  cliffYears: 1,
  taxRate: 0,
  costOfLiving: 100,
  remoteDays: 0,
})

export const annualBonus = (offer: Offer): number => (offer.base * offer.targetBonusPct) / 100

export const yearlyEquity = (offer: Offer, yearIndex: number): number => {
  const vesting = offer.vestingYears
  const cliff = Math.max(offer.cliffYears, 0)
  if (vesting <= 0) return yearIndex === 0 ? Math.round(offer.equityTotal) : 0
  if (yearIndex < cliff || yearIndex >= vesting) return 0
  const active = Math.max(vesting - cliff, 1)
  return Math.round(offer.equityTotal / active)
}

export const projectedComp = (offer: Offer, years = 4): number[] => {
  const base = annualBonus(offer)
  const list: number[] = []
  for (let i = 0; i < years; i += 1) {
    const value = offer.base + base + yearlyEquity(offer, i) + (i === 0 ? offer.signOn : 0)
    list.push(Math.round(value))
  }
  return list
}

export const totalComp = (offer: Offer): number =>
  offer.base + annualBonus(offer) + yearlyEquity(offer, 0) + offer.signOn

export const effectiveTotal = (offer: Offer): number => Math.round(totalComp(offer) * (1 - offer.taxRate / 100))

export const costAdjusted = (offer: Offer): number => {
  const index = offer.costOfLiving > 0 ? offer.costOfLiving : 100
  return Math.round((effectiveTotal(offer) / index) * 100)
}

export const adjustedComp = costAdjusted

export const monthlyTake = (offer: Offer): number => Math.round(totalComp(offer) / 12)

export const bestOfferId = (offers: Offer[]): string | null => {
  if (offers.length === 0) return null
  return offers.reduce((best, offer) => (adjustedComp(offer) > adjustedComp(best) ? offer : best), offers[0]!).id
}

export const formatMoney = (value: number, currency = 'USD'): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)

export const formatCompact = (value: number): string =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)