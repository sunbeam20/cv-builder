export interface Link {
  id: string
  label: string
  url: string
}

export interface Profile {
  fullName: string
  headline: string
  email: string
  phone: string
  location: string
  website: string
  summary: string
  links: Link[]
}

export interface Experience {
  id: string
  company: string
  role: string
  location: string
  start: string
  end: string
  current: boolean
  bullets: string[]
}

export interface Education {
  id: string
  school: string
  degree: string
  field: string
  location: string
  start: string
  end: string
  details: string
}

export interface SkillGroup {
  id: string
  category: string
  items: string[]
}

export interface Project {
  id: string
  name: string
  link: string
  description: string
  bullets: string[]
}

export interface Certification {
  id: string
  name: string
  issuer: string
  date: string
  link: string
}

export interface Language {
  id: string
  name: string
  proficiency: string
}

export type SectionId =
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'languages'

export interface Resume {
  profile: Profile
  sectionOrder: SectionId[]
  hiddenSections: SectionId[]
  experience: Experience[]
  education: Education[]
  skills: SkillGroup[]
  projects: Project[]
  certifications: Certification[]
  languages: Language[]
}

export interface CoverLetter {
  company: string
  role: string
  recipient: string
  date: string
  greeting: string
  body: string
  closing: string
  signature: string
}

export type DocType = 'resume' | 'cover'
