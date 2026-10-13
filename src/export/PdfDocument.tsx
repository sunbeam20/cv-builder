import { Document, Link, Page, StyleSheet, Svg, Path, Circle, Rect, Line, Text, View } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import type { Resume, SectionId } from '../types'
import type { ContactIconKind, SectionHeadingStyle, TemplateTheme } from '../lib/templates'
import { SECTION_LABELS, formatRange } from '../lib/helpers'
import { BULLET_GLYPH, sectionHeadingStyle } from '../lib/templates'

const normalizeUrl = (url: string): string => (/^https?:\/\//i.test(url) ? url : `https://${url}`)

export function ContactIcon({
  kind,
  color,
  size,
}: {
  kind: ContactIconKind
  color: string
  size: number
}) {
  const stroke = { stroke: color, strokeWidth: 0.9, fill: 'none' as const }
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12">
      {kind === 'email' ? (
        <>
          <Rect x="1" y="2.6" width="10" height="6.8" rx="0.8" {...stroke} />
          <Path d="M1.4 3.2 L6 6.4 L10.6 3.2" {...stroke} />
        </>
      ) : kind === 'phone' ? (
        <Path
          d="M2.6 1.2 L4.4 1.2 L5.4 3.8 L4.1 4.8 C5 6.6 6.4 8 8.2 8.9 L9.2 7.6 L11.8 8.6 L11.8 10.4 C11.8 11 11.3 11.5 10.7 11.5 C5.3 11.1 0.9 6.7 0.5 1.3 C0.5 0.7 1 0.2 1.6 0.2 Z"
          fill={color}
        />
      ) : kind === 'location' ? (
        <>
          <Path d="M6 11.2 C6 11.2 10 7.4 10 4.6 C10 2.4 8.2 0.8 6 0.8 C3.8 0.8 2 2.4 2 4.6 C2 7.4 6 11.2 6 11.2 Z" fill={color} />
          <Circle cx="6" cy="4.6" r="1.4" fill="#ffffff" />
        </>
      ) : kind === 'website' ? (
        <>
          <Circle cx="6" cy="6" r="5" {...stroke} />
          <Line x1="1" y1="6" x2="11" y2="6" stroke={color} strokeWidth={0.9} />
          <Path d="M6 1 C3.6 3 3.6 9 6 11 C8.4 9 8.4 3 6 1 Z" {...stroke} />
        </>
      ) : (
        <>
          <Path d="M4.4 7.6 L8.4 3.6" stroke={color} strokeWidth={1.1} />
          <Path d="M5.6 3.4 L8.6 3.4 L8.6 6.4" {...stroke} />
        </>
      )}
    </Svg>
  )
}

const makeStyles = (theme: TemplateTheme) => {
  const s = (n: number) => n * (theme.baseFontSize / 11)
  return StyleSheet.create({
    page: {
      paddingTop: theme.pageMarginY * 0.75,
      paddingBottom: theme.pageMarginY * 0.75,
      paddingHorizontal: theme.pageMarginX * 0.75,
      fontFamily: theme.pdfFonts.regular,
      fontSize: s(10),
      lineHeight: theme.lineHeight,
      color: theme.bodyColor,
    },
    name: {
      fontSize: s(22 * theme.nameScale),
      fontFamily: theme.pdfFonts.bold,
      color: theme.nameColor,
      letterSpacing: theme.nameTracking * s(22 * theme.nameScale),
    },
    headline: { marginTop: 2, fontSize: s(11.5), color: '#475569' },
    contact: { marginTop: 6, fontSize: s(9), color: '#475569' },
    contactRow: { marginTop: 6, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
    contactItem: { flexDirection: 'row', alignItems: 'center' },
    contactIcon: { marginRight: 2 },
    contactText: { fontSize: s(9), color: '#475569' },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    headerLeft: { flexShrink: 1, paddingRight: 12 },
    headerRight: { alignItems: 'flex-end' },
    contactRightRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
    contactRight: { fontSize: s(9), color: '#475569' },
    link: { color: theme.linkColor, textDecoration: 'underline' },
    section: { marginTop: theme.sectionSpacing * 0.75 },
    sectionTitle: {
      fontSize: s(10 * theme.headingScale),
      fontFamily: theme.headingWeight >= 600 ? theme.pdfFonts.bold : theme.pdfFonts.regular,
      letterSpacing: theme.headingTracking * s(10 * theme.headingScale),
      textTransform: theme.headingCase,
      paddingBottom: 3,
      marginBottom: 6,
    },
    sectionTitleBar: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    sectionBar: {
      width: 3,
      height: s(10 * theme.headingScale),
      marginRight: 5,
      borderRadius: 1,
    },
    entry: { marginBottom: 8 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
    entryTitle: { fontSize: s(10.5), fontFamily: theme.pdfFonts.bold, color: '#0f172a' },
    dates: { fontSize: s(9), color: '#64748b' },
    subtitle: { fontSize: s(10), fontFamily: theme.pdfFonts.italic, color: '#475569' },
    body: { fontSize: s(10), color: '#334155' },
    bulletRow: { flexDirection: 'row', marginTop: 2 },
    bulletDot: { width: s(10), fontSize: s(10), color: '#334155' },
    bulletText: { flex: 1, fontSize: s(10), color: '#334155' },
    skillLine: { fontSize: s(10), color: '#334155', marginBottom: 1 },
    pageNumber: {
      position: 'absolute',
      bottom: 22,
      right: 54,
      fontSize: 8,
      color: '#94a3b8',
    },
  })
}

type Styles = ReturnType<typeof makeStyles>

function Bullets({ items, styles, glyph }: { items: string[]; styles: Styles; glyph: string }) {
  const bullets = items.map((b) => b.trim()).filter(Boolean)
  if (bullets.length === 0) return null
  return (
    <View>
      {bullets.map((bullet, i) => (
        <View key={i} style={styles.bulletRow}>
          {glyph ? <Text style={styles.bulletDot}>{glyph}</Text> : null}
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
  headingStyle,
  ruleColor,
  ruleWidth,
  children,
}: {
  title: string
  accent: string
  styles: Styles
  headingStyle: SectionHeadingStyle
  ruleColor: string
  ruleWidth: number
  children: ReactNode
}) {
  const titleStyle = {
    color: accent,
    ...(headingStyle === 'rule'
      ? { borderBottomWidth: ruleWidth, borderBottomColor: ruleColor }
      : {}),
  }
  return (
    <View style={styles.section}>
      {headingStyle === 'bar' ? (
        <View style={styles.sectionTitleBar}>
          <View style={[styles.sectionBar, { backgroundColor: accent }]} />
          <Text style={[styles.sectionTitle, titleStyle]}>{title}</Text>
        </View>
      ) : (
        <Text style={[styles.sectionTitle, titleStyle]}>{title}</Text>
      )}
      {children}
    </View>
  )
}

export function PdfDocument({ resume, theme }: { resume: Resume; theme: TemplateTheme }) {
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

  const styles = makeStyles(theme)
  const s = (n: number) => n * (theme.baseFontSize / 11)
  const glyph = BULLET_GLYPH[theme.bulletStyle]

  const contacts: { kind: ContactIconKind; node: ReactNode }[] = []
  const addContact = (kind: ContactIconKind, node: ReactNode) => contacts.push({ kind, node })
  if (profile.location.trim()) addContact('location', profile.location.trim())
  if (profile.phone.trim()) addContact('phone', profile.phone.trim())
  if (profile.email.trim()) {
    addContact(
      'email',
      <Link key="email" src={`mailto:${profile.email.trim()}`} style={styles.link}>
        {profile.email.trim()}
      </Link>,
    )
  }
  if (profile.website.trim()) {
    addContact(
      'website',
      <Link key="website" src={normalizeUrl(profile.website.trim())} style={styles.link}>
        {profile.website.trim()}
      </Link>,
    )
  }
  profile.links.forEach((link, index) => {
    const label = (link.label || link.url).trim()
    if (!label) return
    addContact(
      'link',
      link.url.trim() ? (
        <Link key={`link-${index}`} src={normalizeUrl(link.url.trim())} style={styles.link}>
          {label}
        </Link>
      ) : (
        label
      ),
    )
  })
  const iconSize = s(9)
  const contactIcon = (kind: ContactIconKind) =>
    theme.contactIcons ? (
      <View style={styles.contactIcon}>
        <ContactIcon kind={kind} color={theme.accent} size={iconSize} />
      </View>
    ) : null

  const sections: Record<SectionId, ReactNode> = {
    summary: profile.summary.trim() ? (
      <Section accent={theme.accent} styles={styles} headingStyle={sectionHeadingStyle(theme, 'summary')} ruleColor={theme.ruleColor} ruleWidth={theme.ruleThickness * 0.75} title={SECTION_LABELS.summary}>
        <Text style={styles.body}>{profile.summary}</Text>
      </Section>
    ) : null,

    experience:
      experience.length > 0 ? (
        <Section accent={theme.accent} styles={styles} headingStyle={sectionHeadingStyle(theme, 'experience')} ruleColor={theme.ruleColor} ruleWidth={theme.ruleThickness * 0.75} title={SECTION_LABELS.experience}>
          {experience.map((exp) => (
            <View key={exp.id} style={styles.entry} wrap={false}>
              <View style={styles.row}>
                <Text style={styles.entryTitle}>{exp.role || 'Role'}</Text>
                <Text style={styles.dates}>{formatRange(exp.start, exp.end, exp.current)}</Text>
              </View>
              <Text style={styles.subtitle}>
                {[exp.company, exp.location].map((s) => s.trim()).filter(Boolean).join(', ')}
              </Text>
              <Bullets items={exp.bullets} styles={styles} glyph={glyph} />
            </View>
          ))}
        </Section>
      ) : null,

    education:
      education.length > 0 ? (
        <Section accent={theme.accent} styles={styles} headingStyle={sectionHeadingStyle(theme, 'education')} ruleColor={theme.ruleColor} ruleWidth={theme.ruleThickness * 0.75} title={SECTION_LABELS.education}>
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
        <Section accent={theme.accent} styles={styles} headingStyle={sectionHeadingStyle(theme, 'skills')} ruleColor={theme.ruleColor} ruleWidth={theme.ruleThickness * 0.75} title={SECTION_LABELS.skills}>
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
        <Section accent={theme.accent} styles={styles} headingStyle={sectionHeadingStyle(theme, 'projects')} ruleColor={theme.ruleColor} ruleWidth={theme.ruleThickness * 0.75} title={SECTION_LABELS.projects}>
          {projects.map((project) => (
            <View key={project.id} style={styles.entry} wrap={false}>
              <Text style={styles.entryTitle}>
                {project.name}
                {project.link.trim() ? (
                  <Link src={normalizeUrl(project.link.trim())} style={styles.link}>
                    {`   ${project.link.trim()}`}
                  </Link>
                ) : null}
              </Text>
              {project.description.trim() ? (
                <Text style={styles.body}>{project.description}</Text>
              ) : null}
              <Bullets items={project.bullets} styles={styles} glyph={glyph} />
            </View>
          ))}
        </Section>
      ) : null,

    certifications:
      certifications.length > 0 ? (
        <Section accent={theme.accent} styles={styles} headingStyle={sectionHeadingStyle(theme, 'certifications')} ruleColor={theme.ruleColor} ruleWidth={theme.ruleThickness * 0.75} title={SECTION_LABELS.certifications}>
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
        <Section accent={theme.accent} styles={styles} headingStyle={sectionHeadingStyle(theme, 'languages')} ruleColor={theme.ruleColor} ruleWidth={theme.ruleThickness * 0.75} title={SECTION_LABELS.languages}>
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
        {theme.headerLayout === 'split' ? (
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.name}>{profile.fullName || 'Your Name'}</Text>
              {profile.headline.trim() ? (
                <Text style={styles.headline}>{profile.headline}</Text>
              ) : null}
            </View>
            {contacts.length > 0 ? (
              <View style={styles.headerRight}>
                {contacts.map((c, i) => (
                  <View key={i} style={styles.contactRightRow}>
                    {contactIcon(c.kind)}
                    <Text style={styles.contactRight}>{c.node}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ) : (
          <View>
            <Text style={styles.name}>{profile.fullName || 'Your Name'}</Text>
            {profile.headline.trim() ? (
              <Text style={styles.headline}>{profile.headline}</Text>
            ) : null}
            {contacts.length > 0 ? (
              <View style={styles.contactRow}>
                {contacts.map((c, i) => (
                  <View key={i} style={styles.contactItem}>
                    {i > 0 ? <Text style={styles.contactText}>{'  |  '}</Text> : null}
                    {contactIcon(c.kind)}
                    <Text style={styles.contactText}>{c.node}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        )}

        {sectionOrder
          .filter((id) => !hiddenSections.includes(id))
          .map((id) => (
            <View key={id}>{sections[id]}</View>
          ))}
      </Page>
    </Document>
  )
}
