import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { emptyFavicon, type FaviconConfig } from './model'

export const STORAGE_KEY = 'favicon-generator-v1'

interface FaviconState {
  config: FaviconConfig
  update: (patch: Partial<FaviconConfig>) => void
}

export const useFaviconStore = create<FaviconState>()(
  persist(
    immer((set) => ({
      config: emptyFavicon(),
      update: (patch) =>
        set((state) => {
          Object.assign(state.config, patch)
        }),
    })),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persisted) => {
        const state = persisted as { config?: Partial<FaviconConfig> } | undefined
        return {
          config: { ...emptyFavicon(), ...state?.config },
        }
      },
    },
  ),
)
