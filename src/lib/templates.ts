export type TemplateId = 'ats' | 'modern' | 'elegant' | 'teal' | 'mono' | 'burgundy'

export interface TemplateTheme {
  id: TemplateId
  name: string
  /** CSS font stack for the on-screen preview */
  fontFamily: string
  /** react-pdf standard font families (regular/bold/italic/boldItalic) */
  pdfFonts: {
    regular: string
    bold: string
    italic: string
    boldItalic: string
  }
  /** DOCX font name */
  docxFont: string
  accent: string
  nameColor: string
  /** Colour used for clickable links */
  linkColor: string
  /** Base body font size in px (all other sizes are em-relative) */
  baseFontSize: number
  accentBar: boolean
  /** Draw a rule under section headings */
  headingRule: boolean
}

export const TEMPLATES: Record<TemplateId, TemplateTheme> = {
  ats: {
    id: 'ats',
    name: 'ATS Classic',
    fontFamily: 'Helvetica, Arial, sans-serif',
    pdfFonts: {
      regular: 'Helvetica',
      bold: 'Helvetica-Bold',
      italic: 'Helvetica-Oblique',
      boldItalic: 'Helvetica-BoldOblique',
    },
    docxFont: 'Calibri',
    accent: '#0f172a',
    nameColor: '#0f172a',
    linkColor: '#2563eb',
    baseFontSize: 11,
    accentBar: false,
    headingRule: true,
  },
  modern: {
    id: 'modern',
    name: 'Modern Accent',
    fontFamily: 'Helvetica, Arial, sans-serif',
    pdfFonts: {
      regular: 'Helvetica',
      bold: 'Helvetica-Bold',
      italic: 'Helvetica-Oblique',
      boldItalic: 'Helvetica-BoldOblique',
    },
    docxFont: 'Calibri',
    accent: '#4f46e5',
    nameColor: '#4f46e5',
    linkColor: '#2563eb',
    baseFontSize: 11,
    accentBar: true,
    headingRule: true,
  },
  elegant: {
    id: 'elegant',
    name: 'Elegant Serif',
    fontFamily: 'Georgia, "Times New Roman", Times, serif',
    pdfFonts: {
      regular: 'Times-Roman',
      bold: 'Times-Bold',
      italic: 'Times-Italic',
      boldItalic: 'Times-BoldItalic',
    },
    docxFont: 'Georgia',
    accent: '#334155',
    nameColor: '#1e293b',
    linkColor: '#2563eb',
    baseFontSize: 11,
    accentBar: false,
    headingRule: false,
  },
  teal: {
    id: 'teal',
    name: 'Teal Accent',
    fontFamily: 'Helvetica, Arial, sans-serif',
    pdfFonts: {
      regular: 'Helvetica',
      bold: 'Helvetica-Bold',
      italic: 'Helvetica-Oblique',
      boldItalic: 'Helvetica-BoldOblique',
    },
    docxFont: 'Calibri',
    accent: '#0d9488',
    nameColor: '#0f766e',
    linkColor: '#0d9488',
    baseFontSize: 11,
    accentBar: true,
    headingRule: true,
  },
  mono: {
    id: 'mono',
    name: 'Technical Mono',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    pdfFonts: {
      regular: 'Courier',
      bold: 'Courier-Bold',
      italic: 'Courier-Oblique',
      boldItalic: 'Courier-BoldOblique',
    },
    docxFont: 'Consolas',
    accent: '#334155',
    nameColor: '#0f172a',
    linkColor: '#0f766e',
    baseFontSize: 11,
    accentBar: false,
    headingRule: true,
  },
  burgundy: {
    id: 'burgundy',
    name: 'Burgundy Serif',
    fontFamily: '"Palatino Linotype", Palatino, Georgia, serif',
    pdfFonts: {
      regular: 'Times-Roman',
      bold: 'Times-Bold',
      italic: 'Times-Italic',
      boldItalic: 'Times-BoldItalic',
    },
    docxFont: 'Palatino Linotype',
    accent: '#9f1239',
    nameColor: '#881337',
    linkColor: '#9f1239',
    baseFontSize: 11,
    accentBar: true,
    headingRule: false,
  },
}

export const TEMPLATE_LIST: TemplateTheme[] = [
  TEMPLATES.ats,
  TEMPLATES.modern,
  TEMPLATES.elegant,
  TEMPLATES.teal,
  TEMPLATES.mono,
  TEMPLATES.burgundy,
]

export const isTemplateId = (value: string): value is TemplateId => value in TEMPLATES

export interface FontOption {
  id: string
  name: string
  /** CSS font stack for the on-screen preview */
  cssFamily: string
  /** react-pdf standard font families */
  pdfFonts: TemplateTheme['pdfFonts']
  /** DOCX font name */
  docxFont: string
}

const HELVETICA = {
  regular: 'Helvetica',
  bold: 'Helvetica-Bold',
  italic: 'Helvetica-Oblique',
  boldItalic: 'Helvetica-BoldOblique',
}
const TIMES = {
  regular: 'Times-Roman',
  bold: 'Times-Bold',
  italic: 'Times-Italic',
  boldItalic: 'Times-BoldItalic',
}
const COURIER = {
  regular: 'Courier',
  bold: 'Courier-Bold',
  italic: 'Courier-Oblique',
  boldItalic: 'Courier-BoldOblique',
}

export const FONT_OPTIONS: FontOption[] = [
  {
    id: 'helvetica',
    name: 'Helvetica',
    cssFamily: 'Helvetica, Arial, sans-serif',
    pdfFonts: HELVETICA,
    docxFont: 'Calibri',
  },
  {
    id: 'arial',
    name: 'Arial',
    cssFamily: 'Arial, Helvetica, sans-serif',
    pdfFonts: HELVETICA,
    docxFont: 'Arial',
  },
  {
    id: 'georgia',
    name: 'Georgia',
    cssFamily: 'Georgia, "Times New Roman", Times, serif',
    pdfFonts: TIMES,
    docxFont: 'Georgia',
  },
  {
    id: 'times',
    name: 'Times New Roman',
    cssFamily: '"Times New Roman", Times, serif',
    pdfFonts: TIMES,
    docxFont: 'Times New Roman',
  },
  {
    id: 'palatino',
    name: 'Palatino',
    cssFamily: '"Palatino Linotype", Palatino, Georgia, serif',
    pdfFonts: TIMES,
    docxFont: 'Palatino Linotype',
  },
  {
    id: 'consolas',
    name: 'Consolas (mono)',
    cssFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    pdfFonts: COURIER,
    docxFont: 'Consolas',
  },
]

export const isFontId = (value: string): value is string => FONT_OPTIONS.some((f) => f.id === value)

/** User overrides layered on top of a template. Empty = use the template as-is. */
export interface Customization {
  fontId?: string
  baseFontSize?: number
  accent?: string
  nameColor?: string
  linkColor?: string
  accentBar?: boolean
  headingRule?: boolean
}

export const FONT_SIZE_MIN = 9
export const FONT_SIZE_MAX = 13

export function resolveTheme(base: TemplateTheme, custom: Customization = {}): TemplateTheme {
  const font = custom.fontId ? FONT_OPTIONS.find((f) => f.id === custom.fontId) : undefined
  return {
    ...base,
    ...(font
      ? { fontFamily: font.cssFamily, pdfFonts: font.pdfFonts, docxFont: font.docxFont }
      : {}),
    accent: custom.accent ?? base.accent,
    nameColor: custom.nameColor ?? base.nameColor,
    linkColor: custom.linkColor ?? base.linkColor,
    baseFontSize: custom.baseFontSize ?? base.baseFontSize,
    accentBar: custom.accentBar ?? base.accentBar,
    headingRule: custom.headingRule ?? base.headingRule,
  }
}

export const hasCustomization = (custom: Customization = {}): boolean =>
  Object.keys(custom).length > 0
