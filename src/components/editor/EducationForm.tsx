import { useResumeStore } from '../../store/resumeStore'
import { uid } from '../../lib/helpers'
import { Field, TextArea, TextInput } from '../ui/inputs'
import { SectionCard } from '../ui/SectionCard'
import { EntryCard } from '../ui/EntryCard'

export function EducationForm() {
  const education = useResumeStore((s) => s.resume.education)
  const update = useResumeStore((s) => s.update)

  const move = (index: number, dir: -1 | 1) => {
    update((d) => {
      const target = index + dir
      if (target < 0 || target >= d.education.length) return
      const [item] = d.education.splice(index, 1)
      d.education.splice(target, 0, item)
    })
  }

  return (
    <SectionCard
      title="Education"
      count={education.length}
      addLabel="Add education"
      onAdd={() =>
        update((d) => {
          d.education.push({
            id: uid(),
            school: '',
            degree: '',
            field: '',
            location: '',
            start: '',
            end: '',
            details: '',
          })
        })
      }
    >
      <div className="flex flex-col gap-3">
        {education.map((edu, index) => (
          <EntryCard
            key={edu.id}
            title={edu.school || edu.degree}
            subtitle={edu.field}
            canMoveUp={index > 0}
            canMoveDown={index < education.length - 1}
            onMoveUp={() => move(index, -1)}
            onMoveDown={() => move(index, 1)}
            onRemove={() =>
              update((d) => {
                d.education.splice(index, 1)
              })
            }
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="School" className="sm:col-span-2">
                <TextInput
                  value={edu.school}
                  onChange={(e) => update((d) => void (d.education[index].school = e.target.value))}
                />
              </Field>
              <Field label="Degree">
                <TextInput
                  value={edu.degree}
                  placeholder="B.S."
                  onChange={(e) => update((d) => void (d.education[index].degree = e.target.value))}
                />
              </Field>
              <Field label="Field of study">
                <TextInput
                  value={edu.field}
                  placeholder="Computer Science"
                  onChange={(e) => update((d) => void (d.education[index].field = e.target.value))}
                />
              </Field>
              <Field label="Location">
                <TextInput
                  value={edu.location}
                  onChange={(e) =>
                    update((d) => void (d.education[index].location = e.target.value))
                  }
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start">
                  <TextInput
                    value={edu.start}
                    placeholder="2014"
                    onChange={(e) => update((d) => void (d.education[index].start = e.target.value))}
                  />
                </Field>
                <Field label="End">
                  <TextInput
                    value={edu.end}
                    placeholder="2018"
                    onChange={(e) => update((d) => void (d.education[index].end = e.target.value))}
                  />
                </Field>
              </div>
            </div>
            <Field label="Details (optional)">
              <TextArea
                rows={2}
                value={edu.details}
                onChange={(e) => update((d) => void (d.education[index].details = e.target.value))}
              />
            </Field>
          </EntryCard>
        ))}
        {education.length === 0 ? (
          <p className="text-xs text-slate-400">No education yet. Click “Add education”.</p>
        ) : null}
      </div>
    </SectionCard>
  )
}
