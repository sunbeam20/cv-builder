import { describe, expect, it } from 'vitest'
import { createEntry, moodMeta, summarise, trend, type MoodEntry } from './model'

const entry = (date: string, mood: number, tags: string[] = []): MoodEntry => ({
  ...createEntry({ date, mood, tags }),
  id: date,
})

const day = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12)

describe('moodMeta', () => {
  it('maps a value to its emoji and label', () => {
    expect(moodMeta(5).label).toBe('Great')
    expect(moodMeta(1).emoji).toBe('😔')
  })
})

describe('createEntry', () => {
  it('clamps mood and trims gratitude lines', () => {
    const created = createEntry({ date: '2026-03-10', mood: 9, gratitude: [' a ', '', 'b'] })
    expect(created.mood).toBe(5)
    expect(created.gratitude).toEqual(['a', 'b'])
  })
})

describe('summarise', () => {
  it('is null when empty', () => {
    expect(summarise([])).toBeNull()
  })

  it('averages mood and ranks tags', () => {
    const summary = summarise([
      entry('2026-03-10', 5, ['work', 'rest']),
      entry('2026-03-09', 3, ['work']),
    ])
    expect(summary?.average).toBe(4)
    expect(summary?.best).toBe(5)
    expect(summary?.topTags[0]).toEqual({ tag: 'work', count: 2 })
    expect(summary?.distribution[5]).toBe(1)
  })

  it('counts a logging streak', () => {
    const summary = summarise(
      [entry('2026-03-10', 4), entry('2026-03-09', 4)],
      day(2026, 3, 10),
    )
    expect(summary?.streak).toBe(2)
  })
})

describe('trend', () => {
  it('returns oldest to newest', () => {
    const series = trend([entry('2026-03-10', 4), entry('2026-03-08', 2)], 5)
    expect(series.map((item) => item.date)).toEqual(['2026-03-08', '2026-03-10'])
  })
})
