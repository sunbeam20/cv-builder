import {
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TabStopType,
  TextRun,
} from 'docx'
import type { Resume, SectionId } from '../types'
import type { TemplateTheme } from '../lib/templates'
import { SECTION_LABELS, downloadBlob, formatRange, slug } from '../lib/helpers'

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
    children: [new TextRun({ text: left, bold: true }), new TextRun({ text: `\t${right}` })],
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
  const {
    profile,
    sectionOrder,
    experience,
    education,
    skills,
    projects,
    certifications,
    languages,
  } = resume

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

  const header: Paragraph[] = [
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
  ]

  if (profile.headline.trim()) {
    header.push(line([new TextRun({ text: profile.headline, size: 24, color: '475569' })], 40))
  }
  if (contactParts.length > 0) {
    header.push(
      line([new TextRun({ text: contactParts.join('  |  '), size: 18, color: '475569' })]),
    )
  }

  const blocks: Record<SectionId, Paragraph[]> = {
    summary: profile.summary.trim()
      ? [heading(SECTION_LABELS.summary, accent), line([new TextRun({ text: profile.summary })])]
      : [],

    experience:
      experience.length > 0
        ? [
            heading(SECTION_LABELS.experience, accent),
            ...experience.flatMap((exp) => {
              const sub = [exp.company, exp.location]
                .map((s) => s.trim())
                .filter(Boolean)
                .join(', ')
              return [
                row(exp.role || 'Role', formatRange(exp.start, exp.end, exp.current)),
                ...(sub ? [line([new TextRun({ text: sub, italics: true })], 40)] : []),
                ...bullets(exp.bullets),
              ]
            }),
          ]
        : [],

    education:
      education.length > 0
        ? [
            heading(SECTION_LABELS.education, accent),
            ...education.flatMap((edu) => {
              const sub =
                [edu.degree, edu.field]
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .join(', ') + (edu.location ? ` — ${edu.location}` : '')
              return [
                row(edu.school || 'School', formatRange(edu.start, edu.end, false)),
                ...(sub ? [line([new TextRun({ text: sub, italics: true })], 40)] : []),
                ...(edu.details.trim() ? [line([new TextRun({ text: edu.details })])] : []),
              ]
            }),
          ]
        : [],

    skills:
      skills.length > 0
        ? [
            heading(SECTION_LABELS.skills, accent),
            ...skills.map((group) =>
              line([
                ...(group.category
                  ? [new TextRun({ text: `${group.category}: `, bold: true })]
                  : []),
                new TextRun({ text: group.items.join(', ') }),
              ]),
            ),
          ]
        : [],

    projects:
      projects.length > 0
        ? [
            heading(SECTION_LABELS.projects, accent),
            ...projects.flatMap((project) => {
              const title = project.link.trim()
                ? `${project.name}  (${project.link})`
                : project.name
              return [
                line([new TextRun({ text: title, bold: true })], 40),
                ...(project.description.trim()
                  ? [line([new TextRun({ text: project.description })], 40)]
                  : []),
                ...bullets(project.bullets),
              ]
            }),
          ]
        : [],

    certifications:
      certifications.length > 0
        ? [
            heading(SECTION_LABELS.certifications, accent),
            ...certifications.map((cert) =>
              line([
                new TextRun({
                  text: `${cert.name}${cert.issuer ? ` — ${cert.issuer}` : ''}${
                    cert.date ? ` (${cert.date})` : ''
                  }`,
                }),
              ]),
            ),
          ]
        : [],

    languages:
      languages.length > 0
        ? [
            heading(SECTION_LABELS.languages, accent),
            line(
              [
                new TextRun({
                  text: languages
                    .map((l) => [l.name, l.proficiency].filter(Boolean).join(' '))
                    .filter(Boolean)
                    .join('  •  '),
                }),
              ],
              0,
            ),
          ]
        : [],
  }

  const children: Paragraph[] = [
    ...header,
    ...sectionOrder.flatMap((id) => blocks[id] ?? []),
  ]

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
