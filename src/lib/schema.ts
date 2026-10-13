import { z } from 'zod'
import { DEFAULT_SECTION_ORDER } from './helpers'

const id = z.string()

export const sectionIdSchema = z.enum([
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'languages',
])

export const linkSchema = z.object({
  id,
  label: z.string(),
  url: z.string(),
})

export const profileSchema = z.object({
  fullName: z.string(),
  headline: z.string(),
  email: z.string(),
  phone: z.string(),
  location: z.string(),
  website: z.string(),
  summary: z.string(),
  links: z.array(linkSchema),
})

export const experienceSchema = z.object({
  id,
  company: z.string(),
  role: z.string(),
  location: z.string(),
  start: z.string(),
  end: z.string(),
  current: z.boolean(),
  bullets: z.array(z.string()),
})

export const educationSchema = z.object({
  id,
  school: z.string(),
  degree: z.string(),
  field: z.string(),
  location: z.string(),
  start: z.string(),
  end: z.string(),
  details: z.string(),
})

export const skillGroupSchema = z.object({
  id,
  category: z.string(),
  items: z.array(z.string()),
})

export const projectSchema = z.object({
  id,
  name: z.string(),
  link: z.string(),
  description: z.string(),
  bullets: z.array(z.string()),
})

export const certificationSchema = z.object({
  id,
  name: z.string(),
  issuer: z.string(),
  date: z.string(),
  link: z.string(),
})

export const languageSchema = z.object({
  id,
  name: z.string(),
  proficiency: z.string(),
})

export const coverLetterSchema = z.object({
  company: z.string(),
  role: z.string(),
  recipient: z.string(),
  date: z.string(),
  greeting: z.string(),
  body: z.string(),
  closing: z.string(),
  signature: z.string(),
})

export const resumeSchema = z.object({
  profile: profileSchema,
  sectionOrder: z.array(sectionIdSchema).optional().default(() => [...DEFAULT_SECTION_ORDER]),
  hiddenSections: z.array(sectionIdSchema).optional().default(() => []),
  experience: z.array(experienceSchema),
  education: z.array(educationSchema),
  skills: z.array(skillGroupSchema),
  projects: z.array(projectSchema),
  certifications: z.array(certificationSchema),
  languages: z.array(languageSchema),
})

export const applicationStatusSchema = z.enum([
  'wishlist',
  'applied',
  'interview',
  'offer',
  'rejected',
])

export const applicationSchema = z.object({
  id,
  company: z.string(),
  role: z.string(),
  location: z.string(),
  url: z.string(),
  status: applicationStatusSchema,
  date: z.string(),
  notes: z.string(),
})

export const customizationSchema = z.object({
  fontId: z.string().optional(),
  baseFontSize: z.number().optional(),
  pageMarginY: z.number().optional(),
  pageMarginX: z.number().optional(),
  lineHeight: z.number().optional(),
  headingTracking: z.number().optional(),
  nameScale: z.number().optional(),
  headingScale: z.number().optional(),
  sectionSpacing: z.number().optional(),
  bulletStyle: z.enum(['disc', 'circle', 'square', 'dash', 'none']).optional(),
  headingCase: z.enum(['uppercase', 'capitalize', 'none']).optional(),
  headingWeight: z.number().optional(),
  ruleColor: z.string().optional(),
  ruleThickness: z.number().optional(),
  nameTracking: z.number().optional(),
  headerLayout: z.enum(['stacked', 'split']).optional(),
  bodyColor: z.string().optional(),
  contactIcons: z.boolean().optional(),
  sectionHeadings: z.record(sectionIdSchema, z.enum(['rule', 'bar', 'plain'])).optional(),
  accent: z.string().optional(),
  nameColor: z.string().optional(),
  linkColor: z.string().optional(),
  accentBar: z.boolean().optional(),
  headingRule: z.boolean().optional(),
})

export const bundleSchema = z.object({
  resume: resumeSchema,
  coverLetter: coverLetterSchema.optional(),
  applications: z.array(applicationSchema).optional(),
  template: z.string().optional(),
  customization: customizationSchema.optional(),
})

export type ResumeInput = z.infer<typeof resumeSchema>
export type BundleInput = z.infer<typeof bundleSchema>
