export type FaviconShape = 'square' | 'rounded' | 'circle'

export interface FaviconConfig {
  text: string
  background: string
  foreground: string
  shape: FaviconShape
  bold: boolean
}

export const SIZES = [16, 32, 48, 180, 192, 512]

export const emptyFavicon = (): FaviconConfig => ({
  text: 'A',
  background: '#4f46e5',
  foreground: '#ffffff',
  shape: 'rounded',
  bold: true,
})

const escape = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function faviconSvg(config: FaviconConfig): string {
  const size = 64
  const radius = config.shape === 'circle' ? size / 2 : config.shape === 'rounded' ? 14 : 0
  const label = escape(config.text.trim().slice(0, 2) || 'A')
  const fontSize = label.length > 1 ? 30 : 40
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">`,
    `<rect width="${size}" height="${size}" rx="${radius}" fill="${config.background}" />`,
    `<text x="${size / 2}" y="${size / 2}" text-anchor="middle" dominant-baseline="central" font-family="Inter, Arial, sans-serif" font-size="${fontSize}" font-weight="${config.bold ? 700 : 400}" fill="${config.foreground}">${label}</text>`,
    `</svg>`,
  ].join('')
}

export const faviconDataUri = (config: FaviconConfig): string =>
  `data:image/svg+xml;utf8,${encodeURIComponent(faviconSvg(config))}`

export function faviconLinkTag(config: FaviconConfig): string {
  return `<link rel="icon" href="${faviconDataUri(config)}" />`
}
