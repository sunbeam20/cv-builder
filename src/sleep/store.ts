import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { createEntry, type SleepEntry } from './model'

export const STORAGE_KEY = 'sleep-tracker-v1'

interface SleepState {
  entries: SleepEntry[]
  addEntry: (input: { date: string; bed: string; wake: string; quality: number; note?: string }) => boolean
  updateEntry: (id: string, patch: Partial<Pick<SleepEntry, 'date' | 'bed' | 'wake' | 'quality' | 'note'>>) => void
  removeEntry: (id: string) => void
  clearAll: () => void
}

export const useSleepStore = create<SleepState>()(
  persist(
    immer((set) => ({
      entries: [],

      addEntry: (input) => {
        let added = false
        set((state) => {
          if (state.entries.some((entry) => entry.date === input.date)) return
          state.entries.push(createEntry(input))
          state.entries.sort((a, b) => b.date.localeCompare(a.date))
          added = true
        })
        return added
      },

      updateEntry: (id, patch) =>
        set((state) => {
          const entry = state.entries.find((item) => item.id === id)
          if (!entry) return
          Object.assign(entry, patch)
        }),

      removeEntry: (id) =>
        set((state) => {
          const index = state.entries.findIndex((item) => item.id === id)
          if (index !== -1) state.entries.splice(index, 1)
        }),

      clearAll: () =>
        set((state) => {
          state.entries = []
        }),
    })),
    { name: STORAGE_KEY, storage: createJSONStorage(() => localStorage), version: 1 },
  ),
)
