import { useResumeStore } from '../../store/resumeStore'
import { uid } from '../../lib/helpers'
import { Field, TextInput } from '../ui/inputs'
import { SectionCard } from '../ui/SectionCard'
import { EntryCard } from '../ui/EntryCard'
import { SortableItem, SortableList } from '../ui/SortableList'

export function LanguagesForm() {
  const languages = useResumeStore((s) => s.resume.languages)
  const update = useResumeStore((s) => s.update)

  const reorder = (from: number, to: number) =>
    update((d) => {
      const [item] = d.languages.splice(from, 1)
      d.languages.splice(to, 0, item)
    })

  return (
    <SectionCard
      title="Languages"
      count={languages.length}
      addLabel="Add"
      onAdd={() =>
        update((d) => {
          d.languages.push({ id: uid(), name: '', proficiency: '' })
        })
      }
    >
      {languages.length === 0 ? (
        <p className="text-xs text-slate-400 dark:text-slate-500">No languages yet.</p>
      ) : (
        <SortableList ids={languages.map((l) => l.id)} onReorder={reorder}>
          <div className="flex flex-col gap-3">
            {languages.map((lang, index) => (
              <SortableItem key={lang.id} id={lang.id} label={lang.name || 'language'}>
                {(handle) => (
                  <EntryCard
                    handle={handle}
                    title={lang.name}
                    subtitle={lang.proficiency}
                    onRemove={() =>
                      update((d) => {
                        d.languages.splice(index, 1)
                      })
                    }
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Language">
                        <TextInput
                          value={lang.name}
                          onChange={(e) =>
                            update((d) => void (d.languages[index].name = e.target.value))
                          }
                        />
                      </Field>
                      <Field label="Proficiency">
                        <TextInput
                          value={lang.proficiency}
                          placeholder="Native / Fluent / B2"
                          onChange={(e) =>
                            update((d) => void (d.languages[index].proficiency = e.target.value))
                          }
                        />
                      </Field>
                    </div>
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
