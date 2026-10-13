export type DiffOp = 'equal' | 'add' | 'remove'

export interface DiffRow {
  type: DiffOp
  text: string
  /** 1-based line number in the original text (for equal / remove rows). */
  aLine?: number
  /** 1-based line number in the changed text (for equal / add rows). */
  bLine?: number
}

export interface WordToken {
  type: DiffOp
  text: string
}

export interface DiffOptions {
  ignoreCase?: boolean
  ignoreWhitespace?: boolean
}

function makeEqual({ ignoreCase = false, ignoreWhitespace = false }: DiffOptions = {}) {
  const normalize = (value: string): string => {
    let out = value
    if (ignoreWhitespace) out = out.replace(/\s+/g, ' ').trim()
    if (ignoreCase) out = out.toLowerCase()
    return out
  }
  return (a: string, b: string) => normalize(a) === normalize(b)
}

/**
 * Longest-common-subsequence diff over two token arrays. Produces an ordered
 * list of operations where every token is either kept (`equal`), dropped
 * (`remove`), or inserted (`add`).
 */
function lcs(
  a: string[],
  b: string[],
  equal: (x: string, y: string) => boolean,
): Array<{ type: DiffOp; ai?: number; bi?: number }> {
  const n = a.length
  const m = b.length
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      dp[i][j] = equal(a[i], b[j]) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }

  const ops: Array<{ type: DiffOp; ai?: number; bi?: number }> = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (equal(a[i], b[j])) {
      ops.push({ type: 'equal', ai: i, bi: j })
      i += 1
      j += 1
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: 'remove', ai: i })
      i += 1
    } else {
      ops.push({ type: 'add', bi: j })
      j += 1
    }
  }
  while (i < n) {
    ops.push({ type: 'remove', ai: i })
    i += 1
  }
  while (j < m) {
    ops.push({ type: 'add', bi: j })
    j += 1
  }
  return ops
}

const splitLines = (text: string): string[] => (text.length ? text.split('\n') : [])

/** Line-level diff with original line numbers for each side. */
export function diffLines(aText: string, bText: string, options: DiffOptions = {}): DiffRow[] {
  const a = splitLines(aText)
  const b = splitLines(bText)
  const ops = lcs(a, b, makeEqual(options))

  let aLine = 1
  let bLine = 1
  return ops.map((op): DiffRow => {
    if (op.type === 'equal') {
      const row: DiffRow = { type: 'equal', text: a[op.ai as number], aLine, bLine }
      aLine += 1
      bLine += 1
      return row
    }
    if (op.type === 'remove') {
      const row: DiffRow = { type: 'remove', text: a[op.ai as number], aLine }
      aLine += 1
      return row
    }
    const row: DiffRow = { type: 'add', text: b[op.bi as number], bLine }
    bLine += 1
    return row
  })
}

const tokenize = (text: string): string[] => text.match(/\s+|\S+/g) ?? []

/** Word- and whitespace-level diff (order preserved, original casing kept). */
export function diffWords(aText: string, bText: string, options: DiffOptions = {}): WordToken[] {
  const a = tokenize(aText)
  const b = tokenize(bText)
  const ops = lcs(a, b, makeEqual(options))
  return ops.map((op): WordToken => {
    if (op.type === 'equal') return { type: 'equal', text: a[op.ai as number] }
    if (op.type === 'remove') return { type: 'remove', text: a[op.ai as number] }
    return { type: 'add', text: b[op.bi as number] }
  })
}

export interface DiffStats {
  added: number
  removed: number
  unchanged: number
}

export function diffStats(rows: Array<{ type: DiffOp }>): DiffStats {
  const stats: DiffStats = { added: 0, removed: 0, unchanged: 0 }
  for (const row of rows) {
    if (row.type === 'add') stats.added += 1
    else if (row.type === 'remove') stats.removed += 1
    else stats.unchanged += 1
  }
  return stats
}
