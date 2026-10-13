import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { uid, type Workout, type WorkoutExercise } from './model'

export const STORAGE_KEY = 'workout-logger-v1'

interface WorkoutState {
  workouts: Workout[]
  addWorkout: (workout: Workout) => void
  updateWorkout: (id: string, patch: Partial<Pick<Workout, 'name' | 'note' | 'date'>>) => void
  removeWorkout: (id: string) => void
  addExercise: (workoutId: string, name: string) => void
  removeExercise: (workoutId: string, exerciseId: string) => void
  addSet: (workoutId: string, exerciseId: string) => void
  removeSet: (workoutId: string, exerciseId: string, index: number) => void
  updateSet: (workoutId: string, exerciseId: string, index: number, patch: { reps?: number; weight?: number }) => void
  clearAll: () => void
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    immer((set) => ({
      workouts: [],
      addWorkout: (workout) =>
        set((state) => {
          state.workouts.unshift(workout)
          state.workouts.sort((a, b) => b.date.localeCompare(a.date))
        }),
      updateWorkout: (id, patch) =>
        set((state) => {
          const workout = state.workouts.find((item) => item.id === id)
          if (workout) Object.assign(workout, patch)
        }),
      removeWorkout: (id) =>
        set((state) => {
          const index = state.workouts.findIndex((item) => item.id === id)
          if (index !== -1) state.workouts.splice(index, 1)
        }),
      addExercise: (workoutId, name) =>
        set((state) => {
          const workout = state.workouts.find((item) => item.id === workoutId)
          if (!workout || !name.trim()) return
          const exercise: WorkoutExercise = { id: uid(), name: name.trim(), sets: [{ reps: 10, weight: 0 }] }
          workout.exercises.push(exercise)
        }),
      removeExercise: (workoutId, exerciseId) =>
        set((state) => {
          const workout = state.workouts.find((item) => item.id === workoutId)
          if (!workout) return
          workout.exercises = workout.exercises.filter((exercise) => exercise.id !== exerciseId)
        }),
      addSet: (workoutId, exerciseId) =>
        set((state) => {
          const exercise = state.workouts
            .find((item) => item.id === workoutId)
            ?.exercises.find((item) => item.id === exerciseId)
          if (exercise) exercise.sets.push({ ...(exercise.sets.at(-1) ?? { reps: 10, weight: 0 }) })
        }),
      removeSet: (workoutId, exerciseId, index) =>
        set((state) => {
          const exercise = state.workouts
            .find((item) => item.id === workoutId)
            ?.exercises.find((item) => item.id === exerciseId)
          if (exercise && exercise.sets.length > 1) exercise.sets.splice(index, 1)
        }),
      updateSet: (workoutId, exerciseId, index, patch) =>
        set((state) => {
          const setItem = state.workouts
            .find((item) => item.id === workoutId)
            ?.exercises.find((item) => item.id === exerciseId)?.sets[index]
          if (!setItem) return
          if (patch.reps !== undefined) setItem.reps = Math.max(0, patch.reps)
          if (patch.weight !== undefined) setItem.weight = Math.max(0, patch.weight)
        }),
      clearAll: () =>
        set((state) => {
          state.workouts = []
        }),
    })),
    { name: STORAGE_KEY, storage: createJSONStorage(() => localStorage), version: 1 },
  ),
)
