export interface WorkoutSet {
  reps: number
  weight: number
}

export interface WorkoutExercise {
  id: string
  name: string
  sets: WorkoutSet[]
}

export interface Workout {
  id: string
  /** YYYY-MM-DD */
  date: string
  name: string
  exercises: WorkoutExercise[]
  note: string
  createdAt: string
}

export const WORKOUT_TEMPLATES: { name: string; exercises: string[] }[] = [
  { name: 'Push', exercises: ['Bench press', 'Overhead press', 'Incline press', 'Triceps pushdown'] },
  { name: 'Pull', exercises: ['Deadlift', 'Pull-up', 'Barbell row', 'Biceps curl'] },
  { name: 'Legs', exercises: ['Squat', 'Romanian deadlift', 'Leg press', 'Calf raise'] },
  { name: 'Full body', exercises: ['Squat', 'Bench press', 'Barbell row', 'Plank'] },
]

export const dateKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const addDays = (date: Date, days: number): Date => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export const uid = (): string => Math.random().toString(36).slice(2, 11)

export const exerciseVolume = (exercise: WorkoutExercise): number =>
  exercise.sets.reduce((sum, set) => sum + set.reps * set.weight, 0)

export const workoutVolume = (workout: Workout): number =>
  workout.exercises.reduce((sum, exercise) => sum + exerciseVolume(exercise), 0)

export const workoutSets = (workout: Workout): number =>
  workout.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0)

export const sortByDateDesc = (workouts: Workout[]): Workout[] =>
  [...workouts].sort((a, b) => b.date.localeCompare(a.date))

export const createExercise = (name: string): WorkoutExercise => ({
  id: uid(),
  name: name.trim(),
  sets: [{ reps: 10, weight: 0 }],
})

export const createWorkout = (input: {
  date: string
  name: string
  exercises?: WorkoutExercise[]
  note?: string
}): Workout => ({
  id: uid(),
  date: input.date,
  name: input.name.trim() || 'Workout',
  exercises: input.exercises ?? [],
  note: input.note?.trim() ?? '',
  createdAt: new Date().toISOString(),
})

export interface WorkoutSummary {
  total: number
  thisWeek: number
  totalVolume: number
  totalSets: number
  averageVolume: number
}

export function summarise(workouts: Workout[], today: Date = new Date()): WorkoutSummary {
  const weekStart = dateKey(addDays(today, -6))
  const totalVolume = workouts.reduce((sum, workout) => sum + workoutVolume(workout), 0)
  return {
    total: workouts.length,
    thisWeek: workouts.filter((workout) => workout.date >= weekStart && workout.date <= dateKey(today)).length,
    totalVolume,
    totalSets: workouts.reduce((sum, workout) => sum + workoutSets(workout), 0),
    averageVolume: workouts.length ? Math.round(totalVolume / workouts.length) : 0,
  }
}

/** Personal best weight logged for a given exercise name. */
export function personalBest(workouts: Workout[], exerciseName: string): number {
  let best = 0
  for (const workout of workouts) {
    for (const exercise of workout.exercises) {
      if (exercise.name.toLowerCase() !== exerciseName.toLowerCase()) continue
      for (const set of exercise.sets) best = Math.max(best, set.weight)
    }
  }
  return best
}
