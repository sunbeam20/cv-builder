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
import { ChevronLeft, ChevronRight, Columns3, GripVertical, Plus, Trash2, X } from 'lucide-react'
import { ToolHeader } from '../components/ui/ToolHeader'
import { toast } from '../lib/toast'
import { useModalDismiss } from '../lib/useModalDismiss'
import { useKanbanStore } from './store'
import { PRIORITIES, PRIORITY_STYLES, type Card, type Column, type Priority } from './model'

const inputClass =
  'w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500'

function CardView({
  card,
  onOpen,
}: {
  card: Card
  onOpen: () => void
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: card.id })
  return (
    <div
      ref={setNodeRef}
      className={`group rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm ${isDragging ? 'opacity-40' : ''}`}
    >
      <div className="flex items-start gap-1.5">
        <button
          type="button"
          aria-label={`Drag ${card.title}`}
          className="mt-0.5 inline-flex h-5 w-4 shrink-0 cursor-grab touch-none items-center justify-center text-slate-300 hover:text-slate-500 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={13} />
        </button>
        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-medium text-slate-800">{card.title}</p>
          {card.description ? (
            <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-400">{card.description}</p>
          ) : null}
          <span className="mt-1 flex flex-wrap items-center gap-1">
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${PRIORITY_STYLES[card.priority]}`}>
              {card.priority}
            </span>
            {card.labels.map((label) => (
              <span key={label} className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] text-indigo-600">
                {label}
              </span>
            ))}
          </span>
        </button>
      </div>
    </div>
  )
}

function ColumnView({
  column,
  cards,
  onAddCard,
  onOpenCard,
  onRename,
  onDelete,
}: {
  column: Column
  cards: Card[]
  onAddCard: () => void
  onOpenCard: (card: Card) => void
  onRename: (title: string) => void
  onDelete: () => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })
  const moveColumn = useKanbanStore((s) => s.moveColumn)
  return (
    <div
      ref={setNodeRef}
      className={`flex w-64 shrink-0 flex-col rounded-xl border border-slate-200 bg-slate-100/70 p-2 transition ${
        isOver ? 'ring-2 ring-indigo-200' : ''
      }`}
    >
      <div className="mb-2 flex items-center gap-1 px-1">
        <input
          aria-label={`Rename column ${column.title}`}
          value={column.title}
          onChange={(e) => onRename(e.target.value)}
          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-xs font-semibold text-slate-600 outline-none"
        />
        <span className="rounded-full bg-white px-1.5 text-[11px] font-medium text-slate-500">{cards.length}</span>
        <button
          type="button"
          aria-label={`Move ${column.title} left`}
          onClick={() => moveColumn(column.id, -1)}
          className="text-slate-400 hover:text-slate-600"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          type="button"
          aria-label={`Move ${column.title} right`}
          onClick={() => moveColumn(column.id, 1)}
          className="text-slate-400 hover:text-slate-600"
        >
          <ChevronRight size={14} />
        </button>
        <button
          type="button"
          aria-label={`Delete column ${column.title}`}
          onClick={onDelete}
          className="text-slate-400 hover:text-red-500"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div className="flex min-h-[3rem] flex-1 flex-col gap-2">
        {cards.map((card) => (
          <CardView key={card.id} card={card} onOpen={() => onOpenCard(card)} />
        ))}
        {cards.length === 0 ? (
          <p className="py-3 text-center text-[11px] text-slate-400">Drop cards here</p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onAddCard}
        className="mt-2 inline-flex items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 py-1.5 text-xs font-medium text-slate-500 hover:bg-white"
      >
        <Plus size={13} /> Add card
      </button>
    </div>
  )
}

interface EditorState {
  columnId: string
  card: Card | null
}

export function KanbanApp() {
  const board = useKanbanStore((s) => s.board)
  const addColumn = useKanbanStore((s) => s.addColumn)
  const renameColumn = useKanbanStore((s) => s.renameColumn)
  const removeColumn = useKanbanStore((s) => s.removeColumn)
  const addCard = useKanbanStore((s) => s.addCard)
  const updateCard = useKanbanStore((s) => s.updateCard)
  const removeCard = useKanbanStore((s) => s.removeCard)
  const moveCard = useKanbanStore((s) => s.moveCard)
  const reset = useKanbanStore((s) => s.reset)

  const [activeId, setActiveId] = useState<string | null>(null)
  const [editor, setEditor] = useState<EditorState | null>(null)
  const [newColumn, setNewColumn] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor),
  )

  const onDragStart = (event: DragStartEvent) => setActiveId(String(event.active.id))
  const onDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (over && board.columns.some((column) => column.id === over.id)) {
      moveCard(String(active.id), String(over.id))
    }
  }

  const activeCard = activeId ? board.cards[activeId] : undefined

  return (
    <div className="min-h-screen bg-slate-50">
      <ToolHeader icon={Columns3} title="Kanban Board" subtitle="A drag-and-drop board to move tasks from to-do to done." />

      <main className="mx-auto max-w-full px-4 py-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            aria-label="New column name"
            value={newColumn}
            placeholder="Add a column…"
            onChange={(e) => setNewColumn(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newColumn.trim()) {
                addColumn(newColumn)
                setNewColumn('')
              }
            }}
            className={`${inputClass} w-56`}
          />
          <button
            type="button"
            onClick={() => {
              if (!newColumn.trim()) return
              addColumn(newColumn)
              setNewColumn('')
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <Plus size={15} /> Column
          </button>
          <button
            type="button"
            onClick={() => toast.confirm({ message: 'Reset the board?', tone: 'error', confirmLabel: 'Reset', onConfirm: reset })}
            className="ml-auto text-xs text-slate-400 hover:text-red-500"
          >
            Reset board
          </button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="flex gap-3 overflow-x-auto pb-4">
            {board.columns.map((column) => (
              <ColumnView
                key={column.id}
                column={column}
                cards={column.cardIds.map((id) => board.cards[id]).filter((card): card is Card => Boolean(card))}
                onAddCard={() => setEditor({ columnId: column.id, card: null })}
                onOpenCard={(card) => setEditor({ columnId: column.id, card })}
                onRename={(title) => renameColumn(column.id, title)}
                onDelete={() =>
                  toast.confirm({
                    message: `Delete “${column.title}”?`,
                    description: 'Its cards will be removed too.',
                    tone: 'error',
                    confirmLabel: 'Delete',
                    onConfirm: () => removeColumn(column.id),
                  })
                }
              />
            ))}
          </div>
          <DragOverlay>
            {activeCard ? (
              <div className="w-56 rounded-lg border border-indigo-200 bg-white p-2.5 shadow-lg">
                <p className="truncate text-sm font-medium text-slate-800">{activeCard.title}</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

      {editor ? (
        <CardEditor
          state={editor}
          onClose={() => setEditor(null)}
          onSave={(input) => {
            if (editor.card) updateCard(editor.card.id, input)
            else addCard(editor.columnId, input)
            setEditor(null)
          }}
          onDelete={
            editor.card
              ? () => {
                  removeCard(editor.card!.id)
                  setEditor(null)
                }
              : undefined
          }
        />
      ) : null}
    </div>
  )
}

function CardEditor({
  state,
  onClose,
  onSave,
  onDelete,
}: {
  state: EditorState
  onClose: () => void
  onSave: (input: { title: string; description?: string; labels?: string[]; priority: Priority }) => void
  onDelete?: () => void
}) {
  const ref = useModalDismiss(true, onClose)
  const [title, setTitle] = useState(state.card?.title ?? '')
  const [description, setDescription] = useState(state.card?.description ?? '')
  const [labels, setLabels] = useState(state.card?.labels.join(', ') ?? '')
  const [priority, setPriority] = useState<Priority>(state.card?.priority ?? 'medium')

  const save = () => {
    if (!title.trim()) {
      toast.error('Give the card a title')
      return
    }
    onSave({ title, description, labels: labels.split(','), priority })
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={state.card ? 'Edit card' : 'New card'}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl bg-white p-4 shadow-xl outline-none"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">{state.card ? 'Edit card' : 'New card'}</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Title
            <input aria-label="Title" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Description
            <textarea
              aria-label="Description"
              rows={3}
              className={`${inputClass} resize-y`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-slate-600">
              Labels
              <input
                aria-label="Labels"
                className={inputClass}
                placeholder="comma, separated"
                value={labels}
                onChange={(e) => setLabels(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
              Priority
              <select
                aria-label="Priority"
                className={inputClass}
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                {PRIORITIES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-1 flex items-center gap-2">
            {onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <Trash2 size={14} /> Delete
              </button>
            ) : null}
            <button
              type="button"
              onClick={save}
              className="ml-auto rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Save card
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KanbanApp
