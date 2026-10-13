import { useMemo, useState } from 'react'
import { Dumbbell, Plus, Trash2, X } from 'lucide-react'
import { ToolHeader } from '../components/ui/ToolHeader'
import { toast } from '../lib/toast'
import { useWorkoutStore } from './store'
import {
  WORKOUT_TEMPLATES,
  createExercise,
  createWorkout,
  dateKey,
  sortByDateDesc,
  summarise,
  workoutSets,
  workoutVolume,
  type WorkoutExercise,
} from './model'

const inputClass =
  'rounded-md border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500'
const smallInput =
  'w-16 rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 outline-none focus:border-indigo-500'

export function WorkoutApp() {
  const workouts = useWorkoutStore((s) => s.workouts)
  const addWorkout = useWorkoutStore((s) => s.addWorkout)
  const removeWorkout = useWorkoutStore((s) => s.removeWorkout)

  const [date, setDate] = useState(dateKey(new Date()))
  const [name, setName] = useState('')
  const [note, setNote] = useState('')
  const [exercises, setExercises] = useState<WorkoutExercise[]>([])
  const [newExercise, setNewExercise] = useState('')

  const summary = useMemo(() => summarise(workouts), [workouts])
  const sorted = useMemo(() => sortByDateDesc(workouts), [workouts])

  const applyTemplate = (templateName: string) => {
    const template = WORKOUT_TEMPLATES.find((item) => item.name === templateName)
    if (!template) return
    setName(template.name)
    setExercises(template.exercises.map((exercise) => createExercise(exercise)))
  }

  const addExercise = (exerciseName: string) => {
    if (!exerciseName.trim()) return
    setExercises((prev) => [...prev, createExercise(exerciseName)])
    setNewExercise('')
  }

  const renameExercise = (id: string, value: string) =>
    setExercises((prev) => prev.map((exercise) => (exercise.id === id ? { ...exercise, name: value } : exercise)))

  const removeExercise = (id: string) =>
    setExercises((prev) => prev.filter((exercise) => exercise.id !== id))

  const addSet = (id: string) =>
    setExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === id
          ? { ...exercise, sets: [...exercise.sets, { ...(exercise.sets.at(-1) ?? { reps: 10, weight: 0 }) }] }
          : exercise,
      ),
    )

  const removeSet = (id: string, index: number) =>
    setExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === id && exercise.sets.length > 1
          ? { ...exercise, sets: exercise.sets.filter((_, i) => i !== index) }
          : exercise,
      ),
    )

  const updateSet = (id: string, index: number, patch: { reps?: number; weight?: number }) =>
    setExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === id
          ? {
              ...exercise,
              sets: exercise.sets.map((set, i) => (i === index ? { ...set, ...patch } : set)),
            }
          : exercise,
      ),
    )

  const save = () => {
    if (exercises.length === 0) {
      toast.error('Add at least one exercise')
      return
    }
    addWorkout(createWorkout({ date, name: name || 'Workout', exercises, note }))
    setExercises([])
    setName('')
    setNote('')
    toast.success('Workout saved')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ToolHeader icon={Dumbbell} title="Workout Logger" subtitle="Record your workouts and watch your progress add up." />

      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
        <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
              Date
              <input aria-label="Date" type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
              Workout
              <input
                aria-label="Workout name"
                className={`${inputClass} w-44`}
                value={name}
                placeholder="Push day"
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <div className="flex flex-wrap gap-1.5 pb-1">
              {WORKOUT_TEMPLATES.map((template) => (
                <button
                  key={template.name}
                  type="button"
                  onClick={() => applyTemplate(template.name)}
                  className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50"
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {exercises.map((exercise) => (
              <div key={exercise.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                <div className="flex items-center gap-2">
                  <input
                    aria-label="Exercise name"
                    className={`${inputClass} flex-1`}
                    value={exercise.name}
                    onChange={(e) => renameExercise(exercise.id, e.target.value)}
                  />
                  <button
                    type="button"
                    aria-label={`Remove ${exercise.name}`}
                    onClick={() => removeExercise(exercise.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-400 hover:border-red-300 hover:text-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {exercise.sets.map((set, index) => (
                    <span key={index} className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs text-slate-500">
                      <input
                        aria-label={`${exercise.name} set ${index + 1} reps`}
                        type="number"
                        min={0}
                        className={smallInput}
                        value={set.reps}
                        onChange={(e) => updateSet(exercise.id, index, { reps: Number(e.target.value) })}
                      />
                      kg ×
                      <input
                        aria-label={`${exercise.name} set ${index + 1} weight`}
                        type="number"
                        min={0}
                        className={smallInput}
                        value={set.weight}
                        onChange={(e) => updateSet(exercise.id, index, { weight: Number(e.target.value) })}
                      />
                      <button
                        type="button"
                        aria-label={`Remove ${exercise.name} set ${index + 1}`}
                        onClick={() => removeSet(exercise.id, index)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => addSet(exercise.id)}
                    className="inline-flex items-center gap-1 rounded-md border border-dashed border-slate-300 px-2 py-1 text-xs text-slate-500 hover:bg-white"
                  >
                    <Plus size={12} /> set
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-slate-600">
              Add exercise
              <input
                aria-label="Add exercise"
                className={inputClass}
                value={newExercise}
                placeholder="Squat"
                onChange={(e) => setNewExercise(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addExercise(newExercise)}
              />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-slate-600">
              Note
              <input aria-label="Workout note" className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} />
            </label>
            <button
              type="button"
              onClick={() => addExercise(newExercise)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <Plus size={15} /> Exercise
            </button>
            <button
              type="button"
              onClick={save}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Save workout
            </button>
          </div>
        </section>

        {summary.total > 0 ? (
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Workouts', value: String(summary.total) },
              { label: 'Last 7 days', value: String(summary.thisWeek) },
              { label: 'Total sets', value: String(summary.totalSets) },
              { label: 'Avg volume', value: `${summary.averageVolume.toLocaleString()} kg` },
            ].map((card) => (
              <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <p className="text-lg font-bold text-slate-800">{card.value}</p>
                <p className="text-[11px] text-slate-400">{card.label}</p>
              </div>
            ))}
          </section>
        ) : null}

        <section className="flex flex-col gap-2">
          {sorted.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
              No workouts yet. Pick a template or add an exercise to get started.
            </p>
          ) : (
            sorted.map((workout) => (
              <div key={workout.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800">{workout.name}</span>
                  <span className="text-xs text-slate-400">{workout.date}</span>
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
                    {workoutSets(workout)} sets
                  </span>
                  <span className="text-xs text-slate-400">{workoutVolume(workout).toLocaleString()} kg</span>
                  <button
                    type="button"
                    aria-label={`Delete ${workout.name} on ${workout.date}`}
                    onClick={() => removeWorkout(workout.id)}
                    className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500">
                  {workout.exercises.map((exercise) => (
                    <span key={exercise.id}>
                      {exercise.name}: {exercise.sets.map((set) => `${set.reps}×${set.weight}`).join(', ')}
                    </span>
                  ))}
                </div>
                {workout.note ? <p className="mt-1 text-xs text-slate-400">{workout.note}</p> : null}
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  )
}

export default WorkoutApp
