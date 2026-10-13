import { describe, expect, it } from 'vitest'
import { generateLorem } from './lorem'

function seeded(seed = 1): () => number {
  let state = seed
  return () => {
    state = (state * 16807) % 2147483647
    return state / 2147483647
  }
}

describe('generateLorem', () => {
  it('generates the requested number of words', () => {
    const text = generateLorem({ count: 10, unit: 'words', rng: seeded() })
    expect(text.split(' ')).toHaveLength(10)
  })

  it('generates the requested number of sentences', () => {
    const text = generateLorem({ count: 3, unit: 'sentences', rng: seeded() })
    expect(text.match(/\./g)).toHaveLength(3)
  })

  it('generates the requested number of paragraphs', () => {
    const text = generateLorem({ count: 2, unit: 'paragraphs', rng: seeded() })
    expect(text.split('\n\n')).toHaveLength(2)
  })

  it('starts with the classic opener when asked', () => {
    const text = generateLorem({ count: 5, unit: 'words', startWithLorem: true, rng: seeded() })
    expect(text.startsWith('Lorem ipsum dolor sit amet')).toBe(true)
  })

  it('supports the modern word bank', () => {
    const text = generateLorem({ count: 20, unit: 'words', mode: 'modern', rng: seeded() })
    expect(text.split(' ')).toHaveLength(20)
  })

  it('is deterministic for a fixed seed', () => {
    const a = generateLorem({ count: 20, unit: 'words', rng: seeded(42) })
    const b = generateLorem({ count: 20, unit: 'words', rng: seeded(42) })
    expect(a).toBe(b)
  })
})
