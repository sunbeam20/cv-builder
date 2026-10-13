import { useResumeStore } from '../../store/resumeStore'
import { uid } from '../../lib/helpers'
import { Field, TextInput } from '../ui/inputs'
import { SectionCard } from '../ui/SectionCard'
import { EntryCard } from '../ui/EntryCard'

export function SkillsForm() {
  const skills = useResumeStore((s) => s.resume.skills)
  const update = useResumeStore((s) => s.update)

  const move = (index: number, dir: -1 | 1) => {
    update((d) => {
      const target = index + dir
      if (target < 0 || target >= d.skills.length) return
      const [item] = d.skills.splice(index, 1)
      d.skills.splice(target, 0, item)
    })
  }

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
      <div className="flex flex-col gap-3">
        {skills.map((group, index) => (
          <EntryCard
            key={group.id}
            title={group.category || 'New group'}
            subtitle={group.items.join(', ')}
            canMoveUp={index > 0}
            canMoveDown={index < skills.length - 1}
            onMoveUp={() => move(index, -1)}
            onMoveDown={() => move(index, 1)}
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
                onChange={(e) => update((d) => void (d.skills[index].category = e.target.value))}
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
        ))}
        {skills.length === 0 ? (
          <p className="text-xs text-slate-400">No skill groups yet. Click “Add group”.</p>
        ) : null}
      </div>
    </SectionCard>
  )
}
