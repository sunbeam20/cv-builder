import { useEffect, useRef, useState } from 'react'
import { Eye, PencilLine } from 'lucide-react'
import { Toolbar } from './components/Toolbar'
import { AiSettingsModal } from './components/ui/AiSettingsModal'
import { DesignPanel } from './components/ui/DesignPanel'
import { EditorPanel } from './components/editor/EditorPanel'
import { ResumePreview } from './preview/ResumePreview'
import { useResumeStore } from './store/resumeStore'
import { useResolvedTheme } from './lib/useResolvedTheme'

export default function App() {
  const resume = useResumeStore((s) => s.resume)
  const undo = useResumeStore((s) => s.undo)
  const redo = useResumeStore((s) => s.redo)
  const pageRef = useRef<HTMLDivElement>(null)
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit')

  const theme = useResolvedTheme()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const el = document.activeElement
      const typing =
        el instanceof HTMLElement &&
        (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
      if (typing) return
      if (!(event.ctrlKey || event.metaKey)) return

      const key = event.key.toLowerCase()
      if (key === 'z') {
        event.preventDefault()
        if (event.shiftKey) redo()
        else undo()
      } else if (key === 'y') {
        event.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [undo, redo])

  return (
    <div className="min-h-screen">
      <Toolbar pageRef={pageRef} />
      <main className="mx-auto max-w-[1600px] px-4 py-6">
          <div className="mb-4 flex justify-center no-print lg:hidden">
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5 shadow-sm">
              <button
                type="button"
                aria-pressed={mobileView === 'edit'}
                onClick={() => setMobileView('edit')}
                className={`inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-medium transition ${
                  mobileView === 'edit'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <PencilLine size={14} />
                Edit
              </button>
              <button
                type="button"
                aria-pressed={mobileView === 'preview'}
                onClick={() => setMobileView('preview')}
                className={`inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-medium transition ${
                  mobileView === 'preview'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Eye size={14} />
                Preview
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            <div
              className={`no-print thin-scroll lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto lg:pr-2 ${
                mobileView === 'preview' ? 'hidden lg:block' : ''
              }`}
            >
              <EditorPanel />
            </div>
            <div
              className={`preview-col thin-scroll lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto lg:px-1 ${
                mobileView === 'edit' ? 'hidden lg:block' : ''
              }`}
            >
              <ResumePreview resume={resume} pageRef={pageRef} theme={theme} />
            </div>
          </div>
      </main>
      <AiSettingsModal />
      <DesignPanel />
    </div>
  )
}
