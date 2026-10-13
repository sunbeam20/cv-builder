/** Longest edge (px) a stored profile picture is downscaled to. */
const MAX_EDGE = 256

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.onerror = () => reject(reader.error ?? new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Could not decode image'))
    image.src = src
  })
}

/**
 * Turn an uploaded file into a small, square data URL suitable for embedding on
 * the page and sharing in a link. Centre-crops to a square and downscales to
 * {@link MAX_EDGE}. Falls back to the original data URL if the image cannot be
 * processed (e.g. an unsupported format).
 */
export async function fileToPhoto(file: File): Promise<string> {
  const original = await readFile(file)
  if (!file.type.startsWith('image/')) return original
  try {
    const image = await loadImage(original)
    const shortest = Math.min(image.naturalWidth, image.naturalHeight)
    if (!shortest) return original
    const edge = Math.min(MAX_EDGE, shortest)
    const canvas = document.createElement('canvas')
    canvas.width = edge
    canvas.height = edge
    const ctx = canvas.getContext('2d')
    if (!ctx) return original
    const sx = (image.naturalWidth - shortest) / 2
    const sy = (image.naturalHeight - shortest) / 2
    ctx.drawImage(image, sx, sy, shortest, shortest, 0, 0, edge, edge)
    const out = canvas.toDataURL('image/jpeg', 0.82)
    return out.startsWith('data:image/') ? out : original
  } catch {
    return original
  }
}
