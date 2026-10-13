import { Document, ExternalHyperlink, LineRuleType, Packer, Paragraph, TextRun } from 'docx'
import type { CoverLetter, Profile } from '../types'
import type { ContactIconKind, TemplateTheme } from '../lib/templates'
import { CONTACT_ICONS } from '../lib/templates'
import { downloadBlob, slug } from '../lib/helpers'

const normalizeUrl = (url: string): string => (/^https?:\/\//i.test(url) ? url : `https://${url}`)

export async function buildCoverLetterDocx(
  letter: CoverLetter,
  profile: Profile,
  theme: TemplateTheme,
): Promise<Blob> {
  const accent = theme.accent.replace('#', '')
  const linkColor = theme.linkColor.replace('#', '')
  const fs = (halfPoints: number) => Math.round(halfPoints * (theme.baseFontSize / 11))

  const contactChildren: (TextRun | ExternalHyperlink)[] = []
  const addContact = (kind: ContactIconKind, node: TextRun | ExternalHyperlink | string) => {
    if (contactChildren.length > 0) {
      contactChildren.push(new TextRun({ text: '  |  ', size: fs(18), color: '475569' }))
    }
    if (theme.contactIcons) {
      contactChildren.push(new TextRun({ text: `${CONTACT_ICONS[kind]} `, size: fs(18), color: accent }))
    }
    contactChildren.push(
      typeof node === 'string' ? new TextRun({ text: node, size: fs(18), color: '475569' }) : node,
    )
  }
  if (profile.location.trim()) addContact('location', profile.location.trim())
  if (profile.phone.trim()) addContact('phone', profile.phone.trim())
  if (profile.email.trim()) {
    const email = profile.email.trim()
    addContact(
      'email',
      new ExternalHyperlink({
        link: `mailto:${email}`,
        children: [new TextRun({ text: email, color: linkColor, underline: {}, size: fs(18) })],
      }),
    )
  }
  if (profile.website.trim()) {
    const site = profile.website.trim()
    addContact(
      'website',
      new ExternalHyperlink({
        link: normalizeUrl(site),
        children: [new TextRun({ text: site, color: linkColor, underline: {}, size: fs(18) })],
      }),
    )
  }

  const paragraphs = letter.body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  const children: Paragraph[] = [
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: profile.fullName || 'Your Name',
          bold: true,
          size: fs(Math.round(44 * theme.nameScale)),
          characterSpacing: Math.round(theme.nameTracking * (fs(Math.round(44 * theme.nameScale)) / 2) * 20),
          color: theme.nameColor.replace('#', ''),
        }),
      ],
    }),
  ]

  if (profile.headline.trim()) {
    children.push(
      new Paragraph({
        spacing: { after: 40 },
        children: [new TextRun({ text: profile.headline, size: fs(24), color: '475569' })],
      }),
    )
  }
  if (contactChildren.length > 0) {
    children.push(new Paragraph({ spacing: { after: 200 }, children: contactChildren }))
  }

  if (letter.date) children.push(new Paragraph({ text: letter.date, spacing: { after: 120 } }))
  if (letter.recipient) children.push(new Paragraph({ text: letter.recipient }))
  if (letter.company)
    children.push(new Paragraph({ text: letter.company, spacing: { after: 120 } }))
  if (letter.greeting)
    children.push(new Paragraph({ text: letter.greeting, spacing: { after: 120 } }))

  for (const paragraph of paragraphs) {
    children.push(new Paragraph({ text: paragraph, spacing: { after: 120 } }))
  }

  if (letter.closing)
    children.push(new Paragraph({ text: letter.closing, spacing: { before: 120 } }))
  if (letter.signature)
    children.push(
      new Paragraph({
        spacing: { before: 240 },
        children: [new TextRun({ text: letter.signature, bold: true })],
      }),
    )

  const doc = new Document({
    creator: profile.fullName || 'CV Builder',
    title: `${profile.fullName || 'Cover Letter'} — Cover Letter`,
    styles: {
      default: {
        document: {
          run: { font: theme.docxFont, size: fs(22), color: theme.bodyColor.replace('#', '') },
          paragraph: {
            spacing: { line: Math.round(theme.lineHeight * 240), lineRule: LineRuleType.AUTO },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: theme.pageMarginY * 15,
              bottom: theme.pageMarginY * 15,
              left: theme.pageMarginX * 15,
              right: theme.pageMarginX * 15,
            },
          },
        },
        children,
      },
    ],
  })

  return Packer.toBlob(doc)
}

export async function exportCoverLetterDocx(
  letter: CoverLetter,
  profile: Profile,
  theme: TemplateTheme,
): Promise<void> {
  const blob = await buildCoverLetterDocx(letter, profile, theme)
  downloadBlob(blob, `${slug(profile.fullName)}_Cover_Letter.docx`)
}
