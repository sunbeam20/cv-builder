export type Priority = 'low' | 'medium' | 'high'

export interface Card {
  id: string
  title: string
  description: string
  labels: string[]
  priority: Priority
  createdAt: string
}

export interface Column {
  id: string
  title: string
  cardIds: string[]
}

export interface Board {
  columns: Column[]
  cards: Record<string, Card>
}

export const PRIORITIES: Priority[] = ['low', 'medium', 'high']

export const PRIORITY_STYLES: Record<Priority, string> = {
  low: 'bg-slate-100 text-slate-500',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-rose-100 text-rose-700',
}

export const uid = (): string => Math.random().toString(36).slice(2, 11)

export const createCard = (input: {
  title: string
  description?: string
  labels?: string[]
  priority?: Priority
}): Card => ({
  id: uid(),
  title: input.title.trim() || 'Untitled',
  description: input.description?.trim() ?? '',
  labels: (input.labels ?? []).map((label) => label.trim()).filter(Boolean),
  priority: input.priority ?? 'medium',
  createdAt: new Date().toISOString(),
})

export const createColumn = (title: string): Column => ({ id: uid(), title: title.trim() || 'Column', cardIds: [] })

export const emptyBoard = (): Board => {
  const todo = createColumn('To do')
  const doing = createColumn('In progress')
  const done = createColumn('Done')
  return { columns: [todo, doing, done], cards: {} }
}

export function findColumnId(columns: Column[], cardId: string): string | null {
  for (const column of columns) if (column.cardIds.includes(cardId)) return column.id
  return null
}

/** Remove a card id from whichever column holds it. */
export function removeCardFromColumns(columns: Column[], cardId: string): void {
  for (const column of columns) {
    const index = column.cardIds.indexOf(cardId)
    if (index !== -1) column.cardIds.splice(index, 1)
  }
}

/**
 * Move a card to a column at a position. `index` defaults to the end; pass the
 * index to insert before. Mutates the given `columns` array in place.
 */
export function moveCard(
  columns: Column[],
  cardId: string,
  toColumnId: string,
  index: number = Number.MAX_SAFE_INTEGER,
): void {
  const target = columns.find((column) => column.id === toColumnId)
  if (!target) return
  removeCardFromColumns(columns, cardId)
  const at = Math.max(0, Math.min(index, target.cardIds.length))
  target.cardIds.splice(at, 0, cardId)
}

export const countCards = (board: Board): number => Object.keys(board.cards).length
