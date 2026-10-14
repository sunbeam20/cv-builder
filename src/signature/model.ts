export interface Social {
  id: string
  label: string
  url: string
}

export type SignatureLayout = 'classic' | 'compact' | 'banner'

export interface SignatureInput {
  name: string
  role: string
  company: string
  email: string
  phone: string
  website: string
  location: string
  accent: string
  photo: string
  layout: SignatureLayout
  socials: Social[]
}

export const LAYOUTS: { id: SignatureLayout; label: string }[] = [
  { id: 'classic', label: 'Classic' },
  { id: 'compact', label: 'Compact' },
  { id: 'banner', label: 'Banner' },
]

export const uid = (): string => Math.random().toString(36).slice(2, 11)

export const SOCIAL_PRESETS = ['LinkedIn', 'GitHub', 'Twitter', 'Dribbble', 'YouTube']

export const emptySignature = (): SignatureInput => ({
  name: 'Jane Doe',
  role: 'Product Designer',
  company: 'Northwind',
  email: 'jane@northwind.com',
  phone: '+1 555 0100',
  website: 'https://northwind.com',
  location: 'Berlin, Germany',
  accent: '#4f46e5',
  photo: '',
  layout: 'classic',
  socials: [{ id: uid(), label: 'LinkedIn', url: 'https://linkedin.com/in/janedoe' }],
})

const escape = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const photoTag = (photo: string, size: number): string =>
  photo.startsWith('data:image/')
    ? `<img src="${photo}" alt="" width="${size}" height="${size}" style="border-radius:50%;object-fit:cover;display:block;" />`
    : ''

const contactLinks = (input: SignatureInput, color: string): string[] => {
  const links: string[] = []
  if (input.email.trim()) links.push(`<a href="mailto:${escape(input.email)}" style="color:${color};text-decoration:none;">${escape(input.email)}</a>`)
  if (input.phone.trim()) links.push(`<a href="tel:${escape(input.phone.replace(/\s+/g, ''))}" style="color:${color};text-decoration:none;">${escape(input.phone)}</a>`)
  if (input.website.trim()) links.push(`<a href="${escape(input.website)}" style="color:${color};text-decoration:none;">${escape(input.website.replace(/^https?:\/\//, ''))}</a>`)
  if (input.location.trim()) links.push(`<span style="color:#64748b;">${escape(input.location)}</span>`)
  return links
}

const socialLinks = (input: SignatureInput, color: string): string =>
  input.socials
    .filter((social) => social.url.trim() && social.label.trim())
    .map(
      (social) =>
        `<a href="${escape(social.url)}" style="color:${color};text-decoration:none;font-size:12px;">${escape(social.label)}</a>`,
    )
    .join(' &nbsp;·&nbsp; ')

export function signatureHtml(input: SignatureInput): string {
  const roleLine = [escape(input.role), escape(input.company)].filter(Boolean).join(' · ')

  if (input.layout === 'compact') {
    const contact = contactLinks(input, input.accent).join(' &nbsp;·&nbsp; ')
    const socials = socialLinks(input, input.accent)
    const photo = photoTag(input.photo, 40)
    const cells = [
      photo ? `<td style="padding-right:10px;vertical-align:middle;">${photo}</td>` : '',
      `<td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#475569;">`,
      input.name.trim() ? `<strong style="color:#0f172a;font-size:13px;">${escape(input.name)}</strong>` : '',
      roleLine ? ` <span style="color:#64748b;">${roleLine}</span>` : '',
      contact ? `<div style="margin-top:2px;">${contact}</div>` : '',
      socials ? `<div style="margin-top:2px;">${socials}</div>` : '',
      `</td>`,
    ]
    return `<table cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;"><tr>${cells.join('')}</tr></table>`
  }

  if (input.layout === 'banner') {
    const contact = contactLinks(input, '#ffffff').join(' &nbsp;·&nbsp; ')
    const socials = socialLinks(input, '#ffffff')
    const photo = photoTag(input.photo, 56)
    const inner = [
      photo ? `<td style="padding-right:14px;vertical-align:middle;">${photo}</td>` : '',
      `<td style="vertical-align:middle;">`,
      input.name.trim() ? `<div style="font-size:16px;font-weight:700;color:#ffffff;">${escape(input.name)}</div>` : '',
      roleLine ? `<div style="color:#ffffff;opacity:0.85;">${roleLine}</div>` : '',
      contact ? `<div style="margin-top:6px;">${contact}</div>` : '',
      socials ? `<div style="margin-top:4px;">${socials}</div>` : '',
      `</td>`,
    ]
    return `<table cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;"><tr><td style="background:${input.accent};border-radius:10px;padding:14px 18px;"><table cellpadding="0" cellspacing="0"><tr>${inner.join('')}</tr></table></td></tr></table>`
  }

  const contact = contactLinks(input, input.accent).join(' &nbsp;·&nbsp; ')
  const socials = socialLinks(input, input.accent)
  const photo = photoTag(input.photo, 64)
  const cells = [
    photo ? `<td style="padding-right:14px;vertical-align:top;">${photo}</td>` : '',
    `<td style="padding-left:14px;border-left:3px solid ${input.accent};">`,
    input.name.trim() ? `<div style="font-size:16px;font-weight:700;color:#0f172a;">${escape(input.name)}</div>` : '',
    roleLine ? `<div style="color:#64748b;">${roleLine}</div>` : '',
    contact ? `<div style="margin-top:6px;">${contact}</div>` : '',
    socials ? `<div style="margin-top:4px;">${socials}</div>` : '',
    `</td>`,
  ]
  return `<table cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#334155;"><tr>${cells.join('')}</tr></table>`
}

export function signatureText(input: SignatureInput): string {
  const lines = [
    input.name,
    [input.role, input.company].filter(Boolean).join(' · '),
    [input.email, input.phone].filter(Boolean).join(' · '),
    input.website,
    input.location,
    input.socials
      .filter((social) => social.url.trim())
      .map((social) => `${social.label}: ${social.url}`)
      .join('\n'),
  ]
  return lines.filter((line) => line.trim()).join('\n')
}

export function signatureVCard(input: SignatureInput): string {
  const esc = (value: string): string =>
    value.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')

  const nameParts = input.name.trim().split(/\s+/).filter(Boolean)
  const last = nameParts.length > 1 ? nameParts[nameParts.length - 1]! : ''
  const first = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : input.name.trim()

  const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0']
  lines.push(`N:${esc(last)};${esc(first)};;;`)
  lines.push(`FN:${esc(input.name.trim())}`)
  if (input.company.trim()) lines.push(`ORG:${esc(input.company)}`)
  if (input.role.trim()) lines.push(`TITLE:${esc(input.role)}`)
  if (input.email.trim()) lines.push(`EMAIL;TYPE=WORK:${esc(input.email)}`)
  if (input.phone.trim()) lines.push(`TEL;TYPE=WORK:${esc(input.phone)}`)
  if (input.website.trim()) lines.push(`URL:${esc(input.website)}`)
  if (input.location.trim()) lines.push(`ADR;TYPE=WORK:;;${esc(input.location)};;;;`)
  input.socials
    .filter((social) => social.url.trim())
    .forEach((social) => lines.push(`URL:${esc(social.url)}`))
  lines.push('END:VCARD')
  return `${lines.join('\r\n')}\r\n`
}
