import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { createEntry, type MoodEntry } from './model'

export const STORAGE_KEY = 'mood-journal-v1'

interface MoodState {
  entries: MoodEntry[]
  addEntry: (input: { date: string; mood: number; tags?: string[]; gratitude?: string[]; note?: string }) => boolean
  updateEntry: (id: string, patch: Partial<Pick<MoodEntry, 'mood' | 'tags' | 'gratitude' | 'note'>>) => void
  removeEntry: (id: string) => void
  clearAll: () => void
}

export const useMoodStore = create<MoodState>()(
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
          if (entry) Object.assign(entry, patch)
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
