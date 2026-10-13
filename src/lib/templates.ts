export type TemplateId = 'ats' | 'modern'

export interface TemplateTheme {
  id: TemplateId
  name: string
  accent: string
  nameColor: string
  accentBar: boolean
}

export const TEMPLATES: Record<TemplateId, TemplateTheme> = {
  ats: {
    id: 'ats',
    name: 'ATS Classic',
    accent: '#0f172a',
    nameColor: '#0f172a',
    accentBar: false,
  },
  modern: {
    id: 'modern',
    name: 'Modern Accent',
    accent: '#4f46e5',
    nameColor: '#4f46e5',
    accentBar: true,
  },
}

export const TEMPLATE_LIST: TemplateTheme[] = [TEMPLATES.ats, TEMPLATES.modern]

export const isTemplateId = (value: string): value is TemplateId => value in TEMPLATES
