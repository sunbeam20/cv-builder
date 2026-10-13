import { Wand2 } from 'lucide-react'
import { useResumeStore } from '../../store/resumeStore'
import { buildCoverLetterDraft } from '../../lib/coverLetter'
import { Field, TextArea, TextInput } from '../ui/inputs'
import { SectionCard } from '../ui/SectionCard'
import { AiButton } from '../ui/AiButton'

export function CoverLetterForm() {
  const coverLetter = useResumeStore((s) => s.coverLetter)
  const resume = useResumeStore((s) => s.resume)
  const updateCoverLetter = useResumeStore((s) => s.updateCoverLetter)

  const generate = () =>
    updateCoverLetter((d) => {
      d.body = buildCoverLetterDraft(resume, d)
    })

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Cover letter">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Company" className="sm:col-span-2">
            <TextInput
              value={coverLetter.company}
              placeholder="Acme Inc."
              onChange={(e) => updateCoverLetter((d) => void (d.company = e.target.value))}
            />
          </Field>
          <Field label="Role / target title">
            <TextInput
              value={coverLetter.role}
              placeholder="Senior Frontend Engineer"
              onChange={(e) => updateCoverLetter((d) => void (d.role = e.target.value))}
            />
          </Field>
          <Field label="Hiring manager (optional)">
            <TextInput
              value={coverLetter.recipient}
              placeholder="Jane Doe"
              onChange={(e) => updateCoverLetter((d) => void (d.recipient = e.target.value))}
            />
          </Field>
          <Field label="Date">
            <TextInput
              value={coverLetter.date}
              onChange={(e) => updateCoverLetter((d) => void (d.date = e.target.value))}
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Body">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={generate}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <Wand2 size={13} />
            Generate from résumé
          </button>
          <AiButton
            text={coverLetter.body}
            instruction="Rewrite this cover letter body to be compelling and concise, keeping 3 short paragraphs."
            context={`Applying for ${coverLetter.role || 'the role'} at ${coverLetter.company || 'the company'}`}
            onResult={(text) => updateCoverLetter((d) => void (d.body = text))}
          />
        </div>

        <div className="flex flex-col gap-3">
          <Field label="Greeting">
            <TextInput
              value={coverLetter.greeting}
              onChange={(e) => updateCoverLetter((d) => void (d.greeting = e.target.value))}
            />
          </Field>
          <Field label="Body" hint="Separate paragraphs with a blank line.">
            <TextArea
              rows={12}
              value={coverLetter.body}
              placeholder="I am writing to express my interest in…"
              onChange={(e) => updateCoverLetter((d) => void (d.body = e.target.value))}
            />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Closing">
              <TextInput
                value={coverLetter.closing}
                onChange={(e) => updateCoverLetter((d) => void (d.closing = e.target.value))}
              />
            </Field>
            <Field label="Signature">
              <TextInput
                value={coverLetter.signature}
                onChange={(e) => updateCoverLetter((d) => void (d.signature = e.target.value))}
              />
            </Field>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
