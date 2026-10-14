import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { emptyAnswer, type StarAnswer } from './model'

export const STORAGE_KEY = 'interview-prep-v1'

interface InterviewState {
  answers: StarAnswer[]
  practiced: string[]
  notes: Record<string, string>
  addAnswer: (answer?: StarAnswer) => string
  updateAnswer: (id: string, patch: Partial<StarAnswer>) => void
  removeAnswer: (id: string) => void
  markPracticed: (question: string) => void
  setNote: (question: string, value: string) => void
  resetProgress: () => void
}

export const useInterviewStore = create<InterviewState>()(
  persist(
    immer((set) => ({
      answers: [],
      practiced: [],
      notes: {},

      addAnswer: (answer) => {
        const next = answer ?? emptyAnswer()
        set((state) => {
          state.answers.unshift(next)
        })
        return next.id
      },

      updateAnswer: (id, patch) =>
        set((state) => {
          const answer = state.answers.find((item) => item.id === id)
          if (answer) Object.assign(answer, patch)
        }),

      removeAnswer: (id) =>
        set((state) => {
          const index = state.answers.findIndex((item) => item.id === id)
          if (index !== -1) state.answers.splice(index, 1)
        }),

      markPracticed: (question) =>
        set((state) => {
          if (!state.practiced.includes(question)) state.practiced.push(question)
        }),

      setNote: (question, value) =>
        set((state) => {
          state.notes[question] = value
        }),

      resetProgress: () =>
        set((state) => {
          state.practiced = []
        }),
    })),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persisted, _version) => {
        const state = (persisted ?? {}) as Partial<InterviewState>
        return { ...state, notes: state.notes ?? {} } as InterviewState
      },
    },
  ),
)
