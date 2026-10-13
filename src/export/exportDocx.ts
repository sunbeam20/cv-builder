import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  HeadingLevel,
  LineRuleType,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TabStopType,
  TextRun,
  WidthType,
} from 'docx'
import type { Resume, SectionId } from '../types'
import type { TemplateTheme } from '../lib/templates'
import { SECTION_LABELS, downloadBlob, formatRange, slug } from '../lib/helpers'
import { BULLET_GLYPH } from '../lib/templates'

const CONTENT_WIDTH = 9026

const normalizeUrl = (url: string): string => (/^https?:\/\//i.test(url) ? url : `https://${url}`)

interface HeadingOpts {
  color: string
  borderColor: string
  size: number
  characterSpacing: number
  bold: boolean
  borderSize: number
  hasRule: boolean
  before: number
}

const heading = (text: string, o: HeadingOpts) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: o.before, after: 80 },
    border: {
      bottom: {
        color: o.borderColor,
        size: o.hasRule ? o.borderSize : 0,
        style: o.hasRule ? BorderStyle.SINGLE : BorderStyle.NONE,
        space: 2,
      },
    },
    children: [
      new TextRun({
        text,
        bold: o.bold,
        size: o.size,
        characterSpacing: o.characterSpacing,
        color: o.color,
      }),
    ],
  })

const line = (children: (TextRun | ExternalHyperlink)[], after = 60) =>
  new Paragraph({ spacing: { after }, children })

const hyperlink = (url: string, text: string, color: string, size: number) =>
  new ExternalHyperlink({
    link: url,
    children: [new TextRun({ text, color, underline: {}, size })],
  })

const row = (left: string, right: string) =>
  new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_WIDTH }],
    spacing: { after: 20 },
    children: [new TextRun({ text: left, bold: true }), new TextRun({ text: `\t${right}` })],
  })

const bullets = (items: string[], glyph: string) =>
  items
    .map((b) => b.trim())
    .filter(Boolean)
    .map(
      (text) =>
        new Paragraph({
          spacing: { after: 20 },
          ...(glyph ? { indent: { left: 260, hanging: 260 } } : {}),
          children: [
            ...(glyph ? [new TextRun({ text: `${glyph}  ` })] : []),
            new TextRun({ text }),
          ],
        }),
    )

export async function exportDocx(resume: Resume, theme: TemplateTheme): Promise<void> {
  const {
    profile,
    sectionOrder,
    hiddenSections,
    experience,
    education,
    skills,
    projects,
    certifications,
    languages,
  } = resume

  const accent = theme.accent.replace('#', '')
  const nameColor = theme.nameColor.replace('#', '')
  const linkColor = theme.linkColor.replace('#', '')
  const fs = (halfPoints: number) => Math.round(halfPoints * (theme.baseFontSize / 11))
  const glyph = BULLET_GLYPH[theme.bulletStyle]
  const headingSize = fs(Math.round(22 * theme.headingScale))
  const headingTracking = Math.round(theme.headingTracking * (headingSize / 2) * 20)
  const toTitleCase = (text: string) => text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
  const headingFor = (text: string) => {
    const display =
      theme.headingCase === 'uppercase'
        ? text.toUpperCase()
        : theme.headingCase === 'capitalize'
          ? toTitleCase(text)
          : text
    return heading(display, {
      color: accent,
      borderColor: theme.ruleColor.replace('#', ''),
      size: headingSize,
      characterSpacing: headingTracking,
      bold: theme.headingWeight >= 600,
      borderSize: Math.max(2, Math.round(theme.ruleThickness * 6)),
      hasRule: theme.headingRule,
      before: theme.sectionSpacing * 15,
    })
  }

  const contactLines: (TextRun | ExternalHyperlink)[][] = []
  const addContact = (node: TextRun | ExternalHyperlink | string) => {
    contactLines.push([
      typeof node === 'string' ? new TextRun({ text: node, size: fs(18), color: '475569' }) : node,
    ])
  }
  if (profile.location.trim()) addContact(profile.location.trim())
  if (profile.phone.trim()) addContact(profile.phone.trim())
  if (profile.email.trim()) {
    const email = profile.email.trim()
    addContact(hyperlink(`mailto:${email}`, email, linkColor, fs(18)))
  }
  if (profile.website.trim()) {
    const site = profile.website.trim()
    addContact(hyperlink(normalizeUrl(site), site, linkColor, fs(18)))
  }
  profile.links.forEach((link) => {
    const label = (link.label || link.url).trim()
    if (!label) return
    addContact(
      link.url.trim() ? hyperlink(normalizeUrl(link.url.trim()), label, linkColor, fs(18)) : label,
    )
  })

  const nameRun = new TextRun({
    text: profile.fullName || 'Your Name',
    bold: true,
    size: fs(Math.round(44 * theme.nameScale)),
    characterSpacing: Math.round(theme.nameTracking * (fs(Math.round(44 * theme.nameScale)) / 2) * 20),
    color: nameColor,
  })
  const nameParagraph = new Paragraph({ spacing: { after: 40 }, children: [nameRun] })
  const headlineParagraph = profile.headline.trim()
    ? line([new TextRun({ text: profile.headline, size: fs(24), color: '475569' })], 40)
    : null

  const header: (Paragraph | Table)[] = []
  if (theme.headerLayout === 'split' && contactLines.length > 0) {
    const noBorders = {
      top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    }
    header.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 58, type: WidthType.PERCENTAGE },
                borders: noBorders,
                children: [nameParagraph, ...(headlineParagraph ? [headlineParagraph] : [])],
              }),
              new TableCell({
                width: { size: 42, type: WidthType.PERCENTAGE },
                borders: noBorders,
                children: contactLines.map(
                  (runs) =>
                    new Paragraph({
                      alignment: AlignmentType.RIGHT,
                      spacing: { after: 20 },
                      children: runs,
                    }),
                ),
              }),
            ],
          }),
        ],
      }),
    )
  } else {
    const contactChildren = contactLines.flatMap((runs, i) =>
      i === 0
        ? runs
        : [new TextRun({ text: '  |  ', size: fs(18), color: '475569' }), ...runs],
    )
    header.push(nameParagraph)
    if (headlineParagraph) header.push(headlineParagraph)
    if (contactChildren.length > 0) header.push(line(contactChildren))
  }

  const blocks: Record<SectionId, Paragraph[]> = {
    summary: profile.summary.trim()
      ? [headingFor(SECTION_LABELS.summary), line([new TextRun({ text: profile.summary })])]
      : [],

    experience:
      experience.length > 0
        ? [
            headingFor(SECTION_LABELS.experience),
            ...experience.flatMap((exp) => {
              const sub = [exp.company, exp.location]
                .map((s) => s.trim())
                .filter(Boolean)
                .join(', ')
              return [
                row(exp.role || 'Role', formatRange(exp.start, exp.end, exp.current)),
                ...(sub ? [line([new TextRun({ text: sub, italics: true })], 40)] : []),
                ...bullets(exp.bullets, glyph),
              ]
            }),
          ]
        : [],

    education:
      education.length > 0
        ? [
            headingFor(SECTION_LABELS.education),
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
            headingFor(SECTION_LABELS.skills),
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
            headingFor(SECTION_LABELS.projects),
            ...projects.flatMap((project) => {
              const title: (TextRun | ExternalHyperlink)[] = [
                new TextRun({ text: project.name, bold: true }),
              ]
              if (project.link.trim()) {
                title.push(new TextRun({ text: '  ' }))
                title.push(
                  hyperlink(
                    normalizeUrl(project.link.trim()),
                    project.link.trim(),
                    linkColor,
                    fs(22),
                  ),
                )
              }
              return [
                line(title, 40),
                ...(project.description.trim()
                  ? [line([new TextRun({ text: project.description })], 40)]
                  : []),
                ...bullets(project.bullets, glyph),
              ]
            }),
          ]
        : [],

    certifications:
      certifications.length > 0
        ? [
            headingFor(SECTION_LABELS.certifications),
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
            headingFor(SECTION_LABELS.languages),
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

  const children: (Paragraph | Table)[] = [
    ...header,
    ...sectionOrder
      .filter((id) => !hiddenSections.includes(id))
      .flatMap((id) => blocks[id] ?? []),
  ]

  const doc = new Document({
    creator: profile.fullName || 'CV Builder',
    title: `${profile.fullName || 'Resume'} — CV`,
    styles: {
      default: {
        document: {
          run: { font: theme.docxFont, size: fs(22) },
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

  const blob = await Packer.toBlob(doc)
  downloadBlob(blob, `${slug(profile.fullName)}_CV.docx`)
}
