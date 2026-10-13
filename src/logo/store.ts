import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { emptyLogo, type LogoConfig } from './model'

export const STORAGE_KEY = 'logo-maker-v1'

interface LogoState {
  config: LogoConfig
  update: (patch: Partial<LogoConfig>) => void
  replace: (config: LogoConfig) => void
  reset: () => void
}

export const useLogoStore = create<LogoState>()(
  persist(
    immer((set) => ({
      config: emptyLogo(),
      update: (patch) =>
        set((state) => {
          Object.assign(state.config, patch)
        }),
      replace: (config) =>
        set((state) => {
          state.config = config
        }),
      reset: () =>
        set((state) => {
          state.config = emptyLogo()
        }),
    })),
    { name: STORAGE_KEY, storage: createJSONStorage(() => localStorage), version: 1 },
  ),
)
