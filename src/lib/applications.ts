import type { Application, ApplicationEvent, ApplicationStatus } from '../types'
import { uid } from './helpers'

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'wishlist',
  'applied',
  'interview',
  'offer',
  'rejected',
]

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  wishlist: 'Wishlist',
  applied: 'Applied',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
}

/** Short labels for compact chips and board column headers. */
export const STATUS_SHORT: Record<ApplicationStatus, string> = {
  wishlist: 'Wishlist',
  applied: 'Applied',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
}

export const emptyApplicationEvent = (
  status: ApplicationStatus,
  at: string = new Date().toISOString(),
): ApplicationEvent => ({ id: uid(), status, at })

export const emptyApplication = (): Application => {
  const now = new Date().toISOString()
  return {
    id: uid(),
    company: '',
    role: '',
    location: '',
    url: '',
    status: 'wishlist',
    date: '',
    notes: '',
    salary: '',
    source: '',
    priority: 0,
    contactName: '',
    contactEmail: '',
    followUpDate: '',
    tags: [],
    description: '',
    resumeVersion: '',
    createdAt: now,
    updatedAt: now,
    history: [{ id: uid(), status: 'wishlist', at: now }],
    archived: false,
  }
}

const escapeCsv = (value: string): string =>
  /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value

const CSV_HEADER = [
  'Company',
  'Role',
  'Status',
  'Priority',
  'Location',
  'Salary',
  'Source',
  'URL',
  'Applied',
  'Follow-up',
  'Contact',
  'Email',
  'Tags',
  'Resume',
  'Updated',
  'Archived',
  'Notes',
] as const

/** Lowercased column order assumed when a CSV has no header row. */
const CANONICAL_HEADER = CSV_HEADER.map((name) => name.toLowerCase())

export function applicationsToCsv(apps: Application[]): string {
  const rows = apps.map((a) => [
    a.company,
    a.role,
    STATUS_LABELS[a.status],
    String(a.priority),
    a.location,
    a.salary,
    a.source,
    a.url,
    a.date,
    a.followUpDate,
    a.contactName,
    a.contactEmail,
    a.tags.join('; '),
    a.resumeVersion,
    a.updatedAt,
    a.archived ? 'yes' : 'no',
    a.notes,
  ])
  return [CSV_HEADER, ...rows].map((row) => row.map((cell) => escapeCsv(String(cell))).join(',')).join('\n')
}

/** Parse a single CSV line into cells, honouring quotes and escaped quotes. */
function parseCsvLine(line: string): string[] {
  const cells: string[] = []
  let current = ''
  let quoted = false
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    if (quoted) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"'
          i += 1
        } else {
          quoted = false
        }
      } else {
        current += char
      }
    } else if (char === '"') {
      quoted = true
    } else if (char === ',') {
      cells.push(current)
      current = ''
    } else {
      current += char
    }
  }
  cells.push(current)
  return cells
}

const STATUS_BY_LABEL: Record<string, ApplicationStatus> = Object.fromEntries(
  (Object.entries(STATUS_LABELS) as Array<[ApplicationStatus, string]>).map(([key, label]) => [
    label.toLowerCase(),
    key,
  ]),
)

const parseStatus = (value: string): ApplicationStatus => {
  const normalised = value.trim().toLowerCase()
  if (APPLICATION_STATUSES.includes(normalised as ApplicationStatus)) {
    return normalised as ApplicationStatus
  }
  return STATUS_BY_LABEL[normalised] ?? 'wishlist'
}

/**
 * Best-effort CSV import. Accepts files produced by `applicationsToCsv` (with a
 * header row) as well as minimal `Company,Role` files without one.
 */
export function csvToApplications(csv: string): Application[] {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim() !== '')
  if (lines.length === 0) return []

  const first = parseCsvLine(lines[0]).map((cell) => cell.trim().toLowerCase())
  const hasHeader = first.includes('company') || first.includes('role')
  const header = hasHeader ? first : [...CANONICAL_HEADER]
  const body = hasHeader ? lines.slice(1) : lines

  const index = (name: string): number => header.indexOf(name)
  const cell = (cells: string[], name: string, fallback = ''): string => {
    const i = index(name)
    return i === -1 ? fallback : (cells[i] ?? '').trim()
  }

  return body.map((line) => {
    const cells = parseCsvLine(line)
    const base = emptyApplication()
    const status = cell(cells, 'status')
    const tags = cell(cells, 'tags')
    return {
      ...base,
      company: cell(cells, 'company'),
      role: cell(cells, 'role'),
      location: cell(cells, 'location'),
      url: cell(cells, 'url'),
      salary: cell(cells, 'salary'),
      source: cell(cells, 'source'),
      date: cell(cells, 'applied') || cell(cells, 'date'),
      followUpDate: cell(cells, 'follow-up') || cell(cells, 'followup'),
      contactName: cell(cells, 'contact'),
      contactEmail: cell(cells, 'email'),
      resumeVersion: cell(cells, 'resume'),
      notes: cell(cells, 'notes'),
      priority: Number.parseInt(cell(cells, 'priority', '0'), 10) || 0,
      archived: ['yes', 'true', '1'].includes(cell(cells, 'archived').toLowerCase()),
      tags: tags ? tags.split(/[;,]/).map((t) => t.trim()).filter(Boolean) : [],
      status: parseStatus(status),
    }
  })
}
