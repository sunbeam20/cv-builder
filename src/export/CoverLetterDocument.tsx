import { Document, Link, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import type { CoverLetter, Profile } from '../types'
import type { TemplateTheme } from '../lib/templates'

const normalizeUrl = (url: string): string => (/^https?:\/\//i.test(url) ? url : `https://${url}`)

const makeStyles = (theme: TemplateTheme) => {
  const s = (n: number) => n * (theme.baseFontSize / 11)
  return StyleSheet.create({
    page: {
      paddingTop: theme.pageMarginY * 0.75,
      paddingBottom: theme.pageMarginY * 0.75,
      paddingHorizontal: theme.pageMarginX * 0.75,
      fontFamily: theme.pdfFonts.regular,
      fontSize: s(10.5),
      lineHeight: theme.lineHeight,
      color: '#334155',
    },
    name: { fontSize: s(22), fontFamily: theme.pdfFonts.bold, color: theme.nameColor },
    headline: { marginTop: 2, fontSize: s(11.5), color: '#475569' },
    contact: { marginTop: 6, fontSize: s(9), color: '#475569' },
    link: { color: theme.linkColor, textDecoration: 'underline' },
    block: { marginTop: 22 },
    company: { fontFamily: theme.pdfFonts.bold, color: '#0f172a' },
    paragraph: { marginTop: 12 },
    signature: { marginTop: 24, fontFamily: theme.pdfFonts.bold, color: '#0f172a' },
  })
}

export function CoverLetterDocument({
  letter,
  profile,
  theme,
}: {
  letter: CoverLetter
  profile: Profile
  theme: TemplateTheme
}) {
  const styles = makeStyles(theme)

  const contactNodes: ReactNode[] = []
  const addContact = (node: ReactNode) => {
    if (contactNodes.length > 0) contactNodes.push('  |  ')
    contactNodes.push(node)
  }
  if (profile.location.trim()) addContact(profile.location.trim())
  if (profile.phone.trim()) addContact(profile.phone.trim())
  if (profile.email.trim()) {
    addContact(
      <Link key="email" src={`mailto:${profile.email.trim()}`} style={styles.link}>
        {profile.email.trim()}
      </Link>,
    )
  }
  if (profile.website.trim()) {
    addContact(
      <Link key="website" src={normalizeUrl(profile.website.trim())} style={styles.link}>
        {profile.website.trim()}
      </Link>,
    )
  }

  const paragraphs = letter.body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <Document
      title={`${profile.fullName || 'Cover Letter'} — Cover Letter`}
      author={profile.fullName}
    >
      <Page size="A4" style={styles.page}>
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

        <Text style={styles.name}>{profile.fullName || 'Your Name'}</Text>
        {profile.headline.trim() ? (
          <Text style={styles.headline}>{profile.headline}</Text>
        ) : null}
        {contactNodes.length > 0 ? <Text style={styles.contact}>{contactNodes}</Text> : null}

        <View style={styles.block}>
          {letter.date ? <Text>{letter.date}</Text> : null}
          {letter.recipient ? <Text>{letter.recipient}</Text> : null}
          {letter.company ? <Text style={styles.company}>{letter.company}</Text> : null}
        </View>

        {letter.greeting ? <Text style={styles.block}>{letter.greeting}</Text> : null}
        {paragraphs.map((paragraph, i) => (
          <Text key={i} style={styles.paragraph}>
            {paragraph}
          </Text>
        ))}
        {letter.closing ? <Text style={styles.paragraph}>{letter.closing}</Text> : null}
        {letter.signature ? <Text style={styles.signature}>{letter.signature}</Text> : null}
      </Page>
    </Document>
  )
}
