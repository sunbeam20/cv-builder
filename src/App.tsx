import { useEffect, useRef } from 'react'
import { Toolbar } from './components/Toolbar'
import { AiSettingsModal } from './components/ui/AiSettingsModal'
import { DesignPanel } from './components/ui/DesignPanel'
import { EditorPanel } from './components/editor/EditorPanel'
import { CoverLetterForm } from './components/editor/CoverLetterForm'
import { TrackerView } from './components/tracker/TrackerView'
import { ResumePreview } from './preview/ResumePreview'
import { CoverLetterPreview } from './preview/CoverLetterPreview'
import { useResumeStore } from './store/resumeStore'
import { useResolvedTheme } from './lib/useResolvedTheme'

export default function App() {
  const resume = useResumeStore((s) => s.resume)
  const coverLetter = useResumeStore((s) => s.coverLetter)
  const docType = useResumeStore((s) => s.docType)
  const undo = useResumeStore((s) => s.undo)
  const redo = useResumeStore((s) => s.redo)
  const pageRef = useRef<HTMLDivElement>(null)

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
      {docType === 'tracker' ? (
        <main className="mx-auto max-w-[1600px] px-4 py-6">
          <TrackerView />
        </main>
      ) : (
        <main className="mx-auto grid max-w-[1600px] grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <div className="no-print thin-scroll lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto lg:pr-2">
            {docType === 'resume' ? <EditorPanel /> : <CoverLetterForm />}
          </div>
          <div className="preview-col thin-scroll lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto lg:px-1">
            {docType === 'resume' ? (
              <ResumePreview resume={resume} pageRef={pageRef} theme={theme} />
            ) : (
              <CoverLetterPreview
                letter={coverLetter}
                profile={resume.profile}
                pageRef={pageRef}
                theme={theme}
              />
            )}
          </div>
        </main>
      )}
      <AiSettingsModal />
      <DesignPanel />
    </div>
  )
}
