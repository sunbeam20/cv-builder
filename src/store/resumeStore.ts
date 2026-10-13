import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Draft } from 'immer'
import type { Resume } from '../types'
import type { TemplateId } from '../lib/templates'
import { DEFAULT_SECTION_ORDER, emptyResume } from '../lib/helpers'
import { sampleResume } from '../lib/sampleData'

interface ResumeState {
  resume: Resume
  template: TemplateId
  update: (recipe: (draft: Draft<Resume>) => void) => void
  replace: (resume: Resume) => void
  loadSample: () => void
  reset: () => void
  setTemplate: (template: TemplateId) => void
  moveSection: (from: number, to: number) => void
}

export const useResumeStore = create<ResumeState>()(
  persist(
    immer((set) => ({
      resume: sampleResume(),
      template: 'ats',
      update: (recipe) =>
        set((state) => {
          recipe(state.resume)
        }),
      replace: (resume) =>
        set((state) => {
          state.resume = resume
        }),
      loadSample: () =>
        set((state) => {
          state.resume = sampleResume()
        }),
      reset: () =>
        set((state) => {
          state.resume = emptyResume() as Resume
        }),
      setTemplate: (template) =>
        set((state) => {
          state.template = template
        }),
      moveSection: (from, to) =>
        set((state) => {
          const order = state.resume.sectionOrder
          if (
            from === to ||
            from < 0 ||
            to < 0 ||
            from >= order.length ||
            to >= order.length
          ) {
            return
          }
          const [item] = order.splice(from, 1)
          order.splice(to, 0, item)
        }),
    })),
    {
      name: 'cv-builder-v1',
      version: 2,
      migrate: (persisted, version) => {
        const state = persisted as Partial<ResumeState> | undefined
        if (version < 2 && state?.resume && !state.resume.sectionOrder) {
          state.resume.sectionOrder = [...DEFAULT_SECTION_ORDER]
        }
        return state as ResumeState
      },
    },
  ),
)
