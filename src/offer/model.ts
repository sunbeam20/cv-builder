export interface Offer {
  id: string
  company: string
  role: string
  base: number
  bonus: number
  equityPerYear: number
  benefits: number
  costOfLiving: number
}

export const uid = (): string => Math.random().toString(36).slice(2, 11)

export const emptyOffer = (company = ''): Offer => ({
  id: uid(),
  company,
  role: '',
  base: 0,
  bonus: 0,
  equityPerYear: 0,
  benefits: 0,
  costOfLiving: 100,
})

export const totalComp = (offer: Offer): number =>
  offer.base + offer.bonus + offer.equityPerYear + offer.benefits

/** Total comp normalised to a cost-of-living index of 100. */
export const adjustedComp = (offer: Offer): number => {
  const index = offer.costOfLiving > 0 ? offer.costOfLiving : 100
  return Math.round((totalComp(offer) / index) * 100)
}

export const monthlyTake = (offer: Offer): number => Math.round(totalComp(offer) / 12)

export const bestOfferId = (offers: Offer[]): string | null => {
  if (offers.length === 0) return null
  return offers.reduce((best, offer) => (adjustedComp(offer) > adjustedComp(best) ? offer : best), offers[0]!).id
}

export const formatMoney = (value: number, currency = 'USD'): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)

export const formatCompact = (value: number): string =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
