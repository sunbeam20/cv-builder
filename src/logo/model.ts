export type LogoShape = 'none' | 'circle' | 'square' | 'rounded' | 'hex'

export type LogoLayout = 'stacked' | 'inline'

export interface LogoIcon {
  id: string
  label: string
  path: string
}

export interface LogoConfig {
  text: string
  tagline: string
  monogram: string
  shape: LogoShape
  icon: string
  primary: string
  secondary: string
  gradient: boolean
  layout: LogoLayout
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

export const LAYOUTS: { id: LogoLayout; label: string }[] = [
  { id: 'stacked', label: 'Stacked' },
  { id: 'inline', label: 'Inline' },
]

export const ICONS: LogoIcon[] = [
  { id: 'bolt', label: 'Bolt', path: 'M13 2 3 14h7l-1 8 10-12h-7l1-8z' },
  { id: 'leaf', label: 'Leaf', path: 'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10zM2 21c0-3 1.85-5.36 5.08-6' },
  { id: 'code', label: 'Code', path: 'M16 18l6-6-6-6M8 6l-6 6 6 6' },
  { id: 'heart', label: 'Heart', path: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z' },
  { id: 'star', label: 'Star', path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  { id: 'cube', label: 'Cube', path: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12' },
  { id: 'wave', label: 'Wave', path: 'M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 1.3 0 1.9-.5 2.5-1M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 1.3 0 1.9-.5 2.5-1M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 1.3 0 1.9-.5 2.5-1' },
  { id: 'mountain', label: 'Mountain', path: 'M8 3l4 8 5-5 5 15H2L8 3z' },
  { id: 'rocket', label: 'Rocket', path: 'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2zM9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5' },
  { id: 'chat', label: 'Chat', path: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
  { id: 'shield', label: 'Shield', path: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  { id: 'sparkle', label: 'Sparkle', path: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3zM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z' },
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

const SECONDARIES = ['#0ea5e9', '#6366f1', '#f97316', '#10b981', '#e11d48', '#8b5cf6']

export const emptyLogo = (): LogoConfig => ({
  text: 'Northwind',
  tagline: 'Design studio',
  monogram: '',
  shape: 'rounded',
  icon: '',
  primary: PALETTES[0]!.primary,
  secondary: '#0ea5e9',
  gradient: false,
  layout: 'stacked',
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

const iconFor = (id: string): LogoIcon | undefined => ICONS.find((entry) => entry.id === id)

const markSvg = (config: LogoConfig, monogram: string, cx: number, cy: number, size: number, color: string): string => {
  const icon = iconFor(config.icon)
  if (icon) {
    const unit = (size * 0.6) / 24
    const offset = unit * 12
    return `<g transform="translate(${(cx - offset).toFixed(2)} ${(cy - offset).toFixed(2)}) scale(${unit.toFixed(4)})"><path d="${icon.path}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></g>`
  }
  return `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" font-family="${escape(config.font)}" font-size="${(size * 0.46).toFixed(0)}" font-weight="700" fill="${color}">${escape(monogram)}</text>`
}

export function logoSvg(config: LogoConfig): string {
  const hasBadge = config.shape !== 'none'
  const monogram = monogramFor(config)
  const badgeFill = config.gradient ? 'url(#g)' : escape(config.primary)
  const markFill = config.gradient ? 'url(#g)' : escape(config.primary)
  const parts: string[] = []
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img" aria-label="${escape(config.text)} logo">`)
  parts.push(`<rect width="512" height="512" fill="${escape(config.background)}" />`)
  if (config.gradient) {
    parts.push(
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${escape(config.primary)}"/><stop offset="1" stop-color="${escape(config.secondary)}"/></linearGradient></defs>`,
    )
  }

  if (config.layout === 'inline') {
    if (hasBadge) parts.push(`<g fill="${badgeFill}">${badgePath(config.shape, 120, 256, 180)}</g>`)
    parts.push(markSvg(config, monogram, 120, 256, 180, hasBadge ? '#ffffff' : markFill))
    parts.push(
      `<text x="235" y="238" text-anchor="start" font-family="${escape(config.font)}" font-size="62" font-weight="700" fill="${escape(config.textColor)}">${escape(config.text)}</text>`,
    )
    if (config.tagline.trim()) {
      parts.push(
        `<text x="235" y="286" text-anchor="start" font-family="${escape(config.font)}" font-size="26" letter-spacing="2" fill="${escape(config.textColor)}" opacity="0.7">${escape(config.tagline.toUpperCase())}</text>`,
      )
    }
  } else {
    if (hasBadge) {
      parts.push(`<g fill="${badgeFill}">${badgePath(config.shape, 256, 210, 200)}</g>`)
      parts.push(markSvg(config, monogram, 256, 210, 200, '#ffffff'))
    } else {
      parts.push(markSvg(config, monogram, 256, 200, 326, markFill))
    }
    parts.push(
      `<text x="256" y="400" text-anchor="middle" font-family="${escape(config.font)}" font-size="60" font-weight="700" fill="${escape(config.textColor)}">${escape(config.text)}</text>`,
    )
    if (config.tagline.trim()) {
      parts.push(
        `<text x="256" y="452" text-anchor="middle" font-family="${escape(config.font)}" font-size="26" letter-spacing="2" fill="${escape(config.textColor)}" opacity="0.7">${escape(config.tagline.toUpperCase())}</text>`,
      )
    }
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
  const icon = ICONS[Math.floor(Math.random() * ICONS.length)]!.id
  const secondary = SECONDARIES[Math.floor(Math.random() * SECONDARIES.length)]!
  return {
    ...base,
    ...palette,
    shape,
    font,
    icon: Math.random() < 0.5 ? icon : '',
    gradient: Math.random() < 0.5,
    secondary,
    layout: Math.random() < 0.5 ? 'stacked' : 'inline',
  }
}
