import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Draft } from 'immer'
import { createHabit, type Habit, type HabitColor } from './model'

export const STORAGE_KEY = 'habit-tracker-v1'

interface HabitsState {
  habits: Habit[]
  addHabit: (input: { name: string; emoji?: string; color?: HabitColor; targetPerWeek?: number }) => void
  updateHabit: (id: string, patch: Partial<Pick<Habit, 'name' | 'emoji' | 'color' | 'targetPerWeek'>>) => void
  removeHabit: (id: string) => void
  toggleDone: (id: string, key: string) => void
  toggleFreeze: (id: string, key: string) => void
  move: (id: string, direction: -1 | 1) => void
  clearAll: () => void
}

export const useHabitsStore = create<HabitsState>()(
  persist(
    immer((set) => ({
      habits: [],

      addHabit: (input) =>
        set((state) => {
          if (!input.name.trim()) return
          state.habits.push(createHabit(input))
        }),

      updateHabit: (id, patch) =>
        set((state) => {
          const habit = state.habits.find((h) => h.id === id)
          if (!habit) return
          if (patch.name !== undefined) habit.name = patch.name.trim()
          if (patch.emoji !== undefined) habit.emoji = patch.emoji.trim() || '✅'
          if (patch.color !== undefined) habit.color = patch.color
          if (patch.targetPerWeek !== undefined) habit.targetPerWeek = Math.max(1, Math.min(7, patch.targetPerWeek))
        }),

      removeHabit: (id) =>
        set((state) => {
          const index = state.habits.findIndex((h) => h.id === id)
          if (index !== -1) state.habits.splice(index, 1)
        }),

      toggleDone: (id, key) =>
        set((state) => {
          const habit = state.habits.find((h) => h.id === id)
          if (!habit) return
          if (habit.done[key]) delete habit.done[key]
          else {
            habit.done[key] = true
            delete habit.frozen[key]
          }
        }),

      toggleFreeze: (id, key) =>
        set((state) => {
          const habit = state.habits.find((h) => h.id === id)
          if (!habit) return
          if (habit.frozen[key]) delete habit.frozen[key]
          else {
            habit.frozen[key] = true
            delete habit.done[key]
          }
        }),

      move: (id, direction) =>
        set((state) => {
          const index = state.habits.findIndex((h) => h.id === id)
          const target = index + direction
          if (index === -1 || target < 0 || target >= state.habits.length) return
          const [habit] = state.habits.splice(index, 1)
          state.habits.splice(target, 0, habit as Draft<Habit>)
        }),

      clearAll: () =>
        set((state) => {
          state.habits = []
        }),
    })),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
)
