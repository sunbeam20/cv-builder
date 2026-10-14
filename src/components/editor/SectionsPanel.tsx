import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Eye, EyeOff, GripVertical } from 'lucide-react'
import { useResumeStore } from '../../store/resumeStore'
import { SECTION_LABELS } from '../../lib/helpers'
import type { Resume, SectionId } from '../../types'
import { SectionCard } from '../ui/SectionCard'

const isSectionEmpty = (resume: Resume, id: SectionId): boolean => {
  switch (id) {
    case 'summary':
      return !resume.profile.summary.trim()
    case 'experience':
      return resume.experience.length === 0
    case 'education':
      return resume.education.length === 0
    case 'skills':
      return resume.skills.length === 0
    case 'projects':
      return resume.projects.length === 0
    case 'certifications':
      return resume.certifications.length === 0
    case 'languages':
      return resume.languages.length === 0
  }
}

function SortableRow({
  id,
  empty,
  hidden,
  onToggle,
}: {
  id: SectionId
  empty: boolean
  hidden: boolean
  onToggle: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 rounded-md border bg-white dark:bg-slate-900 px-2.5 py-1.5 ${
        isDragging ? 'border-indigo-400 shadow-md' : 'border-slate-200 dark:border-slate-700'
      }`}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 active:cursor-grabbing"
        aria-label={`Reorder ${SECTION_LABELS[id]}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={15} />
      </button>
      <span
        className={`flex-1 text-xs font-medium ${
          hidden ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-200'
        }`}
      >
        {SECTION_LABELS[id]}
      </span>
      {empty ? (
        <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-400 dark:text-slate-500">
          empty
        </span>
      ) : null}
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={!hidden}
        aria-label={`${hidden ? 'Show' : 'Hide'} ${SECTION_LABELS[id]}`}
        title={hidden ? 'Show in CV' : 'Hide from CV'}
        className="inline-flex h-6 w-6 items-center justify-center rounded text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300"
      >
        {hidden ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  )
}

export function SectionsPanel() {
  const resume = useResumeStore((s) => s.resume)
  const moveSection = useResumeStore((s) => s.moveSection)
  const toggleSection = useResumeStore((s) => s.toggleSection)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = resume.sectionOrder.indexOf(active.id as SectionId)
    const to = resume.sectionOrder.indexOf(over.id as SectionId)
    if (from !== -1 && to !== -1) moveSection(from, to)
  }

  return (
    <SectionCard title="Section order" count={resume.sectionOrder.length} defaultOpen={false}>
      <p className="mb-2 text-[11px] text-slate-400 dark:text-slate-500">
        Drag to reorder sections, or toggle the eye to include/exclude them from the CV.
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={resume.sectionOrder} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-1.5">
            {resume.sectionOrder.map((id) => (
              <SortableRow
                key={id}
                id={id}
                empty={isSectionEmpty(resume, id)}
                hidden={resume.hiddenSections.includes(id)}
                onToggle={() => toggleSection(id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </SectionCard>
  )
}
