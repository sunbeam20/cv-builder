import { describe, expect, it } from 'vitest'
import {
  createCard,
  createColumn,
  emptyBoard,
  findColumnId,
  moveCard,
  removeCardFromColumns,
  type Column,
} from './model'

const columns = (): Column[] => {
  const a = { ...createColumn('A'), id: 'a', cardIds: ['c1', 'c2'] }
  const b = { ...createColumn('B'), id: 'b', cardIds: ['c3'] }
  return [a, b]
}

describe('emptyBoard', () => {
  it('starts with three columns and no cards', () => {
    const board = emptyBoard()
    expect(board.columns).toHaveLength(3)
    expect(Object.keys(board.cards)).toHaveLength(0)
  })
})

describe('createCard', () => {
  it('trims labels and defaults priority', () => {
    const card = createCard({ title: '  Task ', labels: [' a ', '', 'b'] })
    expect(card.title).toBe('Task')
    expect(card.labels).toEqual(['a', 'b'])
    expect(card.priority).toBe('medium')
  })
})

describe('findColumnId / removeCardFromColumns', () => {
  it('locates the owning column', () => {
    expect(findColumnId(columns(), 'c3')).toBe('b')
    expect(findColumnId(columns(), 'nope')).toBeNull()
  })

  it('removes a card from its column', () => {
    const list = columns()
    removeCardFromColumns(list, 'c2')
    expect(list[0]?.cardIds).toEqual(['c1'])
  })
})

describe('moveCard', () => {
  it('appends to the target column by default', () => {
    const list = columns()
    moveCard(list, 'c1', 'b')
    expect(list[0]?.cardIds).toEqual(['c2'])
    expect(list[1]?.cardIds).toEqual(['c3', 'c1'])
  })

  it('inserts at a given index', () => {
    const list = columns()
    moveCard(list, 'c2', 'b', 0)
    expect(list[1]?.cardIds).toEqual(['c2', 'c3'])
  })

  it('ignores unknown columns', () => {
    const list = columns()
    moveCard(list, 'c1', 'missing')
    expect(list[0]?.cardIds).toEqual(['c1', 'c2'])
  })
})
