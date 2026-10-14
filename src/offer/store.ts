import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { emptyOffer, type Offer } from './model'

export const STORAGE_KEY = 'offer-compare-v1'

interface OfferState {
  offers: Offer[]
  currency: string
  addOffer: () => void
  updateOffer: (id: string, patch: Partial<Offer>) => void
  removeOffer: (id: string) => void
  setCurrency: (currency: string) => void
}

export const useOfferStore = create<OfferState>()(
  persist(
    immer((set) => ({
      offers: [emptyOffer('Offer A'), emptyOffer('Offer B')],
      currency: 'USD',

      addOffer: () =>
        set((state) => {
          state.offers.push(emptyOffer(`Offer ${String.fromCharCode(65 + state.offers.length)}`))
        }),

      updateOffer: (id, patch) =>
        set((state) => {
          const offer = state.offers.find((item) => item.id === id)
          if (offer) Object.assign(offer, patch)
        }),

      removeOffer: (id) =>
        set((state) => {
          const index = state.offers.findIndex((item) => item.id === id)
          if (index !== -1) state.offers.splice(index, 1)
        }),

      setCurrency: (currency) =>
        set((state) => {
          state.currency = currency
        }),
    })),
    { name: STORAGE_KEY, storage: createJSONStorage(() => localStorage), version: 2,
      migrate: (persisted) => {
        const state = persisted as { offers?: Partial<Offer>[] | undefined; currency?: string | undefined }
        return {
          offers: (state?.offers ?? []).map((offer) => ({ ...emptyOffer(), ...offer })),
          currency: state?.currency ?? 'USD',
        }
      } },
  ),
)
