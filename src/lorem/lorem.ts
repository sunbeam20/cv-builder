export type LoremUnit = 'paragraphs' | 'sentences' | 'words'
export type LoremMode = 'classic' | 'modern'

export interface LoremOptions {
  count: number
  unit: LoremUnit
  mode?: LoremMode
  startWithLorem?: boolean
  /** Injectable randomness for deterministic tests. */
  rng?: () => number
}

const CLASSIC_WORDS =
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(
    ' ',
  )

const MODERN_WORDS =
  'the quick brown fox jumps over lazy dog while bright ideas shape products people love building simple tools that work everywhere today tomorrow design teams ship features faster when feedback loops stay short and honest customers value clarity speed privacy trust so we keep interfaces focused calm and predictable'.split(
    ' ',
  )

const OPENER =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'.split(
    ' ',
  )

const RANGE = { min: 8, max: 15 }

const wordsFor = (mode: LoremMode): string[] =>
  mode === 'modern' ? MODERN_WORDS : CLASSIC_WORDS

const pick = (rng: () => number, max: number): number => Math.floor(rng() * max)

function randomWord(rng: () => number, words: string[]): string {
  return words[pick(rng, words.length)]
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

export function generateWords(count: number, options: Omit<LoremOptions, 'count' | 'unit'> = {}): string {
  const { mode = 'classic', startWithLorem = false, rng = Math.random } = options
  const words = wordsFor(mode)
  const out: string[] = []
  for (let i = 0; i < Math.max(0, count); i += 1) {
    out.push(startWithLorem && i < OPENER.length ? OPENER[i] : randomWord(rng, words))
  }
  return out.join(' ')
}

export function generateSentence(options: Omit<LoremOptions, 'unit' | 'count'> & { count?: number } = {}): string {
  const { mode = 'classic', startWithLorem = false, rng = Math.random, count } = options
  const words = wordsFor(mode)
  const length = count ?? RANGE.min + pick(rng, RANGE.max - RANGE.min + 1)
  const out: string[] = []
  for (let i = 0; i < length; i += 1) {
    out.push(startWithLorem && i < OPENER.length ? OPENER[i] : randomWord(rng, words))
  }
  return `${capitalize(out.join(' '))}.`
}

export function generateParagraph(options: Omit<LoremOptions, 'unit' | 'count'> = {}): string {
  const { rng = Math.random } = options
  const sentences = 3 + pick(rng, 3)
  const parts: string[] = []
  for (let i = 0; i < sentences; i += 1) {
    parts.push(generateSentence({ ...options, startWithLorem: false }))
  }
  return parts.join(' ')
}

/** Generate placeholder text by words, sentences, or paragraphs. */
export function generateLorem(options: LoremOptions): string {
  const { count, unit, mode = 'classic', startWithLorem = false, rng = Math.random } = options
  const normalized = Math.max(0, Math.floor(count))
  const opts = { mode, startWithLorem, rng }

  if (unit === 'words') return generateWords(normalized, opts)
  if (unit === 'sentences') {
    const parts: string[] = []
    for (let i = 0; i < normalized; i += 1) {
      parts.push(generateSentence({ ...opts, startWithLorem: startWithLorem && i === 0 }))
    }
    return parts.join(' ')
  }

  const paragraphs: string[] = []
  for (let i = 0; i < normalized; i += 1) {
    const text = generateParagraph({ ...opts, startWithLorem: false })
    paragraphs.push(startWithLorem && i === 0 ? `${OPENER.join(' ')} ${text}` : text)
  }
  return paragraphs.join('\n\n')
}
