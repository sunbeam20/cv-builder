export interface PasswordOptions {
  length: number
  lowercase: boolean
  uppercase: boolean
  numbers: boolean
  symbols: boolean
  /** Drop look-alike characters (i l 1 L o 0 O). */
  avoidAmbiguous: boolean
}

export const LENGTH_MIN = 4
export const LENGTH_MAX = 64

export const DEFAULT_OPTIONS: PasswordOptions = {
  length: 16,
  lowercase: true,
  uppercase: true,
  numbers: true,
  symbols: true,
  avoidAmbiguous: false,
}

const LOWER = 'abcdefghijklmnopqrstuvwxyz'
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const NUMBERS = '0123456789'
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.?/'
const AMBIGUOUS = new Set(['i', 'l', '1', 'L', 'o', '0', 'O'])

/** A random float in [0, 1). Uses the Web Crypto RNG when available. */
export function systemRandom(): number {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const buf = new Uint32Array(1)
    crypto.getRandomValues(buf)
    return buf[0] / 4294967296
  }
  return Math.random()
}

type Rng = () => number

const clean = (pool: string, avoidAmbiguous: boolean): string =>
  avoidAmbiguous ? [...pool].filter((c) => !AMBIGUOUS.has(c)).join('') : pool

/** The pools that are active for a given option set (ambiguous chars stripped). */
export function activePools(options: PasswordOptions): string[] {
  const pools: string[] = []
  if (options.lowercase) pools.push(clean(LOWER, options.avoidAmbiguous))
  if (options.uppercase) pools.push(clean(UPPER, options.avoidAmbiguous))
  if (options.numbers) pools.push(clean(NUMBERS, options.avoidAmbiguous))
  if (options.symbols) pools.push(SYMBOLS)
  return pools.filter((pool) => pool.length > 0)
}

const pick = (pool: string | readonly string[], rng: Rng): string =>
  pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))]

function shuffle(chars: string[], rng: Rng): string[] {
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars
}

/**
 * Generate a password that is guaranteed to include at least one character from
 * every selected pool, then padded and shuffled. Returns '' when no pool is active.
 */
export function generatePassword(options: PasswordOptions, rng: Rng = systemRandom): string {
  const pools = activePools(options)
  if (pools.length === 0) return ''

  const length = Math.min(LENGTH_MAX, Math.max(LENGTH_MIN, pools.length, Math.round(options.length)))
  const combined = pools.join('')
  const chars: string[] = pools.map((pool) => pick(pool, rng))
  while (chars.length < length) chars.push(pick(combined, rng))
  return shuffle(chars, rng).slice(0, length).join('')
}

export interface Strength {
  /** 0 (very weak) – 4 (excellent). */
  score: number
  label: string
  /** Estimated entropy in bits. */
  entropy: number
}

const LABELS = ['Very weak', 'Weak', 'Fair', 'Strong', 'Excellent']

function charsetSize(password: string): number {
  let size = 0
  if (/[a-z]/.test(password)) size += 26
  if (/[A-Z]/.test(password)) size += 26
  if (/[0-9]/.test(password)) size += 10
  if (/[^A-Za-z0-9]/.test(password)) size += SYMBOLS.length
  return size
}

export function passwordStrength(password: string): Strength {
  if (!password) return { score: 0, label: LABELS[0], entropy: 0 }
  const size = charsetSize(password)
  const entropy = size > 0 ? password.length * Math.log2(size) : 0
  const score = entropy >= 100 ? 4 : entropy >= 60 ? 3 : entropy >= 36 ? 2 : entropy >= 28 ? 1 : 0
  return { score, label: LABELS[score], entropy: Math.round(entropy) }
}

const WORDS = [
  'amber', 'anchor', 'basket', 'bison', 'breeze', 'cabin', 'candle', 'canyon',
  'cedar', 'cobalt', 'comet', 'copper', 'coral', 'cosmos', 'crater', 'daisy',
  'dolphin', 'ember', 'falcon', 'ferry', 'forest', 'galaxy', 'garden', 'ginger',
  'glacier', 'granite', 'harbor', 'hazel', 'indigo', 'ivory', 'jasmine', 'jungle',
  'kernel', 'lantern', 'lemon', 'lilac', 'lunar', 'magnet', 'maple', 'marble',
  'meadow', 'meteor', 'mint', 'nebula', 'nectar', 'nickel', 'oasis', 'olive',
  'onyx', 'orchid', 'otter', 'pebble', 'pepper', 'plasma', 'pond', 'prairie',
  'quartz', 'raven', 'ripple', 'saffron', 'sequoia', 'silver', 'sorbet', 'spruce',
  'summit', 'thistle', 'timber', 'topaz', 'tulip', 'umber', 'valley', 'velvet',
  'walnut', 'willow', 'yarrow', 'zephyr',
]

export const WORDLIST = WORDS

/** Generate a diceware-style passphrase from the built-in word list. */
export function generatePassphrase(
  wordCount = 4,
  separator = '-',
  rng: Rng = systemRandom,
): string {
  const count = Math.max(3, Math.min(8, Math.round(wordCount)))
  const words: string[] = []
  for (let i = 0; i < count; i++) words.push(pick(WORDS, rng))
  return words.join(separator)
}
