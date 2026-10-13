import { useState } from 'react'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { GripVertical } from 'lucide-react'
import type { Application, ApplicationStatus } from '../types'
import { APPLICATION_STATUSES, STATUS_LABELS } from '../lib/applications'
import { BoardCard } from './ApplicationCard'

const COLUMN_ACCENT: Record<ApplicationStatus, string> = {
  wishlist: 'border-t-slate-400',
  applied: 'border-t-sky-500',
  interview: 'border-t-amber-500',
  offer: 'border-t-emerald-500',
  rejected: 'border-t-rose-400',
}

function DraggableCard({ app, now, onOpen }: { app: Application; now: Date; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: app.id })
  return (
    <div ref={setNodeRef} className={isDragging ? 'opacity-40' : undefined}>
      <BoardCard
        app={app}
        now={now}
        onOpen={onOpen}
        handle={
          <button
            type="button"
            aria-label={`Drag ${app.company || 'application'}`}
            className="mt-0.5 inline-flex h-5 w-4 shrink-0 cursor-grab touch-none items-center justify-center text-slate-300 hover:text-slate-500 active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={13} />
          </button>
        }
      />
    </div>
  )
}

function Column({
  status,
  apps,
  now,
  onOpen,
}: {
  status: ApplicationStatus
  apps: Application[]
  now: Date
  onOpen: (app: Application) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  return (
    <div
      ref={setNodeRef}
      className={`flex w-64 shrink-0 flex-col rounded-xl border-t-4 bg-slate-100/70 p-2 transition ${COLUMN_ACCENT[status]} ${
        isOver ? 'bg-indigo-50 ring-1 ring-indigo-200' : ''
      }`}
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-slate-600">{STATUS_LABELS[status]}</span>
        <span className="rounded-full bg-white px-1.5 text-[11px] font-medium text-slate-500">
          {apps.length}
        </span>
      </div>
      <div className="flex min-h-[3rem] flex-1 flex-col gap-2">
        {apps.length === 0 ? (
          <p className="px-1 py-3 text-center text-[11px] text-slate-400">Drop here</p>
        ) : (
          apps.map((app) => (
            <DraggableCard key={app.id} app={app} now={now} onOpen={() => onOpen(app)} />
          ))
        )}
      </div>
    </div>
  )
}

export function BoardView({
  apps,
  now,
  onMove,
  onOpen,
}: {
  apps: Application[]
  now: Date
  onMove: (id: string, status: ApplicationStatus) => void
  onOpen: (app: Application) => void
}) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor),
  )

  const handleDragStart = (event: DragStartEvent) => setActiveId(String(event.active.id))
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over) return
    const target = String(over.id) as ApplicationStatus
    if (APPLICATION_STATUSES.includes(target)) onMove(String(active.id), target)
  }

  const activeApp = activeId ? apps.find((app) => app.id === activeId) ?? null : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex gap-3 overflow-x-auto pb-2">
        {APPLICATION_STATUSES.map((status) => (
          <Column
            key={status}
            status={status}
            apps={apps.filter((app) => app.status === status)}
            now={now}
            onOpen={onOpen}
          />
        ))}
      </div>
      <DragOverlay>
        {activeApp ? (
          <div className="w-60 rotate-2">
            <BoardCard app={activeApp} now={now} onOpen={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default BoardView
