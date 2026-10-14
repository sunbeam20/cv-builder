export interface IcoImage {
  size: number
  png: Uint8Array
}

export function buildIco(images: IcoImage[]): Uint8Array {
  const payloadSize = images.reduce((sum, image) => sum + image.png.length, 0)
  const out = new Uint8Array(6 + images.length * 16 + payloadSize)
  const view = new DataView(out.buffer)

  view.setUint16(0, 0, true)
  view.setUint16(2, 1, true)
  view.setUint16(4, images.length, true)

  let entryOffset = 6
  let dataOffset = 6 + images.length * 16
  for (const image of images) {
    const dimension = image.size >= 256 ? 0 : image.size
    out[entryOffset] = dimension
    out[entryOffset + 1] = dimension
    out[entryOffset + 2] = 0
    out[entryOffset + 3] = 0
    view.setUint16(entryOffset + 4, 1, true)
    view.setUint16(entryOffset + 6, 32, true)
    view.setUint32(entryOffset + 8, image.png.length, true)
    view.setUint32(entryOffset + 12, dataOffset, true)
    entryOffset += 16
    dataOffset += image.png.length
  }

  let cursor = 6 + images.length * 16
  for (const image of images) {
    out.set(image.png, cursor)
    cursor += image.png.length
  }

  return out
}
