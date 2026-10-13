import {
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TabStopType,
  TextRun,
} from 'docx'
import type { Resume } from '../types'
import type { TemplateTheme } from '../lib/templates'
import { downloadBlob, formatRange, slug } from '../lib/helpers'

const CONTENT_WIDTH = 9026

const heading = (text: string, accent: string) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 220, after: 80 },
    border: { bottom: { color: accent, size: 6, style: BorderStyle.SINGLE, space: 2 } },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: 22,
        characterSpacing: 30,
        color: accent,
      }),
    ],
  })

const line = (children: TextRun[], after = 60) =>
  new Paragraph({ spacing: { after }, children })

const row = (left: string, right: string) =>
  new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_WIDTH }],
    spacing: { after: 20 },
    children: [
      new TextRun({ text: left, bold: true }),
      new TextRun({ text: `\t${right}` }),
    ],
  })

const bullets = (items: string[]) =>
  items
    .map((b) => b.trim())
    .filter(Boolean)
    .map(
      (text) =>
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 20 },
          children: [new TextRun({ text })],
        }),
    )

export async function exportDocx(resume: Resume, theme: TemplateTheme): Promise<void> {
  const { profile, experience, education, skills, projects, certifications, languages } = resume

  const accent = theme.accent.replace('#', '')
  const nameColor = theme.nameColor.replace('#', '')

  const contactParts = [
    profile.location,
    profile.phone,
    profile.email,
    profile.website,
    ...profile.links.map((l) => l.url || l.label),
  ]
    .map((s) => s.trim())
    .filter(Boolean)

  const children: Paragraph[] = []

  children.push(
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: profile.fullName || 'Your Name',
          bold: true,
          size: 44,
          color: nameColor,
        }),
      ],
    }),
  )

  if (profile.headline.trim()) {
    children.push(line([new TextRun({ text: profile.headline, size: 24, color: '475569' })], 40))
  }
  if (contactParts.length > 0) {
    children.push(
      line([new TextRun({ text: contactParts.join('  |  '), size: 18, color: '475569' })]),
    )
  }

  if (profile.summary.trim()) {
    children.push(heading('Professional Summary', accent))
    children.push(line([new TextRun({ text: profile.summary })]))
  }

  if (experience.length > 0) {
    children.push(heading('Experience', accent))
    for (const exp of experience) {
      children.push(row(exp.role || 'Role', formatRange(exp.start, exp.end, exp.current)))
      const sub = [exp.company, exp.location].map((s) => s.trim()).filter(Boolean).join(', ')
      if (sub) children.push(line([new TextRun({ text: sub, italics: true })], 40))
      children.push(...bullets(exp.bullets))
    }
  }

  if (education.length > 0) {
    children.push(heading('Education', accent))
    for (const edu of education) {
      children.push(row(edu.school || 'School', formatRange(edu.start, edu.end, false)))
      const sub =
        [edu.degree, edu.field].map((s) => s.trim()).filter(Boolean).join(', ') +
        (edu.location ? ` — ${edu.location}` : '')
      if (sub) children.push(line([new TextRun({ text: sub, italics: true })], 40))
      if (edu.details.trim()) children.push(line([new TextRun({ text: edu.details })]))
    }
  }

  if (skills.length > 0) {
    children.push(heading('Skills', accent))
    for (const group of skills) {
      children.push(
        line([
          ...(group.category ? [new TextRun({ text: `${group.category}: `, bold: true })] : []),
          new TextRun({ text: group.items.join(', ') }),
        ]),
      )
    }
  }

  if (projects.length > 0) {
    children.push(heading('Projects', accent))
    for (const project of projects) {
      const title = project.link.trim() ? `${project.name}  (${project.link})` : project.name
      children.push(line([new TextRun({ text: title, bold: true })], 40))
      if (project.description.trim())
        children.push(line([new TextRun({ text: project.description })], 40))
      children.push(...bullets(project.bullets))
    }
  }

  if (certifications.length > 0) {
    children.push(heading('Certifications', accent))
    for (const cert of certifications) {
      const text = `${cert.name}${cert.issuer ? ` — ${cert.issuer}` : ''}${
        cert.date ? ` (${cert.date})` : ''
      }`
      children.push(line([new TextRun({ text })]))
    }
  }

  if (languages.length > 0) {
    children.push(heading('Languages', accent))
    const text = languages
      .map((l) => [l.name, l.proficiency].filter(Boolean).join(' '))
      .filter(Boolean)
      .join('  •  ')
    children.push(line([new TextRun({ text })], 0))
  }

  const doc = new Document({
    creator: profile.fullName || 'CV Builder',
    title: `${profile.fullName || 'Resume'} — CV`,
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
  downloadBlob(blob, `${slug(profile.fullName)}_CV.docx`)
}
