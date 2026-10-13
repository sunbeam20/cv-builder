import { describe, expect, it } from 'vitest'
import {
  countRows,
  csvToJson,
  formatJson,
  jsonToCsv,
  minifyJson,
  parseCsv,
  parseJson,
  stringifyCsv,
} from './model'

describe('parseJson', () => {
  it('parses valid JSON and reports errors', () => {
    expect(parseJson('{"a":1}').ok).toBe(true)
    expect(parseJson('{oops}').ok).toBe(false)
    expect(parseJson('').error).toBe('Nothing to parse')
  })
})

describe('formatJson / minifyJson', () => {
  it('pretty-prints', () => {
    expect(formatJson('{"a":1}').value).toBe('{\n  "a": 1\n}')
  })

  it('minifies', () => {
    expect(minifyJson('{\n  "a": 1\n}').value).toBe('{"a":1}')
  })
})

describe('parseCsv / stringifyCsv', () => {
  it('parses quoted fields and escaped quotes', () => {
    expect(parseCsv('a,"b,c"\n"say ""hi""",d')).toEqual([
      ['a', 'b,c'],
      ['say "hi"', 'd'],
    ])
  })

  it('escapes when stringifying', () => {
    expect(stringifyCsv([['a', 'b,c']])).toBe('a,"b,c"')
  })

  it('counts non-empty rows', () => {
    expect(countRows('a,b\n\nc,d')).toBe(2)
  })
})

describe('jsonToCsv', () => {
  it('converts an array of objects via the union of keys', () => {
    const result = jsonToCsv('[{"a":1,"b":2},{"a":3,"c":4}]')
    expect(result.value).toBe('a,b,c\n1,2,\n3,,4')
  })

  it('converts an array of arrays', () => {
    expect(jsonToCsv('[[1,2],[3,4]]').value).toBe('1,2\n3,4')
  })

  it('rejects non-arrays', () => {
    expect(jsonToCsv('{"a":1}').ok).toBe(false)
  })
})

describe('csvToJson', () => {
  it('uses the header row as keys', () => {
    const result = csvToJson('name,role\nAda,Engineer')
    expect(JSON.parse(String(result.value))).toEqual([{ name: 'Ada', role: 'Engineer' }])
  })
})
