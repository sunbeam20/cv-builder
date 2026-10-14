import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { emptyLetter, emptySender, type CoverLetter, type Sender } from './model'

export const STORAGE_KEY = 'cover-letter-v1'

interface CoverState {
  letters: CoverLetter[]
  sender: Sender
  addLetter: () => string
  updateLetter: (id: string, patch: Partial<CoverLetter>) => void
  removeLetter: (id: string) => void
  setSender: (patch: Partial<Sender>) => void
}

export const useCoverStore = create<CoverState>()(
  persist(
    immer((set) => ({
      letters: [emptyLetter()],
      sender: emptySender(),

      addLetter: () => {
        const letter = emptyLetter()
        set((state) => {
          state.letters.unshift(letter)
        })
        return letter.id
      },

      updateLetter: (id, patch) =>
        set((state) => {
          const letter = state.letters.find((item) => item.id === id)
          if (!letter) return
          Object.assign(letter, patch)
          letter.updatedAt = new Date().toISOString()
        }),

      removeLetter: (id) =>
        set((state) => {
          const index = state.letters.findIndex((item) => item.id === id)
          if (index !== -1) state.letters.splice(index, 1)
        }),

      setSender: (patch) =>
        set((state) => {
          Object.assign(state.sender, patch)
        }),
    })),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persistedState: any) => {
        if (!persistedState) return persistedState
        if (persistedState.letters && Array.isArray(persistedState.letters)) {
          persistedState.letters = persistedState.letters.map((letter: any) => ({
            font: 'sans',
            accent: '#4f46e5',
            margin: 56,
            ...letter,
          }))
        }
        return persistedState
      },
    },
  ),
)
