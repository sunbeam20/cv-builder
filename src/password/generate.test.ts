import { describe, expect, it } from 'vitest'
import {
  DEFAULT_OPTIONS,
  LENGTH_MAX,
  LENGTH_MIN,
  activePools,
  generatePassphrase,
  generatePassword,
  passwordStrength,
  type PasswordOptions,
} from './generate'

const opts = (patch: Partial<PasswordOptions> = {}): PasswordOptions => ({
  ...DEFAULT_OPTIONS,
  ...patch,
})

describe('generatePassword', () => {
  it('honours the requested length', () => {
    expect(generatePassword(opts({ length: 24 }))).toHaveLength(24)
  })

  it('includes at least one character from every selected pool', () => {
    for (let i = 0; i < 50; i++) {
      const pw = generatePassword(opts({ length: 12 }))
      expect(pw).toMatch(/[a-z]/)
      expect(pw).toMatch(/[A-Z]/)
      expect(pw).toMatch(/[0-9]/)
      expect(pw).toMatch(/[^A-Za-z0-9]/)
    }
  })

  it('only uses the selected pools', () => {
    const pw = generatePassword(
      opts({ length: 30, uppercase: false, numbers: false, symbols: false }),
    )
    expect(pw).toMatch(/^[a-z]+$/)
  })

  it('drops look-alike characters when asked', () => {
    const pw = generatePassword(opts({ length: 40, avoidAmbiguous: true }))
    expect(pw).not.toMatch(/[il1Lo0O]/)
  })

  it('clamps the length into the supported range', () => {
    expect(generatePassword(opts({ length: 1 })).length).toBeGreaterThanOrEqual(LENGTH_MIN)
    expect(generatePassword(opts({ length: 999 })).length).toBe(LENGTH_MAX)
  })

  it('returns an empty string when no pools are selected', () => {
    expect(
      generatePassword(opts({ lowercase: false, uppercase: false, numbers: false, symbols: false })),
    ).toBe('')
  })

  it('is deterministic given a fixed rng', () => {
    const constant = () => 0
    expect(generatePassword(opts({ length: 8 }), constant)).toBe(
      generatePassword(opts({ length: 8 }), constant),
    )
  })
})

describe('activePools', () => {
  it('strips ambiguous characters from the letter/number pools', () => {
    const pools = activePools(opts({ avoidAmbiguous: true }))
    expect(pools.join('')).not.toMatch(/[il1Lo0O]/)
  })
})

describe('passwordStrength', () => {
  it('rates an empty password as very weak', () => {
    expect(passwordStrength('').score).toBe(0)
  })

  it('rates stronger, longer passwords higher', () => {
    const weak = passwordStrength('abc')
    const strong = passwordStrength('Tr0ub4dor&3xKp9')
    expect(strong.score).toBeGreaterThan(weak.score)
    expect(strong.entropy).toBeGreaterThan(weak.entropy)
  })
})

describe('generatePassphrase', () => {
  it('joins the requested number of words', () => {
    const phrase = generatePassphrase(5, '-', () => 0)
    expect(phrase.split('-')).toHaveLength(5)
  })

  it('clamps the word count', () => {
    expect(generatePassphrase(1, '-', () => 0).split('-')).toHaveLength(3)
    expect(generatePassphrase(99, '-', () => 0).split('-')).toHaveLength(8)
  })

  it('uses the given separator', () => {
    expect(generatePassphrase(3, '.', () => 0)).toBe('amber.amber.amber')
  })
})
