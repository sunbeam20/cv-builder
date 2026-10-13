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

export type ApplicationStatus = 'wishlist' | 'applied' | 'interview' | 'offer' | 'rejected'

/** A single status change on an application, used to build its timeline. */
export interface ApplicationEvent {
  id: string
  status: ApplicationStatus
  /** ISO timestamp of the change. */
  at: string
  note?: string
}

export interface Application {
  id: string
  company: string
  role: string
  location: string
  url: string
  status: ApplicationStatus
  /** Date applied (yyyy-mm-dd). */
  date: string
  notes: string
  /** Freeform salary / compensation text. */
  salary: string
  /** Where the lead came from, e.g. "LinkedIn", "Referral". */
  source: string
  /** 0–3 star priority. */
  priority: number
  contactName: string
  contactEmail: string
  /** Reminder date to chase the application (yyyy-mm-dd). */
  followUpDate: string
  tags: string[]
  /** Job description / posting text. */
  description: string
  /** Which CV/version was sent, e.g. "Frontend v2". */
  resumeVersion: string
  /** ISO timestamp the record was created. */
  createdAt: string
  /** ISO timestamp of the last edit. */
  updatedAt: string
  /** Status-change timeline, oldest first. */
  history: ApplicationEvent[]
  archived: boolean
}
