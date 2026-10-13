import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { DEFAULT_SETTINGS, createSession, type FocusSession, type FocusSettings, type Phase } from './model'

export const STORAGE_KEY = 'focus-timer-v1'

interface FocusState {
  sessions: FocusSession[]
  settings: FocusSettings
  addSession: (phase: Phase, minutes: number) => void
  updateSettings: (patch: Partial<FocusSettings>) => void
  clearSessions: () => void
}

export const useFocusStore = create<FocusState>()(
  persist(
    immer((set) => ({
      sessions: [],
      settings: DEFAULT_SETTINGS,
      addSession: (phase, minutes) =>
        set((state) => {
          state.sessions.push(createSession(phase, minutes))
        }),
      updateSettings: (patch) =>
        set((state) => {
          Object.assign(state.settings, patch)
        }),
      clearSessions: () =>
        set((state) => {
          state.sessions = []
        }),
    })),
    { name: STORAGE_KEY, storage: createJSONStorage(() => localStorage), version: 1 },
  ),
)
