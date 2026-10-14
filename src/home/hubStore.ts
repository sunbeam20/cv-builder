import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const STORAGE_KEY = 'hub-prefs-v1'
const MAX_RECENTS = 6

interface HubState {
  recents: string[]
  favourites: string[]
  recordRecent: (slug: string) => void
  toggleFavourite: (slug: string) => void
}

/**
 * Per-browser hub preferences: the tools you opened most recently and the ones
 * you pinned. Persisted locally, never synced anywhere.
 */
export const useHubStore = create<HubState>()(
  persist(
    (set) => ({
      recents: [],
      favourites: [],

      recordRecent: (slug) =>
        set((state) => ({
          recents: [slug, ...state.recents.filter((item) => item !== slug)].slice(0, MAX_RECENTS),
        })),

      toggleFavourite: (slug) =>
        set((state) => ({
          favourites: state.favourites.includes(slug)
            ? state.favourites.filter((item) => item !== slug)
            : [slug, ...state.favourites],
        })),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
)
