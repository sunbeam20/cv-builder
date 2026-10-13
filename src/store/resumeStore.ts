import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Draft } from 'immer'
import type { Application, CoverLetter, DocType, Resume, SectionId } from '../types'
import type { Customization, DesignPreset, TemplateId } from '../lib/templates'
import { DEFAULT_SECTION_ORDER, emptyResume, uid } from '../lib/helpers'
import { DEFAULT_AI_SETTINGS, type AiSettings } from '../lib/ai'
import { emptyCoverLetter } from '../lib/coverLetter'
import { sampleResume } from '../lib/sampleData'
import { crossOriginStorage } from '../lib/crossOrigin'

export const STORAGE_KEY = 'cv-builder-v1'

const initialResume = sampleResume()

const HISTORY_LIMIT = 60
const COALESCE_MS = 400
let lastEditAt = 0

interface ResumeState {
  resume: Resume
  coverLetter: CoverLetter
  applications: Application[]
  template: TemplateId
  customization: Customization
  customPresets: DesignPreset[]
  docType: DocType
  ai: AiSettings
  aiSettingsOpen: boolean
  designOpen: boolean
  past: Resume[]
  future: Resume[]
  update: (recipe: (draft: Draft<Resume>) => void) => void
  replace: (resume: Resume) => void
  loadSample: () => void
  reset: () => void
  undo: () => void
  redo: () => void
  setTemplate: (template: TemplateId) => void
  setCustomization: (patch: Customization) => void
  resetCustomization: () => void
  saveCustomPreset: (name: string) => void
  removeCustomPreset: (id: string) => void
  openDesign: () => void
  closeDesign: () => void
  setDocType: (docType: DocType) => void
  moveSection: (from: number, to: number) => void
  toggleSection: (id: SectionId) => void
  updateCoverLetter: (recipe: (draft: Draft<CoverLetter>) => void) => void
  setCoverLetter: (letter: CoverLetter) => void
  addApplication: (application: Application) => void
  updateApplication: (id: string, recipe: (draft: Draft<Application>) => void) => void
  removeApplication: (id: string) => void
  setApplications: (applications: Application[]) => void
  setAi: (patch: Partial<AiSettings>) => void
  openAiSettings: () => void
  closeAiSettings: () => void
}

export const useResumeStore = create<ResumeState>()(
  persist(
    immer((set, get) => {
      const applyResumeEdit = (
        mutator: (draft: Draft<Resume>) => void,
        coalesce = false,
      ) => {
        const prev = get().resume
        set((state) => {
          const now = Date.now()
          if (!coalesce || now - lastEditAt > COALESCE_MS) {
            state.past.push(prev)
            if (state.past.length > HISTORY_LIMIT) state.past.shift()
          }
          lastEditAt = now
          state.future.length = 0
          mutator(state.resume)
        })
      }

      const clearHistory = () => {
        lastEditAt = 0
        set((state) => {
          state.past.length = 0
          state.future.length = 0
        })
      }

      return {
        resume: initialResume,
        coverLetter: emptyCoverLetter(initialResume.profile),
        applications: [],
        template: 'ats',
        customization: {},
        customPresets: [],
        docType: 'resume',
        ai: { ...DEFAULT_AI_SETTINGS },
        aiSettingsOpen: false,
        designOpen: false,
        past: [],
        future: [],
        update: (recipe) => applyResumeEdit(recipe, true),
        replace: (resume) => {
          set((state) => {
            state.resume = resume
          })
          clearHistory()
        },
        loadSample: () => {
          set((state) => {
            const next = sampleResume()
            state.resume = next
            state.coverLetter = emptyCoverLetter(next.profile)
          })
          clearHistory()
        },
        reset: () => {
          set((state) => {
            const next = emptyResume() as Resume
            state.resume = next
            state.coverLetter = emptyCoverLetter(next.profile)
          })
          clearHistory()
        },
        undo: () => {
          const { past } = get()
          if (past.length === 0) return
          lastEditAt = 0
          set((state) => {
            const previous = state.past.pop()
            if (!previous) return
            state.future.push(state.resume)
            state.resume = previous
          })
        },
        redo: () => {
          const { future } = get()
          if (future.length === 0) return
          lastEditAt = 0
          set((state) => {
            const next = state.future.pop()
            if (!next) return
            state.past.push(state.resume)
            state.resume = next
          })
        },
        setTemplate: (template) =>
          set((state) => {
            state.template = template
            state.customization = {}
          }),
        setCustomization: (patch) =>
          set((state) => {
            Object.assign(state.customization, patch)
          }),
        resetCustomization: () =>
          set((state) => {
            state.customization = {}
          }),
        saveCustomPreset: (name) =>
          set((state) => {
            state.customPresets.push({
              id: uid(),
              name: name.trim() || 'My preset',
              customization: { ...state.customization },
            })
          }),
        removeCustomPreset: (id) =>
          set((state) => {
            const index = state.customPresets.findIndex((p) => p.id === id)
            if (index !== -1) state.customPresets.splice(index, 1)
          }),
        openDesign: () =>
          set((state) => {
            state.designOpen = true
          }),
        closeDesign: () =>
          set((state) => {
            state.designOpen = false
          }),
        setDocType: (docType) =>
          set((state) => {
            state.docType = docType
          }),
        moveSection: (from, to) => {
          const { sectionOrder } = get().resume
          if (
            from === to ||
            from < 0 ||
            to < 0 ||
            from >= sectionOrder.length ||
            to >= sectionOrder.length
          ) {
            return
          }
          applyResumeEdit((draft) => {
            const [item] = draft.sectionOrder.splice(from, 1)
            draft.sectionOrder.splice(to, 0, item)
          })
        },
        toggleSection: (id) =>
          applyResumeEdit((draft) => {
            const hidden = draft.hiddenSections
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
        addApplication: (application) =>
          set((state) => {
            state.applications.unshift(application)
          }),
        updateApplication: (id, recipe) =>
          set((state) => {
            const application = state.applications.find((a) => a.id === id)
            if (application) recipe(application)
          }),
        removeApplication: (id) =>
          set((state) => {
            const index = state.applications.findIndex((a) => a.id === id)
            if (index !== -1) state.applications.splice(index, 1)
          }),
        setApplications: (applications) =>
          set((state) => {
            state.applications = applications
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
      }
    }),
    {
      name: STORAGE_KEY,
      version: 6,
      storage: createJSONStorage(() => crossOriginStorage),
      partialize: (state) => ({
        resume: state.resume,
        coverLetter: state.coverLetter,
        applications: state.applications,
        template: state.template,
        customization: state.customization,
        customPresets: state.customPresets,
        ai: state.ai,
      }),
      migrate: (persisted, version) => {
        const state = persisted as Partial<ResumeState> | undefined
        if (state && !state.applications) {
          state.applications = []
        }
        if (state && !state.customization) {
          state.customization = {}
        }
        if (state && !state.customPresets) {
          state.customPresets = []
        }
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

crossOriginStorage.onUpdate((key) => {
  if (key !== STORAGE_KEY) return
  const raw = crossOriginStorage.getItem(STORAGE_KEY)
  if (raw == null) return
  try {
    const parsed = JSON.parse(raw) as { state?: Partial<ResumeState> }
    if (parsed.state) useResumeStore.setState(parsed.state)
  } catch {
    // ignore corrupt remote payloads
  }
})
