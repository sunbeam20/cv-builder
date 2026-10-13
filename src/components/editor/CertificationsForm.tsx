import { useResumeStore } from '../../store/resumeStore'
import { uid } from '../../lib/helpers'
import { Field, TextInput } from '../ui/inputs'
import { SectionCard } from '../ui/SectionCard'
import { EntryCard } from '../ui/EntryCard'

export function CertificationsForm() {
  const certifications = useResumeStore((s) => s.resume.certifications)
  const update = useResumeStore((s) => s.update)

  return (
    <SectionCard
      title="Certifications"
      count={certifications.length}
      addLabel="Add"
      onAdd={() =>
        update((d) => {
          d.certifications.push({ id: uid(), name: '', issuer: '', date: '', link: '' })
        })
      }
    >
      <div className="flex flex-col gap-3">
        {certifications.map((cert, index) => (
          <EntryCard
            key={cert.id}
            title={cert.name}
            subtitle={cert.issuer}
            onRemove={() =>
              update((d) => {
                d.certifications.splice(index, 1)
              })
            }
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Name" className="sm:col-span-2">
                <TextInput
                  value={cert.name}
                  onChange={(e) =>
                    update((d) => void (d.certifications[index].name = e.target.value))
                  }
                />
              </Field>
              <Field label="Issuer">
                <TextInput
                  value={cert.issuer}
                  onChange={(e) =>
                    update((d) => void (d.certifications[index].issuer = e.target.value))
                  }
                />
              </Field>
              <Field label="Date">
                <TextInput
                  value={cert.date}
                  placeholder="2022"
                  onChange={(e) =>
                    update((d) => void (d.certifications[index].date = e.target.value))
                  }
                />
              </Field>
              <Field label="Link" className="sm:col-span-2">
                <TextInput
                  value={cert.link}
                  onChange={(e) =>
                    update((d) => void (d.certifications[index].link = e.target.value))
                  }
                />
              </Field>
            </div>
          </EntryCard>
        ))}
        {certifications.length === 0 ? (
          <p className="text-xs text-slate-400">No certifications yet.</p>
        ) : null}
      </div>
    </SectionCard>
  )
}
