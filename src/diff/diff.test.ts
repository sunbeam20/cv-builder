import { describe, expect, it } from 'vitest'
import { diffLines, diffStats, diffWords } from './diff'

describe('diffLines', () => {
  it('marks identical text as all equal', () => {
    const rows = diffLines('a\nb\nc', 'a\nb\nc')
    expect(rows.every((row) => row.type === 'equal')).toBe(true)
    expect(diffStats(rows)).toEqual({ added: 0, removed: 0, unchanged: 3 })
  })

  it('detects an added line and numbers it on the changed side', () => {
    const rows = diffLines('a\nc', 'a\nb\nc')
    expect(rows.map((row) => row.type)).toEqual(['equal', 'add', 'equal'])
    expect(rows[1].text).toBe('b')
    expect(rows[1].bLine).toBe(2)
  })

  it('detects a removed line and numbers it on the original side', () => {
    const rows = diffLines('a\nb\nc', 'a\nc')
    expect(rows.map((row) => row.type)).toEqual(['equal', 'remove', 'equal'])
    expect(rows[1].text).toBe('b')
    expect(rows[1].aLine).toBe(2)
  })

  it('ignores case when asked', () => {
    const rows = diffLines('Hello', 'hello', { ignoreCase: true })
    expect(rows).toHaveLength(1)
    expect(rows[0].type).toBe('equal')
  })

  it('ignores whitespace when asked', () => {
    const rows = diffLines('a  b', 'a b', { ignoreWhitespace: true })
    expect(rows[0].type).toBe('equal')
  })

  it('handles empty inputs', () => {
    expect(diffLines('', '')).toEqual([])
    expect(diffLines('', 'x').map((row) => row.type)).toEqual(['add'])
  })
})

describe('diffWords', () => {
  it('marks changed words while keeping both originals', () => {
    const tokens = diffWords('the quick fox', 'the slow fox')
    const types = tokens.map((token) => token.type)
    expect(types).toContain('remove')
    expect(types).toContain('add')
    const joined = tokens.map((token) => token.text).join('')
    expect(joined).toContain('quick')
    expect(joined).toContain('slow')
  })

  it('treats identical text as all equal', () => {
    expect(diffWords('a b', 'a b').every((token) => token.type === 'equal')).toBe(true)
  })
})
