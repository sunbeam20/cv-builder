import type { Application, ApplicationStatus } from '../types'
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

export const emptyApplication = (): Application => ({
  id: uid(),
  company: '',
  role: '',
  location: '',
  url: '',
  status: 'wishlist',
  date: '',
  notes: '',
})

const escapeCsv = (value: string): string =>
  /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value

export function applicationsToCsv(apps: Application[]): string {
  const header = ['Company', 'Role', 'Status', 'Location', 'URL', 'Date', 'Notes']
  const rows = apps.map((a) => [
    a.company,
    a.role,
    STATUS_LABELS[a.status],
    a.location,
    a.url,
    a.date,
    a.notes,
  ])
  return [header, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n')
}
