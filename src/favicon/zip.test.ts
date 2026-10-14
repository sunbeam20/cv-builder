import { describe, expect, it } from 'vitest'
import { buildZip, crc32 } from './zip'

const encoder = new TextEncoder()

describe('crc32', () => {
  it('matches the standard check vector', () => {
    expect(crc32(encoder.encode('123456789'))).toBe(0xcbf43926)
  })

  it('returns zero for empty input', () => {
    expect(crc32(new Uint8Array())).toBe(0)
  })
})

describe('buildZip', () => {
  it('writes a store-method archive with the expected markers', () => {
    const data = encoder.encode('hello world')
    const bytes = buildZip([{ name: 'a.txt', data }])

    expect(Array.from(bytes.slice(0, 4))).toEqual([0x50, 0x4b, 0x03, 0x04])
    expect(String.fromCharCode(...bytes)).toContain('a.txt')
    expect(Array.from(bytes.slice(bytes.length - 22, bytes.length - 18))).toEqual([0x50, 0x4b, 0x05, 0x06])
  })

  it('stores the payload bytes verbatim', () => {
    const data = encoder.encode('hello world')
    const bytes = buildZip([{ name: 'a.txt', data }])
    expect(String.fromCharCode(...bytes)).toContain('hello world')
  })
})
