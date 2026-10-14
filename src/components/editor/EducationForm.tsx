import { useResumeStore } from '../../store/resumeStore'
import { uid } from '../../lib/helpers'
import { Field, TextArea, TextInput } from '../ui/inputs'
import { SectionCard } from '../ui/SectionCard'
import { EntryCard } from '../ui/EntryCard'
import { SortableItem, SortableList } from '../ui/SortableList'

export function EducationForm() {
  const education = useResumeStore((s) => s.resume.education)
  const update = useResumeStore((s) => s.update)

  const reorder = (from: number, to: number) =>
    update((d) => {
      const [item] = d.education.splice(from, 1)
      d.education.splice(to, 0, item)
    })

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
      {education.length === 0 ? (
        <p className="text-xs text-slate-400 dark:text-slate-500">No education yet. Click “Add education”.</p>
      ) : (
        <SortableList ids={education.map((e) => e.id)} onReorder={reorder}>
          <div className="flex flex-col gap-3">
            {education.map((edu, index) => (
              <SortableItem key={edu.id} id={edu.id} label={edu.school || edu.degree || 'education'}>
                {(handle) => (
                  <EntryCard
                    handle={handle}
                    title={edu.school || edu.degree}
                    subtitle={edu.field}
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
                          onChange={(e) =>
                            update((d) => void (d.education[index].school = e.target.value))
                          }
                        />
                      </Field>
                      <Field label="Degree">
                        <TextInput
                          value={edu.degree}
                          placeholder="B.S."
                          onChange={(e) =>
                            update((d) => void (d.education[index].degree = e.target.value))
                          }
                        />
                      </Field>
                      <Field label="Field of study">
                        <TextInput
                          value={edu.field}
                          placeholder="Computer Science"
                          onChange={(e) =>
                            update((d) => void (d.education[index].field = e.target.value))
                          }
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
                            onChange={(e) =>
                              update((d) => void (d.education[index].start = e.target.value))
                            }
                          />
                        </Field>
                        <Field label="End">
                          <TextInput
                            value={edu.end}
                            placeholder="2018"
                            onChange={(e) =>
                              update((d) => void (d.education[index].end = e.target.value))
                            }
                          />
                        </Field>
                      </div>
                    </div>
                    <Field label="Details (optional)">
                      <TextArea
                        rows={2}
                        value={edu.details}
                        onChange={(e) =>
                          update((d) => void (d.education[index].details = e.target.value))
                        }
                      />
                    </Field>
                  </EntryCard>
                )}
              </SortableItem>
            ))}
          </div>
        </SortableList>
      )}
    </SectionCard>
  )
}
