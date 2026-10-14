import { describe, expect, it } from 'vitest'
import { buildIco } from './ico'

describe('buildIco', () => {
  it('writes the ICONDIR header and entry count', () => {
    const ico = buildIco([
      { size: 16, png: new Uint8Array([1, 2, 3]) },
      { size: 32, png: new Uint8Array([4, 5]) },
    ])
    expect(Array.from(ico.slice(0, 4))).toEqual([0, 0, 1, 0])
    expect(new DataView(ico.buffer).getUint16(4, true)).toBe(2)
  })

  it('encodes the size in the entry width and height bytes', () => {
    const ico = buildIco([{ size: 48, png: new Uint8Array([1]) }])
    expect(ico[6]).toBe(48)
    expect(ico[7]).toBe(48)
  })

  it('encodes 256 as a zero byte', () => {
    const ico = buildIco([{ size: 256, png: new Uint8Array([1]) }])
    expect(ico[6]).toBe(0)
    expect(ico[7]).toBe(0)
  })
})
