import { useRef } from 'react'
import { Toolbar } from './components/Toolbar'
import { AiSettingsModal } from './components/ui/AiSettingsModal'
import { EditorPanel } from './components/editor/EditorPanel'
import { ResumePreview } from './preview/ResumePreview'
import { useResumeStore } from './store/resumeStore'
import { TEMPLATES } from './lib/templates'

export default function App() {
  const resume = useResumeStore((s) => s.resume)
  const template = useResumeStore((s) => s.template)
  const pageRef = useRef<HTMLDivElement>(null)

  return (
    <div className="min-h-screen">
      <Toolbar pageRef={pageRef} />
      <main className="mx-auto grid max-w-[1600px] grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="no-print thin-scroll lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto lg:pr-2">
          <EditorPanel />
        </div>
        <div className="preview-col thin-scroll lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto lg:px-1">
          <ResumePreview resume={resume} pageRef={pageRef} theme={TEMPLATES[template]} />
        </div>
      </main>
      <AiSettingsModal />
    </div>
  )
}
