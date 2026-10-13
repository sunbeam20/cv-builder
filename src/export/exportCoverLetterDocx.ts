import { Document, Packer, Paragraph, TextRun } from 'docx'
import type { CoverLetter, Profile } from '../types'
import type { TemplateTheme } from '../lib/templates'
import { downloadBlob, slug } from '../lib/helpers'

export async function exportCoverLetterDocx(
  letter: CoverLetter,
  profile: Profile,
  theme: TemplateTheme,
): Promise<void> {
  const contactParts = [profile.location, profile.phone, profile.email, profile.website]
    .map((s) => s.trim())
    .filter(Boolean)

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
          size: 44,
          color: theme.nameColor.replace('#', ''),
        }),
      ],
    }),
  ]

  if (profile.headline.trim()) {
    children.push(
      new Paragraph({
        spacing: { after: 40 },
        children: [new TextRun({ text: profile.headline, size: 24, color: '475569' })],
      }),
    )
  }
  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: contactParts.join('  |  '), size: 18, color: '475569' })],
      }),
    )
  }

  if (letter.date) children.push(new Paragraph({ text: letter.date, spacing: { after: 120 } }))
  if (letter.recipient) children.push(new Paragraph({ text: letter.recipient }))
  if (letter.company)
    children.push(new Paragraph({ text: letter.company, spacing: { after: 120 } }))
  if (letter.greeting) children.push(new Paragraph({ text: letter.greeting, spacing: { after: 120 } }))

  for (const paragraph of paragraphs) {
    children.push(new Paragraph({ text: paragraph, spacing: { after: 120 } }))
  }

  if (letter.closing) children.push(new Paragraph({ text: letter.closing, spacing: { before: 120 } }))
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
    styles: { default: { document: { run: { font: theme.docxFont } } } },
    sections: [
      {
        properties: {
          page: { margin: { top: 1000, bottom: 1000, left: 1000, right: 1000 } },
        },
        children,
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  downloadBlob(blob, `${slug(profile.fullName)}_Cover_Letter.docx`)
}
