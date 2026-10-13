import type { CSSProperties } from 'react'
import { FONT_OPTIONS } from '../lib/templates'

export type BannerBgType = 'solid' | 'gradient' | 'image'
export type BannerAlign = 'left' | 'center' | 'right'
export type BannerVAlign = 'top' | 'center' | 'bottom'

export interface BannerSize {
  id: string
  name: string
  width: number
  height: number
}

export const BANNER_SIZES: BannerSize[] = [
  { id: 'linkedin', name: 'LinkedIn banner', width: 1584, height: 396 },
  { id: 'x', name: 'X / Twitter header', width: 1500, height: 500 },
  { id: 'facebook', name: 'Facebook cover', width: 1640, height: 624 },
  { id: 'github', name: 'GitHub profile banner', width: 1280, height: 480 },
  { id: 'email', name: 'Email header', width: 1200, height: 300 },
  { id: 'youtube', name: 'YouTube channel art', width: 2560, height: 1440 },
]

export interface BannerTheme {
  id: string
  name: string
  bgColor: string
  bgColor2: string
  textColor: string
  accentColor: string
}

export const BANNER_THEMES: BannerTheme[] = [
  { id: 'indigo', name: 'Indigo', bgColor: '#4f46e5', bgColor2: '#0ea5e9', textColor: '#ffffff', accentColor: '#fbbf24' },
  { id: 'midnight', name: 'Midnight', bgColor: '#0f172a', bgColor2: '#334155', textColor: '#f8fafc', accentColor: '#38bdf8' },
  { id: 'sunset', name: 'Sunset', bgColor: '#f97316', bgColor2: '#db2777', textColor: '#ffffff', accentColor: '#fde68a' },
  { id: 'forest', name: 'Forest', bgColor: '#065f46', bgColor2: '#10b981', textColor: '#ecfdf5', accentColor: '#fcd34d' },
  { id: 'slate', name: 'Slate', bgColor: '#1e293b', bgColor2: '#475569', textColor: '#f1f5f9', accentColor: '#a5b4fc' },
  { id: 'rose', name: 'Rose', bgColor: '#9f1239', bgColor2: '#f43f5e', textColor: '#fff1f2', accentColor: '#fecdd3' },
]

export interface BannerDesign {
  sizeId: string
  width: number
  height: number
  bgType: BannerBgType
  bgColor: string
  bgColor2: string
  gradientAngle: number
  imageUrl: string
  overlay: number
  title: string
  subtitle: string
  badge: string
  showBadge: boolean
  textColor: string
  accentColor: string
  fontId: string
  titleScale: number
  align: BannerAlign
  valign: BannerVAlign
}

export const DEFAULT_DESIGN: BannerDesign = {
  sizeId: 'linkedin',
  width: 1584,
  height: 396,
  bgType: 'gradient',
  bgColor: '#4f46e5',
  bgColor2: '#0ea5e9',
  gradientAngle: 135,
  imageUrl: '',
  overlay: 0.35,
  title: 'Your Name',
  subtitle: 'Your headline — what you do and who you help.',
  badge: 'Open to work',
  showBadge: true,
  textColor: '#ffffff',
  accentColor: '#fbbf24',
  fontId: 'helvetica',
  titleScale: 1,
  align: 'center',
  valign: 'center',
}

export const STORAGE_KEY = 'banner-maker-v1'

export const findSize = (id: string): BannerSize | undefined =>
  BANNER_SIZES.find((size) => size.id === id)

export const findTheme = (id: string): BannerTheme | undefined =>
  BANNER_THEMES.find((theme) => theme.id === id)

export const fontFamily = (id: string): string =>
  FONT_OPTIONS.find((font) => font.id === id)?.cssFamily ?? FONT_OPTIONS[0].cssFamily

export function backgroundStyle(design: BannerDesign): CSSProperties {
  if (design.bgType === 'gradient') {
    return { backgroundImage: `linear-gradient(${design.gradientAngle}deg, ${design.bgColor}, ${design.bgColor2})` }
  }
  return { backgroundColor: design.bgColor }
}

export interface BannerLayout {
  padding: number
  titleSize: number
  subtitleSize: number
  badgeSize: number
  gap: number
}

export function layout(design: BannerDesign): BannerLayout {
  const { height } = design
  return {
    padding: Math.round(height * 0.12),
    titleSize: Math.round(height * 0.13 * design.titleScale),
    subtitleSize: Math.round(height * 0.048),
    badgeSize: Math.round(height * 0.036),
    gap: Math.round(height * 0.03),
  }
}

export function applyTheme(design: BannerDesign, theme: BannerTheme): BannerDesign {
  return {
    ...design,
    bgColor: theme.bgColor,
    bgColor2: theme.bgColor2,
    textColor: theme.textColor,
    accentColor: theme.accentColor,
  }
}

export function clampDimension(value: number): number {
  if (!Number.isFinite(value)) return 800
  return Math.max(100, Math.min(4000, Math.round(value)))
}

export function loadDesign(): BannerDesign {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_DESIGN, ...(JSON.parse(raw) as Partial<BannerDesign>) }
  } catch {
    // ignore corrupt drafts
  }
  return { ...DEFAULT_DESIGN }
}

export function saveDesign(design: BannerDesign): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(design))
  } catch {
    // storage may be unavailable; editing still works
  }
}
