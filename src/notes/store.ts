import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { DEFAULT_NOTE, createNote, type Note } from './model'

export const STORAGE_KEY = 'markdown-notes-v1'

interface NotesState {
  notes: Note[]
  addNote: (content?: string) => string
  updateNote: (id: string, content: string) => void
  removeNote: (id: string) => void
  clearAll: () => void
}

export const useNotesStore = create<NotesState>()(
  persist(
    immer((set) => ({
      notes: [createNote(DEFAULT_NOTE)],

      addNote: (content) => {
        const note = createNote(content ?? '')
        set((state) => {
          state.notes.unshift(note)
        })
        return note.id
      },

      updateNote: (id, content) =>
        set((state) => {
          const note = state.notes.find((item) => item.id === id)
          if (!note) return
          note.content = content
          note.updatedAt = new Date().toISOString()
        }),

      removeNote: (id) =>
        set((state) => {
          const index = state.notes.findIndex((item) => item.id === id)
          if (index !== -1) state.notes.splice(index, 1)
        }),

      clearAll: () =>
        set((state) => {
          state.notes = [createNote('')]
        }),
    })),
    { name: STORAGE_KEY, storage: createJSONStorage(() => localStorage), version: 1 },
  ),
)
