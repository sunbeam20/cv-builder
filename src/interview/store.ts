import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { emptyAnswer, type StarAnswer } from './model'

export const STORAGE_KEY = 'interview-prep-v1'

interface InterviewState {
  answers: StarAnswer[]
  practiced: string[]
  addAnswer: (answer?: StarAnswer) => string
  updateAnswer: (id: string, patch: Partial<StarAnswer>) => void
  removeAnswer: (id: string) => void
  markPracticed: (question: string) => void
  resetProgress: () => void
}

export const useInterviewStore = create<InterviewState>()(
  persist(
    immer((set) => ({
      answers: [],
      practiced: [],

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

      resetProgress: () =>
        set((state) => {
          state.practiced = []
        }),
    })),
    { name: STORAGE_KEY, storage: createJSONStorage(() => localStorage), version: 1 },
  ),
)
