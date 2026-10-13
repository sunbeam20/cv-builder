import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  ExternalLink,
  Globe,
  ImagePlus,
  LayoutList,
  Link2,
  Palette,
  Plus,
  Share2,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { resumeHasContent } from '../lib/helpers'
import { FONT_OPTIONS } from '../lib/templates'
import { sampleResume } from '../lib/sampleData'
import { useResumeStore } from '../store/resumeStore'
import { toast } from '../lib/toast'
import { goHome } from '../home/navigation'
import { ToolMenu } from '../home/ToolMenu'
import { BRAND } from '../home/config'
import { Field, IconButton, TextArea, TextInput } from '../components/ui/inputs'
import { fileToPhoto } from './photo'
import {
  DEFAULT_SETTINGS,
  emptyPortfolio,
  loadDraft,
  portfolioHasContent,
  renderPortfolioHtml,
  resolveAccent,
  resumeToPortfolio,
  saveDraft,
  PORTFOLIO_THEMES,
  type PortfolioData,
  type PortfolioSettings,
} from './model'
import { portfolioShareUrl } from './share'

function Card({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <span className="text-indigo-600">{icon}</span>
        {title}
      </h2>
      <div className="mt-3 flex flex-col gap-3">{children}</div>
    </section>
  )
}

function Label({ children }: { children: ReactNode }) {
  return <span className="text-[11px] font-medium text-slate-500">{children}</span>
}

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'

const ghostButton =
  'inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'

function Seg<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T
  options: { value: T; label: ReactNode }[]
  onChange: (value: T) => void
  label: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      <div className="flex rounded-lg border border-slate-200 p-0.5">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={`flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition ${
              value === option.value ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-3.5 w-3.5 accent-indigo-600"
      />
      <span className="text-xs text-slate-600">{label}</span>
    </label>
  )
}

function ListBox({
  title,
  count,
  addLabel,
  onAdd,
  hint,
  children,
}: {
  title: string
  count: number
  addLabel: string
  onAdd: () => void
  hint?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
          {count}
        </span>
        <button type="button" onClick={onAdd} className={`ml-auto ${ghostButton}`}>
          <Plus size={14} />
          {addLabel}
        </button>
      </div>
      {hint ? <p className="mt-1 text-[11px] text-slate-400">{hint}</p> : null}
      <div className="mt-3 flex flex-col gap-3">{children}</div>
    </section>
  )
}

function EntryShell({
  title,
  onRemove,
  onUp,
  onDown,
  upDisabled,
  downDisabled,
  children,
}: {
  title: string
  onRemove: () => void
  onUp: () => void
  onDown: () => void
  upDisabled: boolean
  downDisabled: boolean
  children: ReactNode
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
      <div className="mb-2 flex items-center gap-1">
        <p className="mr-auto truncate text-xs font-medium text-slate-700">{title}</p>
        <IconButton title="Move up" onClick={onUp} disabled={upDisabled}>
          <ChevronUp size={14} />
        </IconButton>
        <IconButton title="Move down" onClick={onDown} disabled={downDisabled}>
          <ChevronDown size={14} />
        </IconButton>
        <IconButton title="Remove" onClick={onRemove} danger>
          <Trash2 size={14} />
        </IconButton>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}

const SECTION_TOGGLES: { key: keyof PortfolioSettings; label: string }[] = [
  { key: 'showContact', label: 'Contact details' },
  { key: 'showSummary', label: 'About' },
  { key: 'showProjects', label: 'Projects' },
  { key: 'showExperience', label: 'Experience' },
  { key: 'showSkills', label: 'Skills' },
  { key: 'showEducation', label: 'Education' },
]

function moveItem<T>(items: T[], index: number, delta: number): T[] {
  const next = items.slice()
  const target = index + delta
  if (target < 0 || target >= next.length) return next
  const [item] = next.splice(index, 1)
  next.splice(target, 0, item)
  return next
}

export function PortfolioApp() {
  const storeResume = useResumeStore((s) => s.resume)
  const [tab, setTab] = useState<'content' | 'design'>('content')
  const [data, setData] = useState<PortfolioData>(() => {
    const stored = loadDraft()
    if (stored) return stored.data
    return resumeHasContent(storeResume) ? resumeToPortfolio(storeResume) : emptyPortfolio()
  })
  const [settings, setSettings] = useState<PortfolioSettings>(
    () => loadDraft()?.settings ?? { ...DEFAULT_SETTINGS },
  )

  useEffect(() => {
    saveDraft({ data, settings })
  }, [data, settings])

  const html = useMemo(() => renderPortfolioHtml(data, settings), [data, settings])
  const shareUrl = useMemo(() => portfolioShareUrl(data, settings), [data, settings])
  const hasContent = portfolioHasContent(data)
  const accent = resolveAccent(settings)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const patchData = (patch: Partial<PortfolioData>) => setData((prev) => ({ ...prev, ...patch }))

  const onPhotoFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Unsupported file', { description: 'Choose an image file (PNG or JPEG).' })
      return
    }
    try {
      const photo = await fileToPhoto(file)
      if (!photo) throw new Error('empty')
      patchData({ photo })
      toast.success('Profile picture updated')
    } catch {
      toast.error('Could not read that image', { description: 'Try a different file.' })
    }
  }
  const updateSettings = (patch: Partial<PortfolioSettings>) =>
    setSettings((prev) => ({ ...prev, ...patch }))

  const importFromCv = () => {
    if (!resumeHasContent(storeResume)) {
      toast.error('No saved CV found', { description: 'Build or import one in the CV Builder first.' })
      return
    }
    setData(resumeToPortfolio(storeResume))
    toast.success('Imported from CV Builder')
  }

  const loadExample = () => {
    setData(resumeToPortfolio(sampleResume()))
    toast.success('Example portfolio loaded')
  }

  const clear = () => {
    toast.confirm({
      message: 'Clear the portfolio?',
      description: 'All edited details will be removed from this page.',
      confirmLabel: 'Clear',
      tone: 'error',
      onConfirm: () => setData(emptyPortfolio()),
    })
  }

  const copyText = async (text: string, success: string, failure: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(success)
      return true
    } catch {
      toast.error('Couldn’t copy', { description: failure })
      return false
    }
  }

  const copyShareLink = () => {
    if (!hasContent) {
      toast.error('Add your details first', { description: 'Then you can share this page.' })
      return
    }
    void copyText(
      shareUrl,
      'Share link copied',
      'Copy the link from the Share box in the Content tab.',
    )
  }

  const openShareLink = () => {
    if (!hasContent) return
    window.open(shareUrl, '_blank', 'noopener,noreferrer')
  }

  const counts = [
    { label: 'roles', value: data.experience.length },
    { label: 'projects', value: data.projects.length },
    { label: 'skills', value: data.skills.length },
    { label: 'qualifications', value: data.education.length },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5">
          <button
            type="button"
            aria-label={`Go to ${BRAND} home`}
            title="All tools"
            onClick={() => goHome()}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <ArrowLeft size={15} />
          </button>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Globe size={16} />
          </span>
          <div className="mr-auto min-w-0">
            <h1 className="truncate text-sm font-semibold text-slate-800">Portfolio Page</h1>
            <p className="hidden truncate text-[11px] text-slate-400 sm:block">
              Design a page and share it with a single link.
            </p>
          </div>
          <ToolMenu />
          <button
            type="button"
            onClick={copyShareLink}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-medium text-white transition hover:bg-indigo-700"
          >
            <Share2 size={15} />
            Share link
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
            <button
              type="button"
              aria-pressed={tab === 'content'}
              onClick={() => setTab('content')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition ${
                tab === 'content' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <LayoutList size={14} />
              Content
            </button>
            <button
              type="button"
              aria-pressed={tab === 'design'}
              onClick={() => setTab('design')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition ${
                tab === 'design' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Palette size={14} />
              Design
            </button>
          </div>

          {tab === 'content' ? (
            <>
              <Card title="Get started" icon={<Sparkles size={16} />}>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={importFromCv} className={ghostButton}>
                    <Link2 size={14} />
                    Import from CV Builder
                  </button>
                  <button type="button" onClick={loadExample} className={ghostButton}>
                    <Sparkles size={14} />
                    Example
                  </button>
                  {hasContent ? (
                    <button
                      type="button"
                      onClick={clear}
                      className="inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                      Clear
                    </button>
                  ) : null}
                </div>
                {hasContent ? (
                  <div className="grid grid-cols-2 gap-2">
                    {counts.map((count) => (
                      <div key={count.label} className="rounded-lg bg-slate-50 px-3 py-2">
                        <p className="text-sm font-semibold text-slate-800">{count.value}</p>
                        <p className="text-[11px] text-slate-400">{count.label}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    Import from the CV Builder, load the example, or just start typing below.
                  </p>
                )}
              </Card>

              <Card title="Profile" icon={<Globe size={16} />}>
                <div className="flex flex-col gap-1">
                  <Label>Profile picture</Label>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-indigo-600 text-lg font-semibold text-white">
                      {data.photo ? (
                        <img src={data.photo} alt="" className="h-full w-full object-cover" />
                      ) : (
                        data.name.trim().charAt(0).toUpperCase() || 'P'
                      )}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className={ghostButton}
                      >
                        <ImagePlus size={14} />
                        {data.photo ? 'Change photo' : 'Upload photo'}
                      </button>
                      {data.photo ? (
                        <button
                          type="button"
                          onClick={() => patchData({ photo: '' })}
                          className="inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                          Remove
                        </button>
                      ) : null}
                    </div>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      aria-label="Upload profile picture"
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        if (file) void onPhotoFile(file)
                        event.target.value = ''
                      }}
                    />
                  </div>
                </div>
                <Field label="Name">
                  <TextInput
                    value={data.name}
                    placeholder="Your Name"
                    onChange={(event) => patchData({ name: event.target.value })}
                  />
                </Field>
                <Field label="Headline">
                  <TextInput
                    value={data.headline}
                    placeholder="Product Designer · Builder"
                    onChange={(event) => patchData({ headline: event.target.value })}
                  />
                </Field>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Location">
                    <TextInput
                      value={data.location}
                      placeholder="Remote / City, ST"
                      onChange={(event) => patchData({ location: event.target.value })}
                    />
                  </Field>
                  <Field label="Email">
                    <TextInput
                      type="email"
                      value={data.email}
                      placeholder="you@email.com"
                      onChange={(event) => patchData({ email: event.target.value })}
                    />
                  </Field>
                </div>
                <Field label="Website">
                  <TextInput
                    value={data.website}
                    placeholder="https://yoursite.com"
                    onChange={(event) => patchData({ website: event.target.value })}
                  />
                </Field>
                <Field label="About">
                  <TextArea
                    rows={4}
                    value={data.summary}
                    placeholder="A short intro that captures what you do and what you're into."
                    onChange={(event) => patchData({ summary: event.target.value })}
                  />
                </Field>
              </Card>

              <ListBox
                title="Links"
                count={data.links.length}
                addLabel="Add link"
                hint="Social profiles, GitHub, Dribbble — anything worth a click."
                onAdd={() => patchData({ links: [...data.links, { label: '', url: '' }] })}
              >
                {data.links.length === 0 ? (
                  <p className="text-xs text-slate-400">No links yet.</p>
                ) : (
                  data.links.map((link, index) => (
                    <div key={index} className="flex items-end gap-2">
                      <div className="grid flex-1 grid-cols-2 gap-2">
                        <Field label="Label">
                          <TextInput
                            value={link.label}
                            placeholder="GitHub"
                            onChange={(event) =>
                              patchData({
                                links: data.links.map((item, i) =>
                                  i === index ? { ...item, label: event.target.value } : item,
                                ),
                              })
                            }
                          />
                        </Field>
                        <Field label="URL">
                          <TextInput
                            value={link.url}
                            placeholder="github.com/you"
                            onChange={(event) =>
                              patchData({
                                links: data.links.map((item, i) =>
                                  i === index ? { ...item, url: event.target.value } : item,
                                ),
                              })
                            }
                          />
                        </Field>
                      </div>
                      <IconButton
                        title="Remove link"
                        danger
                        onClick={() =>
                          patchData({ links: data.links.filter((_, i) => i !== index) })
                        }
                      >
                        <Trash2 size={14} />
                      </IconButton>
                    </div>
                  ))
                )}
              </ListBox>

              <ListBox
                title="Skills"
                count={data.skills.length}
                addLabel="Add skill"
                hint="A short list of tools, languages, and strengths."
                onAdd={() => patchData({ skills: [...data.skills, ''] })}
              >
                {data.skills.length === 0 ? (
                  <p className="text-xs text-slate-400">No skills yet.</p>
                ) : (
                  data.skills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <TextInput
                        value={skill}
                        placeholder="TypeScript"
                        onChange={(event) =>
                          patchData({
                            skills: data.skills.map((item, i) =>
                              i === index ? event.target.value : item,
                            ),
                          })
                        }
                      />
                      <IconButton
                        title="Remove skill"
                        danger
                        onClick={() =>
                          patchData({ skills: data.skills.filter((_, i) => i !== index) })
                        }
                      >
                        <Trash2 size={14} />
                      </IconButton>
                    </div>
                  ))
                )}
              </ListBox>

              <ListBox
                title="Projects"
                count={data.projects.length}
                addLabel="Add project"
                onAdd={() =>
                  patchData({
                    projects: [...data.projects, { name: '', link: '', description: '', bullets: [] }],
                  })
                }
              >
                {data.projects.length === 0 ? (
                  <p className="text-xs text-slate-400">No projects yet.</p>
                ) : (
                  data.projects.map((project, index) => (
                    <EntryShell
                      key={index}
                      title={project.name || 'New project'}
                      upDisabled={index === 0}
                      downDisabled={index === data.projects.length - 1}
                      onUp={() => patchData({ projects: moveItem(data.projects, index, -1) })}
                      onDown={() => patchData({ projects: moveItem(data.projects, index, 1) })}
                      onRemove={() =>
                        patchData({ projects: data.projects.filter((_, i) => i !== index) })
                      }
                    >
                      <Field label="Name">
                        <TextInput
                          value={project.name}
                          placeholder="Project name"
                          onChange={(event) =>
                            patchData({
                              projects: data.projects.map((item, i) =>
                                i === index ? { ...item, name: event.target.value } : item,
                              ),
                            })
                          }
                        />
                      </Field>
                      <Field label="Link">
                        <TextInput
                          value={project.link}
                          placeholder="https://…"
                          onChange={(event) =>
                            patchData({
                              projects: data.projects.map((item, i) =>
                                i === index ? { ...item, link: event.target.value } : item,
                              ),
                            })
                          }
                        />
                      </Field>
                      <Field label="Description">
                        <TextArea
                          rows={2}
                          value={project.description}
                          placeholder="What it is and why it matters."
                          onChange={(event) =>
                            patchData({
                              projects: data.projects.map((item, i) =>
                                i === index ? { ...item, description: event.target.value } : item,
                              ),
                            })
                          }
                        />
                      </Field>
                      <Field label="Highlights" hint="One point per line.">
                        <TextArea
                          rows={3}
                          value={project.bullets.join('\n')}
                          onChange={(event) =>
                            patchData({
                              projects: data.projects.map((item, i) =>
                                i === index
                                  ? { ...item, bullets: event.target.value.split('\n') }
                                  : item,
                              ),
                            })
                          }
                        />
                      </Field>
                    </EntryShell>
                  ))
                )}
              </ListBox>

              <ListBox
                title="Experience"
                count={data.experience.length}
                addLabel="Add role"
                onAdd={() =>
                  patchData({
                    experience: [
                      ...data.experience,
                      {
                        role: '',
                        company: '',
                        location: '',
                        start: '',
                        end: '',
                        current: false,
                        bullets: [],
                      },
                    ],
                  })
                }
              >
                {data.experience.length === 0 ? (
                  <p className="text-xs text-slate-400">No roles yet.</p>
                ) : (
                  data.experience.map((entry, index) => (
                    <EntryShell
                      key={index}
                      title={entry.role || entry.company || 'New role'}
                      upDisabled={index === 0}
                      downDisabled={index === data.experience.length - 1}
                      onUp={() => patchData({ experience: moveItem(data.experience, index, -1) })}
                      onDown={() => patchData({ experience: moveItem(data.experience, index, 1) })}
                      onRemove={() =>
                        patchData({ experience: data.experience.filter((_, i) => i !== index) })
                      }
                    >
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field label="Job title">
                          <TextInput
                            value={entry.role}
                            onChange={(event) =>
                              patchData({
                                experience: data.experience.map((item, i) =>
                                  i === index ? { ...item, role: event.target.value } : item,
                                ),
                              })
                            }
                          />
                        </Field>
                        <Field label="Company">
                          <TextInput
                            value={entry.company}
                            onChange={(event) =>
                              patchData({
                                experience: data.experience.map((item, i) =>
                                  i === index ? { ...item, company: event.target.value } : item,
                                ),
                              })
                            }
                          />
                        </Field>
                        <Field label="Location">
                          <TextInput
                            value={entry.location}
                            placeholder="Remote / City, ST"
                            onChange={(event) =>
                              patchData({
                                experience: data.experience.map((item, i) =>
                                  i === index ? { ...item, location: event.target.value } : item,
                                ),
                              })
                            }
                          />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Start">
                            <TextInput
                              value={entry.start}
                              placeholder="Mar 2021"
                              onChange={(event) =>
                                patchData({
                                  experience: data.experience.map((item, i) =>
                                    i === index ? { ...item, start: event.target.value } : item,
                                  ),
                                })
                              }
                            />
                          </Field>
                          <Field label="End">
                            <TextInput
                              value={entry.end}
                              placeholder="Present"
                              disabled={entry.current}
                              onChange={(event) =>
                                patchData({
                                  experience: data.experience.map((item, i) =>
                                    i === index ? { ...item, end: event.target.value } : item,
                                  ),
                                })
                              }
                            />
                          </Field>
                        </div>
                      </div>
                      <Toggle
                        label="I currently work here"
                        checked={entry.current}
                        onChange={(checked) =>
                          patchData({
                            experience: data.experience.map((item, i) =>
                              i === index ? { ...item, current: checked } : item,
                            ),
                          })
                        }
                      />
                      <Field label="Highlights" hint="One point per line.">
                        <TextArea
                          rows={3}
                          value={entry.bullets.join('\n')}
                          onChange={(event) =>
                            patchData({
                              experience: data.experience.map((item, i) =>
                                i === index
                                  ? { ...item, bullets: event.target.value.split('\n') }
                                  : item,
                              ),
                            })
                          }
                        />
                      </Field>
                    </EntryShell>
                  ))
                )}
              </ListBox>

              <ListBox
                title="Education"
                count={data.education.length}
                addLabel="Add education"
                onAdd={() =>
                  patchData({
                    education: [
                      ...data.education,
                      { school: '', degree: '', field: '', start: '', end: '' },
                    ],
                  })
                }
              >
                {data.education.length === 0 ? (
                  <p className="text-xs text-slate-400">No education yet.</p>
                ) : (
                  data.education.map((entry, index) => (
                    <EntryShell
                      key={index}
                      title={entry.school || entry.degree || 'New entry'}
                      upDisabled={index === 0}
                      downDisabled={index === data.education.length - 1}
                      onUp={() => patchData({ education: moveItem(data.education, index, -1) })}
                      onDown={() => patchData({ education: moveItem(data.education, index, 1) })}
                      onRemove={() =>
                        patchData({ education: data.education.filter((_, i) => i !== index) })
                      }
                    >
                      <Field label="School">
                        <TextInput
                          value={entry.school}
                          onChange={(event) =>
                            patchData({
                              education: data.education.map((item, i) =>
                                i === index ? { ...item, school: event.target.value } : item,
                              ),
                            })
                          }
                        />
                      </Field>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field label="Degree">
                          <TextInput
                            value={entry.degree}
                            placeholder="B.Sc."
                            onChange={(event) =>
                              patchData({
                                education: data.education.map((item, i) =>
                                  i === index ? { ...item, degree: event.target.value } : item,
                                ),
                              })
                            }
                          />
                        </Field>
                        <Field label="Field">
                          <TextInput
                            value={entry.field}
                            placeholder="Computer Science"
                            onChange={(event) =>
                              patchData({
                                education: data.education.map((item, i) =>
                                  i === index ? { ...item, field: event.target.value } : item,
                                ),
                              })
                            }
                          />
                        </Field>
                        <Field label="Start">
                          <TextInput
                            value={entry.start}
                            placeholder="2017"
                            onChange={(event) =>
                              patchData({
                                education: data.education.map((item, i) =>
                                  i === index ? { ...item, start: event.target.value } : item,
                                ),
                              })
                            }
                          />
                        </Field>
                        <Field label="End">
                          <TextInput
                            value={entry.end}
                            placeholder="2021"
                            onChange={(event) =>
                              patchData({
                                education: data.education.map((item, i) =>
                                  i === index ? { ...item, end: event.target.value } : item,
                                ),
                              })
                            }
                          />
                        </Field>
                      </div>
                    </EntryShell>
                  ))
                )}
              </ListBox>

              <Card title="Share" icon={<Share2 size={16} />}>
                <p className="text-xs text-slate-500">
                  Your whole page is packed into the link — no account or server needed. Anyone who
                  opens it sees a read-only version.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={hasContent ? shareUrl : ''}
                    placeholder="Add your details to get a link"
                    onFocus={(event) => event.target.select()}
                    className={inputClass}
                  />
                  <IconButton title="Copy link" onClick={copyShareLink} disabled={!hasContent}>
                    <Copy size={14} />
                  </IconButton>
                  <IconButton title="Open link" onClick={openShareLink} disabled={!hasContent}>
                    <ExternalLink size={14} />
                  </IconButton>
                </div>
              </Card>
            </>
          ) : (
            <>
              <Card title="Theme" icon={<Palette size={16} />}>
                <div className="grid grid-cols-3 gap-2">
                  {PORTFOLIO_THEMES.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => updateSettings({ themeId: option.id })}
                      className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-[11px] font-medium transition ${
                        option.id === settings.themeId
                          ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className="h-6 w-full rounded"
                        style={{ backgroundColor: option.accent }}
                      />
                      {option.name}
                    </button>
                  ))}
                </div>
                <div className="flex items-end gap-2">
                  <Field label="Custom accent">
                    <input
                      type="color"
                      value={accent}
                      onChange={(event) => updateSettings({ accentColor: event.target.value })}
                      className="h-9 w-16 cursor-pointer rounded-md border border-slate-300 bg-white p-1"
                    />
                  </Field>
                  <button
                    type="button"
                    onClick={() => updateSettings({ accentColor: '' })}
                    disabled={!settings.accentColor}
                    className={`${ghostButton} disabled:opacity-40`}
                  >
                    Reset to theme
                  </button>
                </div>
                <Seg
                  label="Mode"
                  value={settings.mode}
                  onChange={(value) => updateSettings({ mode: value })}
                  options={[
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                  ]}
                />
                <Seg
                  label="Density"
                  value={settings.density}
                  onChange={(value) => updateSettings({ density: value })}
                  options={[
                    { value: 'comfortable', label: 'Comfortable' },
                    { value: 'compact', label: 'Compact' },
                  ]}
                />
                <label className="flex flex-col gap-1">
                  <Label>Font</Label>
                  <select
                    value={settings.fontId}
                    onChange={(event) => updateSettings({ fontId: event.target.value })}
                    className={inputClass}
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font.id} value={font.id}>
                        {font.name}
                      </option>
                    ))}
                  </select>
                </label>
              </Card>

              <Card title="Layout" icon={<LayoutList size={16} />}>
                <Toggle
                  label="Show photo or avatar"
                  checked={settings.showAvatar}
                  onChange={(checked) => updateSettings({ showAvatar: checked })}
                />
                <Toggle
                  label="Accent bar"
                  checked={settings.accentBar}
                  onChange={(checked) => updateSettings({ accentBar: checked })}
                />
                <Toggle
                  label="Uppercase headings"
                  checked={settings.headingsUppercase}
                  onChange={(checked) => updateSettings({ headingsUppercase: checked })}
                />
              </Card>

              <Card title="Sections" icon={<LayoutList size={16} />}>
                {SECTION_TOGGLES.map((item) => (
                  <Toggle
                    key={item.key}
                    label={item.label}
                    checked={settings[item.key] as boolean}
                    onChange={(checked) =>
                      updateSettings({ [item.key]: checked } as Partial<PortfolioSettings>)
                    }
                  />
                ))}
              </Card>
            </>
          )}
        </div>

        <div className="lg:sticky lg:top-[4.5rem] lg:self-start">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Eye size={15} className="text-indigo-600" />
              <span className="text-xs font-medium text-slate-500">Live preview</span>
              <span
                className="ml-auto inline-flex h-3 w-3 rounded-full"
                style={{ backgroundColor: accent } as CSSProperties}
              />
            </div>
            {hasContent ? (
              <iframe
                title="Portfolio preview"
                srcDoc={html}
                className="h-[72vh] w-full rounded-lg border border-slate-200 bg-white"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 p-10 text-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Globe size={24} />
                </span>
                <h2 className="text-sm font-semibold text-slate-800">Your page starts here</h2>
                <p className="max-w-xs text-xs leading-relaxed text-slate-500">
                  Import your details, load the example, or type your own — a clean portfolio page
                  appears instantly, ready to share with a link.
                </p>
                <button
                  type="button"
                  onClick={loadExample}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-medium text-white transition hover:bg-indigo-700"
                >
                  <Sparkles size={14} />
                  Load example
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default PortfolioApp
