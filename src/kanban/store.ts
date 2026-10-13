import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import {
  createCard,
  createColumn,
  emptyBoard,
  moveCard as moveCardInColumns,
  removeCardFromColumns,
  type Board,
  type Card,
  type Priority,
} from './model'

export const STORAGE_KEY = 'kanban-board-v1'

interface KanbanState {
  board: Board
  addColumn: (title: string) => void
  renameColumn: (columnId: string, title: string) => void
  removeColumn: (columnId: string) => void
  moveColumn: (columnId: string, direction: -1 | 1) => void
  addCard: (columnId: string, input: { title: string; description?: string; labels?: string[]; priority?: Priority }) => void
  updateCard: (cardId: string, patch: Partial<Pick<Card, 'title' | 'description' | 'labels' | 'priority'>>) => void
  removeCard: (cardId: string) => void
  moveCard: (cardId: string, toColumnId: string, index?: number) => void
  reset: () => void
}

export const useKanbanStore = create<KanbanState>()(
  persist(
    immer((set) => ({
      board: emptyBoard(),

      addColumn: (title) =>
        set((state) => {
          state.board.columns.push(createColumn(title))
        }),

      renameColumn: (columnId, title) =>
        set((state) => {
          const column = state.board.columns.find((item) => item.id === columnId)
          if (column) column.title = title.trim() || column.title
        }),

      removeColumn: (columnId) =>
        set((state) => {
          const index = state.board.columns.findIndex((item) => item.id === columnId)
          if (index === -1) return
          const [removed] = state.board.columns.splice(index, 1)
          for (const id of removed?.cardIds ?? []) delete state.board.cards[id]
        }),

      moveColumn: (columnId, direction) =>
        set((state) => {
          const index = state.board.columns.findIndex((item) => item.id === columnId)
          const target = index + direction
          if (index === -1 || target < 0 || target >= state.board.columns.length) return
          const [column] = state.board.columns.splice(index, 1)
          if (column) state.board.columns.splice(target, 0, column)
        }),

      addCard: (columnId, input) =>
        set((state) => {
          const column = state.board.columns.find((item) => item.id === columnId)
          if (!column) return
          const card = createCard(input)
          state.board.cards[card.id] = card
          column.cardIds.push(card.id)
        }),

      updateCard: (cardId, patch) =>
        set((state) => {
          const card = state.board.cards[cardId]
          if (!card) return
          Object.assign(card, patch)
        }),

      removeCard: (cardId) =>
        set((state) => {
          removeCardFromColumns(state.board.columns, cardId)
          delete state.board.cards[cardId]
        }),

      moveCard: (cardId, toColumnId, index) =>
        set((state) => {
          moveCardInColumns(state.board.columns, cardId, toColumnId, index)
        }),

      reset: () =>
        set((state) => {
          state.board = emptyBoard()
        }),
    })),
    { name: STORAGE_KEY, storage: createJSONStorage(() => localStorage), version: 1 },
  ),
)
