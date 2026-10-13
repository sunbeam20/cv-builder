export interface Social {
  id: string
  label: string
  url: string
}

export interface SignatureInput {
  name: string
  role: string
  company: string
  email: string
  phone: string
  website: string
  location: string
  accent: string
  socials: Social[]
}

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
  socials: [{ id: uid(), label: 'LinkedIn', url: 'https://linkedin.com/in/janedoe' }],
})

const escape = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function signatureHtml(input: SignatureInput): string {
  const contact: string[] = []
  if (input.email.trim()) contact.push(`<a href="mailto:${escape(input.email)}" style="color:${input.accent};text-decoration:none;">${escape(input.email)}</a>`)
  if (input.phone.trim()) contact.push(`<a href="tel:${escape(input.phone.replace(/\s+/g, ''))}" style="color:${input.accent};text-decoration:none;">${escape(input.phone)}</a>`)
  if (input.website.trim()) contact.push(`<a href="${escape(input.website)}" style="color:${input.accent};text-decoration:none;">${escape(input.website.replace(/^https?:\/\//, ''))}</a>`)
  if (input.location.trim()) contact.push(`<span style="color:#64748b;">${escape(input.location)}</span>`)

  const socials = input.socials
    .filter((social) => social.url.trim() && social.label.trim())
    .map(
      (social) =>
        `<a href="${escape(social.url)}" style="color:${input.accent};text-decoration:none;font-size:12px;">${escape(social.label)}</a>`,
    )
    .join(' &nbsp;·&nbsp; ')

  const lines = [
    `<table cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#334155;">`,
    `<tr><td style="padding-left:14px;border-left:3px solid ${input.accent};">`,
    input.name.trim() ? `<div style="font-size:16px;font-weight:700;color:#0f172a;">${escape(input.name)}</div>` : '',
    input.role.trim() || input.company.trim()
      ? `<div style="color:#64748b;">${[escape(input.role), escape(input.company)].filter(Boolean).join(' · ')}</div>`
      : '',
    contact.length ? `<div style="margin-top:6px;">${contact.join(' &nbsp;·&nbsp; ')}</div>` : '',
    socials ? `<div style="margin-top:4px;">${socials}</div>` : '',
    `</td></tr></table>`,
  ]
  return lines.filter(Boolean).join('')
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
