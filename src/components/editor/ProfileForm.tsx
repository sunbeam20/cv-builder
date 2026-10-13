import { Plus, X } from 'lucide-react'
import { useResumeStore } from '../../store/resumeStore'
import { uid } from '../../lib/helpers'
import { Field, TextArea, TextInput } from '../ui/inputs'
import { SectionCard } from '../ui/SectionCard'
import { AiButton } from '../ui/AiButton'
import { SortableItem, SortableList } from '../ui/SortableList'

export function ProfileForm() {
  const profile = useResumeStore((s) => s.resume.profile)
  const update = useResumeStore((s) => s.update)

  const reorderLinks = (from: number, to: number) =>
    update((d) => {
      const [item] = d.profile.links.splice(from, 1)
      d.profile.links.splice(to, 0, item)
    })

  return (
    <SectionCard title="Personal details">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Full name" className="sm:col-span-2">
          <TextInput
            value={profile.fullName}
            placeholder="Jordan Avery"
            autoComplete="name"
            onChange={(e) => update((d) => void (d.profile.fullName = e.target.value))}
          />
        </Field>
        <Field label="Headline / target role" className="sm:col-span-2">
          <TextInput
            value={profile.headline}
            placeholder="Senior Frontend Engineer"
            onChange={(e) => update((d) => void (d.profile.headline = e.target.value))}
          />
        </Field>
        <Field label="Email">
          <TextInput
            type="email"
            inputMode="email"
            autoComplete="email"
            value={profile.email}
            placeholder="you@email.com"
            onChange={(e) => update((d) => void (d.profile.email = e.target.value))}
          />
        </Field>
        <Field label="Phone">
          <TextInput
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={profile.phone}
            placeholder="+1 (555) 000-0000"
            onChange={(e) => update((d) => void (d.profile.phone = e.target.value))}
          />
        </Field>
        <Field label="Location">
          <TextInput
            value={profile.location}
            placeholder="Austin, TX"
            autoComplete="address-level2"
            onChange={(e) => update((d) => void (d.profile.location = e.target.value))}
          />
        </Field>
        <Field label="Website / Portfolio">
          <TextInput
            type="url"
            inputMode="url"
            value={profile.website}
            placeholder="yoursite.dev"
            autoComplete="url"
            onChange={(e) => update((d) => void (d.profile.website = e.target.value))}
          />
        </Field>
        <Field
          label="Professional summary"
          className="sm:col-span-2"
          action={
            <AiButton
              text={profile.summary}
              context={`${profile.headline || 'Professional'} — target role: ${profile.headline}`}
              instruction="Write a concise 2–4 sentence professional summary in first person, no pronouns."
              onResult={(text) => update((d) => void (d.profile.summary = text))}
            />
          }
        >
          <TextArea
            rows={4}
            value={profile.summary}
            placeholder="2–4 sentences summarizing your experience and impact…"
            onChange={(e) => update((d) => void (d.profile.summary = e.target.value))}
          />
        </Field>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">Links</span>
          <button
            type="button"
            onClick={() =>
              update((d) => {
                d.profile.links.push({ id: uid(), label: '', url: '' })
              })
            }
            className="inline-flex items-center gap-1 rounded-md border border-dashed border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:border-indigo-400 hover:text-indigo-600"
          >
            <Plus size={13} />
            Add link
          </button>
        </div>
        {profile.links.length === 0 ? (
          <p className="text-xs text-slate-400">No links yet.</p>
        ) : (
          <SortableList ids={profile.links.map((l) => l.id)} onReorder={reorderLinks}>
            <div className="flex flex-col gap-2">
              {profile.links.map((link, index) => (
                <SortableItem
                  key={link.id}
                  id={link.id}
                  label={link.label || link.url || 'link'}
                >
                  {(handle) => (
                    <div className="flex items-end gap-2">
                      <div className="mb-0.5">{handle}</div>
                      <Field label="Label" className="w-32 shrink-0">
                        <TextInput
                          value={link.label}
                          placeholder="LinkedIn"
                          onChange={(e) =>
                            update((d) => void (d.profile.links[index].label = e.target.value))
                          }
                        />
                      </Field>
                      <Field label="URL" className="flex-1">
                        <TextInput
                          value={link.url}
                          placeholder="linkedin.com/in/you"
                          onChange={(e) =>
                            update((d) => void (d.profile.links[index].url = e.target.value))
                          }
                        />
                      </Field>
                      <button
                        type="button"
                        title="Remove link"
                        aria-label="Remove link"
                        onClick={() =>
                          update((d) => {
                            d.profile.links.splice(index, 1)
                          })
                        }
                        className="mb-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </SortableItem>
              ))}
            </div>
          </SortableList>
        )}
      </div>
    </SectionCard>
  )
}
