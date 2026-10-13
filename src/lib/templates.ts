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
