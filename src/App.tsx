import { useRef } from 'react'
import { Toolbar } from './components/Toolbar'
import { AiSettingsModal } from './components/ui/AiSettingsModal'
import { EditorPanel } from './components/editor/EditorPanel'
import { CoverLetterForm } from './components/editor/CoverLetterForm'
import { ResumePreview } from './preview/ResumePreview'
import { CoverLetterPreview } from './preview/CoverLetterPreview'
import { useResumeStore } from './store/resumeStore'
import { TEMPLATES } from './lib/templates'

export default function App() {
  const resume = useResumeStore((s) => s.resume)
  const coverLetter = useResumeStore((s) => s.coverLetter)
  const template = useResumeStore((s) => s.template)
  const docType = useResumeStore((s) => s.docType)
  const pageRef = useRef<HTMLDivElement>(null)

  const theme = TEMPLATES[template]

  return (
    <div className="min-h-screen">
      <Toolbar pageRef={pageRef} />
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
      <AiSettingsModal />
    </div>
  )
}
