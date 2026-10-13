import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Draft } from 'immer'
import type { Resume } from '../types'
import type { TemplateId } from '../lib/templates'
import { DEFAULT_SECTION_ORDER, emptyResume } from '../lib/helpers'
import { DEFAULT_AI_SETTINGS, type AiSettings } from '../lib/ai'
import { sampleResume } from '../lib/sampleData'

interface ResumeState {
  resume: Resume
  template: TemplateId
  ai: AiSettings
  aiSettingsOpen: boolean
  update: (recipe: (draft: Draft<Resume>) => void) => void
  replace: (resume: Resume) => void
  loadSample: () => void
  reset: () => void
  setTemplate: (template: TemplateId) => void
  moveSection: (from: number, to: number) => void
  setAi: (patch: Partial<AiSettings>) => void
  openAiSettings: () => void
  closeAiSettings: () => void
}

export const useResumeStore = create<ResumeState>()(
  persist(
    immer((set) => ({
      resume: sampleResume(),
      template: 'ats',
      ai: { ...DEFAULT_AI_SETTINGS },
      aiSettingsOpen: false,
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
      setAi: (patch) =>
        set((state) => {
          Object.assign(state.ai, patch)
        }),
      openAiSettings: () =>
        set((state) => {
          state.aiSettingsOpen = true
        }),
      closeAiSettings: () =>
        set((state) => {
          state.aiSettingsOpen = false
        }),
    })),
    {
      name: 'cv-builder-v1',
      version: 2,
      partialize: (state) => ({
        resume: state.resume,
        template: state.template,
        ai: state.ai,
      }),
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
