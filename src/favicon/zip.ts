export interface ZipFile {
  name: string
  data: Uint8Array
}

const CRC_TABLE: Uint32Array = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c >>> 0
  }
  return table
})()

export function crc32(data: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i += 1) {
    crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

export function buildZip(files: ZipFile[]): Uint8Array {
  const encoder = new TextEncoder()
  const entries = files.map((file) => ({
    name: encoder.encode(file.name),
    data: file.data,
    crc: crc32(file.data),
  }))

  const localSize = entries.reduce((sum, entry) => sum + 30 + entry.name.length + entry.data.length, 0)
  const centralSize = entries.reduce((sum, entry) => sum + 46 + entry.name.length, 0)
  const out = new Uint8Array(localSize + centralSize + 22)
  const view = new DataView(out.buffer)
  let offset = 0

  const u16 = (value: number) => {
    view.setUint16(offset, value, true)
    offset += 2
  }
  const u32 = (value: number) => {
    view.setUint32(offset, value >>> 0, true)
    offset += 4
  }
  const bytes = (chunk: Uint8Array) => {
    out.set(chunk, offset)
    offset += chunk.length
  }

  const offsets: number[] = []
  for (const entry of entries) {
    offsets.push(offset)
    u32(0x04034b50)
    u16(20)
    u16(0x0800)
    u16(0)
    u16(0)
    u16(0)
    u32(entry.crc)
    u32(entry.data.length)
    u32(entry.data.length)
    u16(entry.name.length)
    u16(0)
    bytes(entry.name)
    bytes(entry.data)
  }

  const centralOffset = offset
  entries.forEach((entry, index) => {
    u32(0x02014b50)
    u16(20)
    u16(20)
    u16(0x0800)
    u16(0)
    u16(0)
    u16(0)
    u32(entry.crc)
    u32(entry.data.length)
    u32(entry.data.length)
    u16(entry.name.length)
    u16(0)
    u16(0)
    u16(0)
    u16(0)
    u32(0)
    u32(offsets[index])
    bytes(entry.name)
  })

  const directorySize = offset - centralOffset

  u32(0x06054b50)
  u16(0)
  u16(0)
  u16(entries.length)
  u16(entries.length)
  u32(directorySize)
  u32(centralOffset)
  u16(0)

  return out
}
