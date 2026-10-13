import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { current, type Draft } from 'immer'
import type { Application, ApplicationStatus } from '../types'
import { crossOriginStorage } from '../lib/crossOrigin'
import { uid } from '../lib/helpers'
import { mergeApplications, normalizeApplication, type SavedView } from './model'

export const STORAGE_KEY = 'job-tracker-v1'
/** Legacy location: applications used to live inside the CV Builder store. */
const LEGACY_KEY = 'cv-builder-v1'

/**
 * One-time migration: older builds stored applications alongside the résumé in
 * `cv-builder-v1`. Seed the tracker from those on first load so nothing is lost.
 */
function readLegacyApplications(): Application[] {
  try {
    const raw = crossOriginStorage.getItem(LEGACY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as { state?: { applications?: Application[] } }
    const apps = parsed.state?.applications
    return Array.isArray(apps) ? apps.map(normalizeApplication) : []
  } catch {
    return []
  }
}

export type ImportMode = 'merge' | 'replace'

interface JobsState {
  applications: Application[]
  views: SavedView[]
  /** Target number of applications to send in a rolling 30-day window. */
  goal: number
  addApplication: (application: Application) => void
  updateApplication: (id: string, recipe: (draft: Draft<Application>) => void) => void
  removeApplication: (id: string) => void
  restoreApplication: (application: Application, index?: number) => void
  moveApplication: (id: string, status: ApplicationStatus, note?: string) => void
  addNote: (id: string, text: string) => void
  setArchived: (id: string, archived: boolean) => void
  setPriority: (id: string, priority: number) => void
  duplicateApplication: (id: string) => void
  importApplications: (applications: Application[], mode: ImportMode) => void
  setApplications: (applications: Application[]) => void
  clearAll: () => void
  saveView: (view: SavedView) => void
  removeView: (id: string) => void
  setGoal: (goal: number) => void
}

const DEFAULT_GOAL = 10

const now = (): string => new Date().toISOString()

export const useJobsStore = create<JobsState>()(
  persist(
    immer((set) => ({
      applications: readLegacyApplications(),
      views: [],
      goal: DEFAULT_GOAL,

      addApplication: (application) =>
        set((state) => {
          const normalised = normalizeApplication(application)
          state.applications.unshift(normalised)
        }),

      updateApplication: (id, recipe) =>
        set((state) => {
          const application = state.applications.find((a) => a.id === id)
          if (!application) return
          recipe(application)
          application.updatedAt = now()
        }),

      removeApplication: (id) =>
        set((state) => {
          const index = state.applications.findIndex((a) => a.id === id)
          if (index !== -1) state.applications.splice(index, 1)
        }),

      restoreApplication: (application, index = 0) =>
        set((state) => {
          const at = Math.max(0, Math.min(index, state.applications.length))
          state.applications.splice(at, 0, normalizeApplication(application))
        }),

      moveApplication: (id, status, note) =>
        set((state) => {
          const application = state.applications.find((a) => a.id === id)
          if (!application || application.status === status) return
          application.status = status
          application.updatedAt = now()
          application.history.push({
            id: uid(),
            status,
            at: application.updatedAt,
            ...(note ? { note } : {}),
          })
        }),

      addNote: (id, text) =>
        set((state) => {
          const application = state.applications.find((a) => a.id === id)
          const trimmed = text.trim()
          if (!application || !trimmed) return
          application.updatedAt = now()
          application.history.push({
            id: uid(),
            status: application.status,
            at: application.updatedAt,
            note: trimmed,
          })
        }),

      setArchived: (id, archived) =>
        set((state) => {
          const application = state.applications.find((a) => a.id === id)
          if (!application) return
          application.archived = archived
          application.updatedAt = now()
        }),

      setPriority: (id, priority) =>
        set((state) => {
          const application = state.applications.find((a) => a.id === id)
          if (!application) return
          application.priority = Math.max(0, Math.min(3, Math.round(priority)))
          application.updatedAt = now()
        }),

      duplicateApplication: (id) =>
        set((state) => {
          const source = state.applications.find((a) => a.id === id)
          if (!source) return
          const snapshot = current(source)
          const stamp = now()
          const copy: Application = {
            ...snapshot,
            id: uid(),
            archived: false,
            createdAt: stamp,
            updatedAt: stamp,
            history: [{ id: uid(), status: snapshot.status, at: stamp }],
          }
          state.applications.unshift(copy)
        }),

      importApplications: (applications, mode) =>
        set((state) => {
          const normalised = applications.map(normalizeApplication)
          state.applications =
            mode === 'replace' ? normalised : mergeApplications(state.applications, normalised)
        }),

      setApplications: (applications) =>
        set((state) => {
          state.applications = applications.map(normalizeApplication)
        }),

      clearAll: () =>
        set((state) => {
          state.applications = []
        }),

      saveView: (view) =>
        set((state) => {
          const index = state.views.findIndex((existing) => existing.id === view.id)
          if (index === -1) state.views.push(view)
          else state.views[index] = view
        }),

      removeView: (id) =>
        set((state) => {
          state.views = state.views.filter((view) => view.id !== id)
        }),

      setGoal: (goal) =>
        set((state) => {
          state.goal = Math.max(0, Math.min(999, Math.round(goal)))
        }),
    })),
    {
      name: STORAGE_KEY,
      version: 2,
      storage: createJSONStorage(() => crossOriginStorage),
      partialize: (state) => ({
        applications: state.applications,
        views: state.views,
        goal: state.goal,
      }),
      migrate: (persisted) => {
        const state = persisted as
          | { applications?: Application[]; views?: SavedView[]; goal?: number }
          | undefined
        const applications = Array.isArray(state?.applications)
          ? state.applications.map(normalizeApplication)
          : []
        const views = Array.isArray(state?.views) ? state.views : []
        const goal = typeof state?.goal === 'number' ? state.goal : DEFAULT_GOAL
        return { applications, views, goal }
      },
    },
  ),
)

crossOriginStorage.onUpdate((key) => {
  if (key !== STORAGE_KEY) return
  const raw = crossOriginStorage.getItem(STORAGE_KEY)
  if (raw == null) return
  try {
    const parsed = JSON.parse(raw) as {
      state?: { applications?: Application[]; views?: SavedView[]; goal?: number }
    }
    if (parsed.state && Array.isArray(parsed.state.applications)) {
      useJobsStore.setState({
        applications: parsed.state.applications.map(normalizeApplication),
        views: Array.isArray(parsed.state.views) ? parsed.state.views : [],
        goal: typeof parsed.state.goal === 'number' ? parsed.state.goal : DEFAULT_GOAL,
      })
    }
  } catch {
    // ignore corrupt remote payloads
  }
})
