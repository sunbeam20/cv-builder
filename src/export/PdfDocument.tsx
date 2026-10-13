import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import type { Resume, SectionId } from '../types'
import type { TemplateTheme } from '../lib/templates'
import { SECTION_LABELS, formatRange } from '../lib/helpers'

const makeStyles = (theme: TemplateTheme) =>
  StyleSheet.create({
    page: {
      paddingTop: 48,
      paddingBottom: 48,
      paddingHorizontal: 54,
      fontFamily: theme.pdfFonts.regular,
      fontSize: 10,
      lineHeight: 1.4,
      color: '#111827',
    },
    name: { fontSize: 22, fontFamily: theme.pdfFonts.bold, color: theme.nameColor },
    headline: { marginTop: 2, fontSize: 11.5, color: '#475569' },
    contact: { marginTop: 6, fontSize: 9, color: '#475569' },
    section: { marginTop: 14 },
    sectionTitle: {
      fontSize: 10,
      fontFamily: theme.pdfFonts.bold,
      letterSpacing: 1.4,
      textTransform: 'uppercase',
      borderBottomWidth: theme.headingRule ? 0.75 : 0,
      paddingBottom: 3,
      marginBottom: 6,
    },
    entry: { marginBottom: 8 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
    entryTitle: { fontSize: 10.5, fontFamily: theme.pdfFonts.bold, color: '#0f172a' },
    dates: { fontSize: 9, color: '#64748b' },
    subtitle: { fontSize: 10, fontFamily: theme.pdfFonts.italic, color: '#475569' },
    body: { fontSize: 10, color: '#334155' },
    bulletRow: { flexDirection: 'row', marginTop: 2 },
    bulletDot: { width: 10, fontSize: 10, color: '#334155' },
    bulletText: { flex: 1, fontSize: 10, color: '#334155' },
    skillLine: { fontSize: 10, color: '#334155', marginBottom: 1 },
    pageNumber: {
      position: 'absolute',
      bottom: 22,
      right: 54,
      fontSize: 8,
      color: '#94a3b8',
    },
  })

type Styles = ReturnType<typeof makeStyles>

function Bullets({ items, styles }: { items: string[]; styles: Styles }) {
  const bullets = items.map((b) => b.trim()).filter(Boolean)
  if (bullets.length === 0) return null
  return (
    <View>
      {bullets.map((bullet, i) => (
        <View key={i} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>{'\u2022'}</Text>
          <Text style={styles.bulletText}>{bullet}</Text>
        </View>
      ))}
    </View>
  )
}

function Section({
  title,
  accent,
  styles,
  children,
}: {
  title: string
  accent: string
  styles: Styles
  children: ReactNode
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: accent, borderBottomColor: accent }]}>
        {title}
      </Text>
      {children}
    </View>
  )
}

export function PdfDocument({ resume, theme }: { resume: Resume; theme: TemplateTheme }) {
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

  const styles = makeStyles(theme)

  const contactParts = [
    profile.location,
    profile.phone,
    profile.email,
    profile.website,
    ...profile.links.map((l) => l.url || l.label),
  ]
    .map((s) => s.trim())
    .filter(Boolean)

  const sections: Record<SectionId, ReactNode> = {
    summary: profile.summary.trim() ? (
      <Section accent={theme.accent} styles={styles} title={SECTION_LABELS.summary}>
        <Text style={styles.body}>{profile.summary}</Text>
      </Section>
    ) : null,

    experience:
      experience.length > 0 ? (
        <Section accent={theme.accent} styles={styles} title={SECTION_LABELS.experience}>
          {experience.map((exp) => (
            <View key={exp.id} style={styles.entry} wrap={false}>
              <View style={styles.row}>
                <Text style={styles.entryTitle}>{exp.role || 'Role'}</Text>
                <Text style={styles.dates}>{formatRange(exp.start, exp.end, exp.current)}</Text>
              </View>
              <Text style={styles.subtitle}>
                {[exp.company, exp.location].map((s) => s.trim()).filter(Boolean).join(', ')}
              </Text>
              <Bullets items={exp.bullets} styles={styles} />
            </View>
          ))}
        </Section>
      ) : null,

    education:
      education.length > 0 ? (
        <Section accent={theme.accent} styles={styles} title={SECTION_LABELS.education}>
          {education.map((edu) => (
            <View key={edu.id} style={styles.entry} wrap={false}>
              <View style={styles.row}>
                <Text style={styles.entryTitle}>{edu.school || 'School'}</Text>
                <Text style={styles.dates}>{formatRange(edu.start, edu.end, false)}</Text>
              </View>
              <Text style={styles.subtitle}>
                {[edu.degree, edu.field].map((s) => s.trim()).filter(Boolean).join(', ')}
                {edu.location ? ` — ${edu.location}` : ''}
              </Text>
              {edu.details.trim() ? <Text style={styles.body}>{edu.details}</Text> : null}
            </View>
          ))}
        </Section>
      ) : null,

    skills:
      skills.length > 0 ? (
        <Section accent={theme.accent} styles={styles} title={SECTION_LABELS.skills}>
          {skills.map((group) => (
            <Text key={group.id} style={styles.skillLine}>
              {group.category ? (
                <Text style={styles.entryTitle}>{`${group.category}: `}</Text>
              ) : null}
              {group.items.join(', ')}
            </Text>
          ))}
        </Section>
      ) : null,

    projects:
      projects.length > 0 ? (
        <Section accent={theme.accent} styles={styles} title={SECTION_LABELS.projects}>
          {projects.map((project) => (
            <View key={project.id} style={styles.entry} wrap={false}>
              <Text style={styles.entryTitle}>
                {project.name}
                {project.link.trim() ? (
                  <Text style={styles.dates}>{`   ${project.link}`}</Text>
                ) : null}
              </Text>
              {project.description.trim() ? (
                <Text style={styles.body}>{project.description}</Text>
              ) : null}
              <Bullets items={project.bullets} styles={styles} />
            </View>
          ))}
        </Section>
      ) : null,

    certifications:
      certifications.length > 0 ? (
        <Section accent={theme.accent} styles={styles} title={SECTION_LABELS.certifications}>
          {certifications.map((cert) => (
            <Text key={cert.id} style={styles.skillLine}>
              {cert.name}
              {cert.issuer ? ` — ${cert.issuer}` : ''}
              {cert.date ? ` (${cert.date})` : ''}
            </Text>
          ))}
        </Section>
      ) : null,

    languages:
      languages.length > 0 ? (
        <Section accent={theme.accent} styles={styles} title={SECTION_LABELS.languages}>
          <Text style={styles.body}>
            {languages
              .map((l) => [l.name, l.proficiency].filter(Boolean).join(' '))
              .filter(Boolean)
              .join('  \u2022  ')}
          </Text>
        </Section>
      ) : null,
  }

  return (
    <Document title={`${profile.fullName || 'Resume'} — CV`} author={profile.fullName}>
      <Page size="A4" style={styles.page}>
        <Text
          fixed
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            totalPages > 1 ? `Page ${pageNumber} of ${totalPages}` : ''
          }
        />
        {theme.accentBar ? (
          <View
            fixed
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 5,
              backgroundColor: theme.accent,
            }}
          />
        ) : null}
        <View>
          <Text style={styles.name}>{profile.fullName || 'Your Name'}</Text>
          {profile.headline.trim() ? (
            <Text style={styles.headline}>{profile.headline}</Text>
          ) : null}
          {contactParts.length > 0 ? (
            <Text style={styles.contact}>{contactParts.join('  |  ')}</Text>
          ) : null}
        </View>

        {sectionOrder.map((id) => (
          <View key={id}>{sections[id]}</View>
        ))}
      </Page>
    </Document>
  )
}
