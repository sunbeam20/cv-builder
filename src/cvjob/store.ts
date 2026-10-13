import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export const STORAGE_KEY = 'cv-matcher-v1'

export interface SavedAnalysis {
  id: string
  label: string
  score: number
  matched: string[]
  missing: string[]
  createdAt: string
}

interface MatcherState {
  jobDescription: string
  history: SavedAnalysis[]
  setJobDescription: (value: string) => void
  saveAnalysis: (analysis: Omit<SavedAnalysis, 'id' | 'createdAt'>) => void
  removeAnalysis: (id: string) => void
}

const uid = (): string => Math.random().toString(36).slice(2, 11)

export const useMatcherStore = create<MatcherState>()(
  persist(
    immer((set) => ({
      jobDescription: '',
      history: [],

      setJobDescription: (value) =>
        set((state) => {
          state.jobDescription = value
        }),

      saveAnalysis: (analysis) =>
        set((state) => {
          state.history.unshift({ ...analysis, id: uid(), createdAt: new Date().toISOString() })
        }),

      removeAnalysis: (id) =>
        set((state) => {
          const index = state.history.findIndex((item) => item.id === id)
          if (index !== -1) state.history.splice(index, 1)
        }),
    })),
    { name: STORAGE_KEY, storage: createJSONStorage(() => localStorage), version: 1 },
  ),
)
