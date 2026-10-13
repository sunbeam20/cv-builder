export type LogoShape = 'none' | 'circle' | 'square' | 'rounded' | 'hex'

export interface LogoConfig {
  text: string
  tagline: string
  monogram: string
  shape: LogoShape
  primary: string
  background: string
  textColor: string
  font: string
}

export const SHAPES: { id: LogoShape; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'circle', label: 'Circle' },
  { id: 'square', label: 'Square' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'hex', label: 'Hexagon' },
]

export const FONTS = [
  'Inter, system-ui, sans-serif',
  'Georgia, serif',
  '"Courier New", monospace',
  'Impact, "Arial Black", sans-serif',
  '"Trebuchet MS", sans-serif',
]

export const PALETTES: { primary: string; background: string; textColor: string }[] = [
  { primary: '#4f46e5', background: '#ffffff', textColor: '#1e293b' },
  { primary: '#0ea5e9', background: '#0f172a', textColor: '#e2e8f0' },
  { primary: '#f97316', background: '#ffffff', textColor: '#111827' },
  { primary: '#10b981', background: '#ecfdf5', textColor: '#064e3b' },
  { primary: '#e11d48', background: '#fff1f2', textColor: '#881337' },
]

export const emptyLogo = (): LogoConfig => ({
  text: 'Northwind',
  tagline: 'Design studio',
  monogram: '',
  shape: 'rounded',
  primary: PALETTES[0]!.primary,
  background: PALETTES[0]!.background,
  textColor: PALETTES[0]!.textColor,
  font: FONTS[0]!,
})

export const monogramFor = (config: LogoConfig): string => {
  const source = config.monogram.trim() || config.text
  const words = source.trim().split(/\s+/).filter(Boolean)
  if (words.length >= 2) return (words[0]![0]! + words[1]![0]!).toUpperCase()
  return source.slice(0, 2).toUpperCase()
}

const escape = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function badgePath(shape: LogoShape, cx: number, cy: number, size: number): string {
  const half = size / 2
  switch (shape) {
    case 'circle':
      return `<circle cx="${cx}" cy="${cy}" r="${half}" />`
    case 'square':
      return `<rect x="${cx - half}" y="${cy - half}" width="${size}" height="${size}" />`
    case 'rounded':
      return `<rect x="${cx - half}" y="${cy - half}" width="${size}" height="${size}" rx="${size * 0.22}" />`
    case 'hex': {
      const points: string[] = []
      for (let i = 0; i < 6; i += 1) {
        const angle = (Math.PI / 3) * i - Math.PI / 6
        points.push(`${(cx + half * Math.cos(angle)).toFixed(1)},${(cy + half * Math.sin(angle)).toFixed(1)}`)
      }
      return `<polygon points="${points.join(' ')}" />`
    }
    default:
      return ''
  }
}

export function logoSvg(config: LogoConfig): string {
  const hasBadge = config.shape !== 'none'
  const monogram = monogramFor(config)
  const parts: string[] = []
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img" aria-label="${escape(config.text)} logo">`)
  parts.push(`<rect width="512" height="512" fill="${escape(config.background)}" />`)
  if (hasBadge) {
    parts.push(`<g fill="${escape(config.primary)}">${badgePath(config.shape, 256, 210, 200)}</g>`)
    parts.push(
      `<text x="256" y="210" text-anchor="middle" dominant-baseline="central" font-family="${escape(config.font)}" font-size="92" font-weight="700" fill="#ffffff">${escape(monogram)}</text>`,
    )
  } else {
    parts.push(
      `<text x="256" y="200" text-anchor="middle" dominant-baseline="central" font-family="${escape(config.font)}" font-size="150" font-weight="800" fill="${escape(config.primary)}">${escape(monogram)}</text>`,
    )
  }
  parts.push(
    `<text x="256" y="400" text-anchor="middle" font-family="${escape(config.font)}" font-size="60" font-weight="700" fill="${escape(config.textColor)}">${escape(config.text)}</text>`,
  )
  if (config.tagline.trim()) {
    parts.push(
      `<text x="256" y="452" text-anchor="middle" font-family="${escape(config.font)}" font-size="26" letter-spacing="2" fill="${escape(config.textColor)}" opacity="0.7">${escape(config.tagline.toUpperCase())}</text>`,
    )
  }
  parts.push('</svg>')
  return parts.join('')
}

export const logoSvgDataUri = (config: LogoConfig): string =>
  `data:image/svg+xml;utf8,${encodeURIComponent(logoSvg(config))}`

export const randomLogo = (base: LogoConfig): LogoConfig => {
  const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)]!
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)]!.id
  const font = FONTS[Math.floor(Math.random() * FONTS.length)]!
  return { ...base, ...palette, shape, font }
}
