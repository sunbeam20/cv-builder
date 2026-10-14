import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { emptyPerson, uid, type Expense, type Person } from './model'

export const STORAGE_KEY = 'expense-splitter-v1'

interface SplitState {
  groupName: string
  currency: string
  people: Person[]
  expenses: Expense[]
  setGroupName: (name: string) => void
  setCurrency: (currency: string) => void
  addPerson: (name: string) => void
  removePerson: (id: string) => void
  addExpense: (expense: Omit<Expense, 'id'>) => void
  removeExpense: (id: string) => void
  reset: () => void
}

const initialPeople = (): Person[] => [emptyPerson('You'), emptyPerson('Friend')]

export const useSplitStore = create<SplitState>()(
  persist(
    immer((set) => ({
      groupName: 'Trip',
      currency: 'USD',
      people: initialPeople(),
      expenses: [],

      setGroupName: (name) =>
        set((state) => {
          state.groupName = name
        }),
      setCurrency: (currency) =>
        set((state) => {
          state.currency = currency
        }),
      addPerson: (name) =>
        set((state) => {
          const trimmed = name.trim()
          if (trimmed) state.people.push(emptyPerson(trimmed))
        }),
      removePerson: (id) =>
        set((state) => {
          const index = state.people.findIndex((person) => person.id === id)
          if (index !== -1) state.people.splice(index, 1)
          state.expenses = state.expenses.filter(
            (expense) => expense.payerId !== id && expense.participants.some((p) => p !== id),
          )
        }),
      addExpense: (expense) =>
        set((state) => {
          state.expenses.push({ ...expense, id: uid() })
        }),
      removeExpense: (id) =>
        set((state) => {
          const index = state.expenses.findIndex((expense) => expense.id === id)
          if (index !== -1) state.expenses.splice(index, 1)
        }),
      reset: () =>
        set((state) => {
          state.people = initialPeople()
          state.expenses = []
        }),
    })),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persisted) => {
        const state = persisted as
          | {
              groupName?: string
              currency?: string
              people?: Person[]
              expenses?: Array<Omit<Expense, 'split'> & { split?: Expense['split'] }>
            }
          | undefined
        const expenses: Expense[] = (Array.isArray(state?.expenses) ? state.expenses : []).map((expense) => ({
          ...expense,
          split: expense.split ?? { mode: 'even', values: {} },
        }))
        return { ...state, expenses }
      },
    },
  ),
)
