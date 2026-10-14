export type FaviconShape = 'square' | 'rounded' | 'circle'

export type FaviconMode = 'letter' | 'image'

export interface FaviconConfig {
  mode: FaviconMode
  text: string
  image: string
  background: string
  foreground: string
  shape: FaviconShape
  bold: boolean
}

export const SIZES = [16, 32, 48, 180, 192, 512]

export const emptyFavicon = (): FaviconConfig => ({
  mode: 'letter',
  text: 'A',
  image: '',
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
  if (config.mode === 'image' && config.image.startsWith('data:image/')) {
    return [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">`,
      `<defs><clipPath id="favicon-clip"><rect width="${size}" height="${size}" rx="${radius}" /></clipPath></defs>`,
      `<rect width="${size}" height="${size}" rx="${radius}" fill="${config.background}" />`,
      `<image href="${config.image}" x="0" y="0" width="${size}" height="${size}" preserveAspectRatio="xMidYMid slice" clip-path="url(#favicon-clip)" />`,
      `</svg>`,
    ].join('')
  }
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

export function webmanifest(config: FaviconConfig, name = 'App'): string {
  const icons: { src: string; sizes: string; type: string; purpose?: string }[] = SIZES.map((size) => ({
    src: `favicon-${size}.png`,
    sizes: `${size}x${size}`,
    type: 'image/png',
  }))
  icons.push({ src: 'favicon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' })
  return JSON.stringify(
    {
      name,
      short_name: name,
      icons,
      theme_color: config.background,
      background_color: config.background,
      display: 'standalone',
    },
    null,
    2,
  )
}

export function linkTags(): string {
  return [
    '<link rel="icon" href="/favicon.ico" sizes="any">',
    '<link rel="icon" href="/favicon.svg" type="image/svg+xml">',
    '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
    '<link rel="manifest" href="/site.webmanifest">',
  ].join('\n')
}
