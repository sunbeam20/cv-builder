import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Draft } from 'immer'
import type { Resume } from '../types'
import type { TemplateId } from '../lib/templates'
import { emptyResume } from '../lib/helpers'
import { sampleResume } from '../lib/sampleData'

interface ResumeState {
  resume: Resume
  template: TemplateId
  update: (recipe: (draft: Draft<Resume>) => void) => void
  replace: (resume: Resume) => void
  loadSample: () => void
  reset: () => void
  setTemplate: (template: TemplateId) => void
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
    })),
    {
      name: 'cv-builder-v1',
      version: 1,
    },
  ),
)
