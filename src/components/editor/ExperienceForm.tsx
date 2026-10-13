import { useResumeStore } from '../../store/resumeStore'
import { uid } from '../../lib/helpers'
import { Field, TextInput } from '../ui/inputs'
import { SectionCard } from '../ui/SectionCard'
import { EntryCard } from '../ui/EntryCard'
import { BulletsEditor } from '../ui/ListEditors'

export function ExperienceForm() {
  const experience = useResumeStore((s) => s.resume.experience)
  const update = useResumeStore((s) => s.update)

  const move = (index: number, dir: -1 | 1) => {
    update((d) => {
      const target = index + dir
      if (target < 0 || target >= d.experience.length) return
      const [item] = d.experience.splice(index, 1)
      d.experience.splice(target, 0, item)
    })
  }

  return (
    <SectionCard
      title="Experience"
      count={experience.length}
      addLabel="Add role"
      onAdd={() =>
        update((d) => {
          d.experience.push({
            id: uid(),
            company: '',
            role: '',
            location: '',
            start: '',
            end: '',
            current: false,
            bullets: [''],
          })
        })
      }
    >
      <div className="flex flex-col gap-3">
        {experience.map((exp, index) => (
          <EntryCard
            key={exp.id}
            title={exp.role || exp.company}
            subtitle={exp.company}
            canMoveUp={index > 0}
            canMoveDown={index < experience.length - 1}
            onMoveUp={() => move(index, -1)}
            onMoveDown={() => move(index, 1)}
            onRemove={() =>
              update((d) => {
                d.experience.splice(index, 1)
              })
            }
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Job title">
                <TextInput
                  value={exp.role}
                  onChange={(e) => update((d) => void (d.experience[index].role = e.target.value))}
                />
              </Field>
              <Field label="Company">
                <TextInput
                  value={exp.company}
                  onChange={(e) =>
                    update((d) => void (d.experience[index].company = e.target.value))
                  }
                />
              </Field>
              <Field label="Location">
                <TextInput
                  value={exp.location}
                  placeholder="Remote / City, ST"
                  onChange={(e) =>
                    update((d) => void (d.experience[index].location = e.target.value))
                  }
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start">
                  <TextInput
                    value={exp.start}
                    placeholder="Mar 2021"
                    onChange={(e) =>
                      update((d) => void (d.experience[index].start = e.target.value))
                    }
                  />
                </Field>
                <Field label="End">
                  <TextInput
                    value={exp.end}
                    placeholder="Feb 2023"
                    disabled={exp.current}
                    onChange={(e) => update((d) => void (d.experience[index].end = e.target.value))}
                  />
                </Field>
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <input
                type="checkbox"
                checked={exp.current}
                onChange={(e) =>
                  update((d) => void (d.experience[index].current = e.target.checked))
                }
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400"
              />
              I currently work here
            </label>
            <BulletsEditor
              bullets={exp.bullets}
              onChange={(bullets) =>
                update((d) => void (d.experience[index].bullets = bullets))
              }
            />
          </EntryCard>
        ))}
        {experience.length === 0 ? (
          <p className="text-xs text-slate-400">No roles yet. Click “Add role”.</p>
        ) : null}
      </div>
    </SectionCard>
  )
}
