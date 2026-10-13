import { useResumeStore } from '../../store/resumeStore'
import { uid } from '../../lib/helpers'
import { Field, TextArea, TextInput } from '../ui/inputs'
import { SectionCard } from '../ui/SectionCard'
import { EntryCard } from '../ui/EntryCard'
import { BulletsEditor } from '../ui/ListEditors'

export function ProjectsForm() {
  const projects = useResumeStore((s) => s.resume.projects)
  const update = useResumeStore((s) => s.update)

  const move = (index: number, dir: -1 | 1) => {
    update((d) => {
      const target = index + dir
      if (target < 0 || target >= d.projects.length) return
      const [item] = d.projects.splice(index, 1)
      d.projects.splice(target, 0, item)
    })
  }

  return (
    <SectionCard
      title="Projects"
      count={projects.length}
      addLabel="Add project"
      onAdd={() =>
        update((d) => {
          d.projects.push({ id: uid(), name: '', link: '', description: '', bullets: [''] })
        })
      }
    >
      <div className="flex flex-col gap-3">
        {projects.map((project, index) => (
          <EntryCard
            key={project.id}
            title={project.name}
            subtitle={project.link}
            canMoveUp={index > 0}
            canMoveDown={index < projects.length - 1}
            onMoveUp={() => move(index, -1)}
            onMoveDown={() => move(index, 1)}
            onRemove={() =>
              update((d) => {
                d.projects.splice(index, 1)
              })
            }
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Name">
                <TextInput
                  value={project.name}
                  onChange={(e) => update((d) => void (d.projects[index].name = e.target.value))}
                />
              </Field>
              <Field label="Link">
                <TextInput
                  value={project.link}
                  placeholder="github.com/you/project"
                  onChange={(e) => update((d) => void (d.projects[index].link = e.target.value))}
                />
              </Field>
            </div>
            <Field label="Description">
              <TextArea
                rows={2}
                value={project.description}
                onChange={(e) =>
                  update((d) => void (d.projects[index].description = e.target.value))
                }
              />
            </Field>
            <BulletsEditor
              bullets={project.bullets}
              onChange={(bullets) => update((d) => void (d.projects[index].bullets = bullets))}
            />
          </EntryCard>
        ))}
        {projects.length === 0 ? (
          <p className="text-xs text-slate-400">No projects yet. Click “Add project”.</p>
        ) : null}
      </div>
    </SectionCard>
  )
}
