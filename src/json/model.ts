export interface JsonResult {
  ok: boolean
  value?: unknown
  error?: string
}

export function parseJson(text: string): JsonResult {
  const trimmed = text.trim()
  if (!trimmed) return { ok: false, error: 'Nothing to parse' }
  try {
    return { ok: true, value: JSON.parse(trimmed) }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Invalid JSON' }
  }
}

export const formatJson = (text: string, indent = 2): JsonResult => {
  const parsed = parseJson(text)
  if (!parsed.ok) return parsed
  return { ok: true, value: JSON.stringify(parsed.value, null, indent) }
}

export const minifyJson = (text: string): JsonResult => {
  const parsed = parseJson(text)
  if (!parsed.ok) return parsed
  return { ok: true, value: JSON.stringify(parsed.value) }
}

/** Parse CSV text into a matrix of raw string fields (handles quotes/newlines). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  const source = text.replace(/\r\n/g, '\n')

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i]
    if (inQuotes) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          field += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
      continue
    }
    if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += char
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

const escapeField = (value: string): string =>
  /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value

export function stringifyCsv(rows: string[][]): string {
  return rows.map((row) => row.map(escapeField).join(',')).join('\n')
}

const toCell = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

/** Convert JSON (array of objects/arrays/scalars) to CSV. */
export function jsonToCsv(text: string): JsonResult {
  const parsed = parseJson(text)
  if (!parsed.ok) return parsed
  const data = parsed.value
  if (!Array.isArray(data)) return { ok: false, error: 'Expected a JSON array at the top level' }
  if (data.length === 0) return { ok: true, value: '' }

  const first = data[0]
  if (Array.isArray(first)) {
    return { ok: true, value: stringifyCsv(data.map((row) => (row as unknown[]).map(toCell))) }
  }
  if (typeof first === 'object' && first !== null) {
    const headers: string[] = []
    for (const item of data) {
      if (item && typeof item === 'object') {
        for (const key of Object.keys(item)) if (!headers.includes(key)) headers.push(key)
      }
    }
    const rows = [
      headers,
      ...data.map((item) => headers.map((key) => toCell((item as Record<string, unknown>)[key]))),
    ]
    return { ok: true, value: stringifyCsv(rows) }
  }
  return { ok: true, value: stringifyCsv([['value'], ...data.map((item) => [toCell(item)])]) }
}

/** Convert CSV text (with a header row) to a JSON array of objects. */
export function csvToJson(text: string): JsonResult {
  const rows = parseCsv(text).filter((row) => row.some((cell) => cell.trim() !== ''))
  if (rows.length === 0) return { ok: false, error: 'No rows found' }
  const [header, ...body] = rows
  const keys = (header ?? []).map((value, index) => value.trim() || `column_${index + 1}`)
  const records = body.map((row) => {
    const record: Record<string, string> = {}
    keys.forEach((key, index) => {
      record[key] = row[index] ?? ''
    })
    return record
  })
  return { ok: true, value: JSON.stringify(records, null, 2) }
}

export const countRows = (text: string): number =>
  parseCsv(text).filter((row) => row.some((cell) => cell.trim() !== '')).length
