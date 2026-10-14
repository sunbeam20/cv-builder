import type { DragEndEvent } from '@dnd-kit/core'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ReactNode } from 'react'
import { GripVertical } from 'lucide-react'

interface SortableListProps {
  ids: string[]
  onReorder: (from: number, to: number) => void
  children: ReactNode
}

export function SortableList({ ids, onReorder, children }: SortableListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = ids.indexOf(String(active.id))
    const to = ids.indexOf(String(over.id))
    if (from !== -1 && to !== -1) onReorder(from, to)
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  )
}

interface SortableItemProps {
  id: string
  label: string
  children: (handle: ReactNode) => ReactNode
}

export function SortableItem({ id, label, children }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  })

  const handle = (
    <button
      type="button"
      title={`Reorder ${label}`}
      aria-label={`Reorder ${label}`}
      className="inline-flex h-7 w-7 cursor-grab touch-none items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 dark:hover:text-indigo-400 active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <GripVertical size={14} />
    </button>
  )

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? 'relative z-10 opacity-90' : undefined}
    >
      {children(handle)}
    </div>
  )
}
