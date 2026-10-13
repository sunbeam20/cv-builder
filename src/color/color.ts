export interface RGB {
  r: number
  g: number
  b: number
}

export interface HSL {
  h: number
  s: number
  l: number
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

/** Parse `#rgb`, `#rgba`, `#rrggbb`, or `#rrggbbaa` (case-insensitive). */
export function parseHex(input: string): RGB | null {
  const value = input.trim().replace(/^#/, '')
  if (!/^[0-9a-fA-F]+$/.test(value)) return null
  const expand = (c: string) => parseInt(c + c, 16)
  if (value.length === 3 || value.length === 4) {
    return { r: expand(value[0]), g: expand(value[1]), b: expand(value[2]) }
  }
  if (value.length === 6 || value.length === 8) {
    return {
      r: parseInt(value.slice(0, 2), 16),
      g: parseInt(value.slice(2, 4), 16),
      b: parseInt(value.slice(4, 6), 16),
    }
  }
  return null
}

export function rgbToHex({ r, g, b }: RGB): string {
  const part = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0')
  return `#${part(r)}${part(g)}${part(b)}`
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min
  let h = 0
  if (delta !== 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6
    else if (max === gn) h = (bn - rn) / delta + 2
    else h = (rn - gn) / delta + 4
    h *= 60
    if (h < 0) h += 360
  }
  const l = (max + min) / 2
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) }
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const sn = s / 100
  const ln = l / 100
  const c = (1 - Math.abs(2 * ln - 1)) * sn
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = ln - c / 2
  let rp = 0
  let gp = 0
  let bp = 0
  if (h < 60) [rp, gp, bp] = [c, x, 0]
  else if (h < 120) [rp, gp, bp] = [x, c, 0]
  else if (h < 180) [rp, gp, bp] = [0, c, x]
  else if (h < 240) [rp, gp, bp] = [0, x, c]
  else if (h < 300) [rp, gp, bp] = [x, 0, c]
  else [rp, gp, bp] = [c, 0, x]
  return {
    r: Math.round((rp + m) * 255),
    g: Math.round((gp + m) * 255),
    b: Math.round((bp + m) * 255),
  }
}

const channel = (value: number): number => {
  const v = value / 255
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance({ r, g, b }: RGB): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

export function contrastRatio(a: RGB, b: RGB): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const lighter = Math.max(la, lb)
  const darker = Math.min(la, lb)
  return (lighter + 0.05) / (darker + 0.05)
}

export type WcagLevel = 'AAA' | 'AA' | 'AA Large' | 'Fail'

export function wcagLevel(ratio: number): WcagLevel {
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  if (ratio >= 3) return 'AA Large'
  return 'Fail'
}

export interface RampStep {
  step: number
  hex: string
}

export const RAMP_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const

const STEP_LIGHTNESS: Record<number, number> = {
  50: 97,
  100: 94,
  200: 86,
  300: 76,
  400: 66,
  500: 56,
  600: 46,
  700: 38,
  800: 30,
  900: 24,
  950: 16,
}

/** Build a Tailwind-style colour ramp (50–950) from a single base colour. */
export function generateRamp(base: RGB): RampStep[] {
  const { h, s } = rgbToHsl(base)
  const saturation = Math.max(s, 12)
  return RAMP_STEPS.map((step) => ({
    step,
    hex: rgbToHex(hslToRgb({ h, s: saturation, l: STEP_LIGHTNESS[step] })),
  }))
}

export function toCssVariables(ramp: RampStep[], name = 'brand'): string {
  return ramp.map((entry) => `  --color-${name}-${entry.step}: ${entry.hex};`).join('\n')
}

export function toTailwind(ramp: RampStep[], name = 'brand'): string {
  const entries = ramp.map((entry) => `        ${entry.step}: '${entry.hex}',`).join('\n')
  return `${name}: {\n${entries}\n      },`
}
