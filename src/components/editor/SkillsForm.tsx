import { useResumeStore } from '../../store/resumeStore'
import { uid } from '../../lib/helpers'
import { Field, TextInput } from '../ui/inputs'
import { SectionCard } from '../ui/SectionCard'
import { EntryCard } from '../ui/EntryCard'
import { SortableItem, SortableList } from '../ui/SortableList'

export function SkillsForm() {
  const skills = useResumeStore((s) => s.resume.skills)
  const update = useResumeStore((s) => s.update)

  const reorder = (from: number, to: number) =>
    update((d) => {
      const [item] = d.skills.splice(from, 1)
      d.skills.splice(to, 0, item)
    })

  return (
    <SectionCard
      title="Skills"
      count={skills.length}
      addLabel="Add group"
      onAdd={() =>
        update((d) => {
          d.skills.push({ id: uid(), category: '', items: [] })
        })
      }
    >
      {skills.length === 0 ? (
        <p className="text-xs text-slate-400">No skill groups yet. Click “Add group”.</p>
      ) : (
        <SortableList ids={skills.map((s) => s.id)} onReorder={reorder}>
          <div className="flex flex-col gap-3">
            {skills.map((group, index) => (
              <SortableItem key={group.id} id={group.id} label={group.category || 'skill group'}>
                {(handle) => (
                  <EntryCard
                    handle={handle}
                    title={group.category || 'New group'}
                    subtitle={group.items.join(', ')}
                    onRemove={() =>
                      update((d) => {
                        d.skills.splice(index, 1)
                      })
                    }
                  >
                    <Field label="Category">
                      <TextInput
                        value={group.category}
                        placeholder="Languages"
                        onChange={(e) =>
                          update((d) => void (d.skills[index].category = e.target.value))
                        }
                      />
                    </Field>
                    <Field label="Skills" hint="Separate with commas">
                      <TextInput
                        value={group.items.join(', ')}
                        placeholder="TypeScript, React, Node.js"
                        onChange={(e) =>
                          update(
                            (d) =>
                              void (d.skills[index].items = e.target.value
                                .split(',')
                                .map((s) => s.trim())
                                .filter(Boolean)),
                          )
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
