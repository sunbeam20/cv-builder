import { useResumeStore } from '../../store/resumeStore'
import { uid } from '../../lib/helpers'
import { Field, TextArea, TextInput } from '../ui/inputs'
import { SectionCard } from '../ui/SectionCard'
import { EntryCard } from '../ui/EntryCard'
import { BulletsEditor } from '../ui/ListEditors'
import { SortableItem, SortableList } from '../ui/SortableList'

export function ProjectsForm() {
  const projects = useResumeStore((s) => s.resume.projects)
  const update = useResumeStore((s) => s.update)

  const reorder = (from: number, to: number) =>
    update((d) => {
      const [item] = d.projects.splice(from, 1)
      d.projects.splice(to, 0, item)
    })

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
      {projects.length === 0 ? (
        <p className="text-xs text-slate-400 dark:text-slate-500">No projects yet. Click “Add project”.</p>
      ) : (
        <SortableList ids={projects.map((p) => p.id)} onReorder={reorder}>
          <div className="flex flex-col gap-3">
            {projects.map((project, index) => (
              <SortableItem key={project.id} id={project.id} label={project.name || 'project'}>
                {(handle) => (
                  <EntryCard
                    handle={handle}
                    title={project.name}
                    subtitle={project.link}
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
                          onChange={(e) =>
                            update((d) => void (d.projects[index].name = e.target.value))
                          }
                        />
                      </Field>
                      <Field label="Link">
                        <TextInput
                          value={project.link}
                          placeholder="github.com/you/project"
                          onChange={(e) =>
                            update((d) => void (d.projects[index].link = e.target.value))
                          }
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
                      aiContext={project.name}
                      onChange={(bullets) =>
                        update((d) => void (d.projects[index].bullets = bullets))
                      }
                    />
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
