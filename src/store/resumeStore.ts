import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Draft } from 'immer'
import type { CoverLetter, DocType, Resume, SectionId } from '../types'
import type { TemplateId } from '../lib/templates'
import { DEFAULT_SECTION_ORDER, emptyResume } from '../lib/helpers'
import { DEFAULT_AI_SETTINGS, type AiSettings } from '../lib/ai'
import { emptyCoverLetter } from '../lib/coverLetter'
import { sampleResume } from '../lib/sampleData'

const initialResume = sampleResume()

interface ResumeState {
  resume: Resume
  coverLetter: CoverLetter
  template: TemplateId
  docType: DocType
  ai: AiSettings
  aiSettingsOpen: boolean
  update: (recipe: (draft: Draft<Resume>) => void) => void
  replace: (resume: Resume) => void
  loadSample: () => void
  reset: () => void
  setTemplate: (template: TemplateId) => void
  setDocType: (docType: DocType) => void
  moveSection: (from: number, to: number) => void
  toggleSection: (id: SectionId) => void
  updateCoverLetter: (recipe: (draft: Draft<CoverLetter>) => void) => void
  setCoverLetter: (letter: CoverLetter) => void
  setAi: (patch: Partial<AiSettings>) => void
  openAiSettings: () => void
  closeAiSettings: () => void
}

export const useResumeStore = create<ResumeState>()(
  persist(
    immer((set) => ({
      resume: initialResume,
      coverLetter: emptyCoverLetter(initialResume.profile),
      template: 'ats',
      docType: 'resume',
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
          const next = sampleResume()
          state.resume = next
          state.coverLetter = emptyCoverLetter(next.profile)
        }),
      reset: () =>
        set((state) => {
          const next = emptyResume() as Resume
          state.resume = next
          state.coverLetter = emptyCoverLetter(next.profile)
        }),
      setTemplate: (template) =>
        set((state) => {
          state.template = template
        }),
      setDocType: (docType) =>
        set((state) => {
          state.docType = docType
        }),
      moveSection: (from, to) =>
        set((state) => {
          const order = state.resume.sectionOrder
          if (from === to || from < 0 || to < 0 || from >= order.length || to >= order.length) {
            return
          }
          const [item] = order.splice(from, 1)
          order.splice(to, 0, item)
        }),
      toggleSection: (id) =>
        set((state) => {
          const hidden = state.resume.hiddenSections
          const index = hidden.indexOf(id)
          if (index === -1) hidden.push(id)
          else hidden.splice(index, 1)
        }),
      updateCoverLetter: (recipe) =>
        set((state) => {
          recipe(state.coverLetter)
        }),
      setCoverLetter: (letter) =>
        set((state) => {
          state.coverLetter = letter
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
      version: 3,
      partialize: (state) => ({
        resume: state.resume,
        coverLetter: state.coverLetter,
        template: state.template,
        ai: state.ai,
      }),
      migrate: (persisted, version) => {
        const state = persisted as Partial<ResumeState> | undefined
        if (state?.resume) {
          if (!state.resume.sectionOrder) {
            state.resume.sectionOrder = [...DEFAULT_SECTION_ORDER]
          }
          if (!state.resume.hiddenSections) {
            state.resume.hiddenSections = []
          }
          if (!state.coverLetter) {
            state.coverLetter = emptyCoverLetter(state.resume.profile)
          }
        }
        void version
        return state as ResumeState
      },
    },
  ),
)
