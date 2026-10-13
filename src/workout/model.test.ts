import { describe, expect, it } from 'vitest'
import {
  createExercise,
  createWorkout,
  exerciseVolume,
  personalBest,
  summarise,
  workoutSets,
  workoutVolume,
  type Workout,
} from './model'

const workout = (date: string, exercises = [createExercise('Squat')]): Workout => ({
  ...createWorkout({ date, name: 'Legs' }),
  exercises,
})

describe('volume maths', () => {
  it('sums reps × weight for an exercise', () => {
    const exercise = { ...createExercise('Bench'), sets: [{ reps: 10, weight: 60 }, { reps: 8, weight: 70 }] }
    expect(exerciseVolume(exercise)).toBe(1160)
  })

  it('totals a workout', () => {
    const entry = workout('2026-03-10')
    entry.exercises = [
      { ...createExercise('A'), sets: [{ reps: 5, weight: 100 }] },
      { ...createExercise('B'), sets: [{ reps: 10, weight: 20 }, { reps: 10, weight: 20 }] },
    ]
    expect(workoutVolume(entry)).toBe(900)
    expect(workoutSets(entry)).toBe(3)
  })
})

describe('summarise', () => {
  it('counts workouts and this week', () => {
    const summary = summarise(
      [workout('2026-03-10'), workout('2026-03-09'), workout('2026-02-01')],
      new Date(2026, 2, 10, 12),
    )
    expect(summary.total).toBe(3)
    expect(summary.thisWeek).toBe(2)
  })
})

describe('personalBest', () => {
  it('finds the heaviest set for an exercise', () => {
    const first = workout('2026-03-01')
    first.exercises = [{ ...createExercise('Deadlift'), sets: [{ reps: 5, weight: 120 }] }]
    const second = workout('2026-03-08')
    second.exercises = [{ ...createExercise('Deadlift'), sets: [{ reps: 3, weight: 140 }] }]
    expect(personalBest([first, second], 'deadlift')).toBe(140)
    expect(personalBest([first, second], 'Squat')).toBe(0)
  })
})

describe('createExercise', () => {
  it('starts with a single default set', () => {
    expect(createExercise('Row').sets).toHaveLength(1)
  })
})
