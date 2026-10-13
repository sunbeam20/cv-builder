import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { CoverLetter, Profile } from '../types'
import type { TemplateTheme } from '../lib/templates'

const makeStyles = (theme: TemplateTheme) =>
  StyleSheet.create({
    page: {
      paddingTop: 54,
      paddingBottom: 48,
      paddingHorizontal: 58,
      fontFamily: theme.pdfFonts.regular,
      fontSize: 10.5,
      lineHeight: 1.5,
      color: '#334155',
    },
    name: { fontSize: 22, fontFamily: theme.pdfFonts.bold, color: theme.nameColor },
    headline: { marginTop: 2, fontSize: 11.5, color: '#475569' },
    contact: { marginTop: 6, fontSize: 9, color: '#475569' },
    block: { marginTop: 22 },
    company: { fontFamily: theme.pdfFonts.bold, color: '#0f172a' },
    paragraph: { marginTop: 12 },
    signature: { marginTop: 24, fontFamily: theme.pdfFonts.bold, color: '#0f172a' },
  })

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

  const contactParts = [profile.location, profile.phone, profile.email, profile.website]
    .map((s) => s.trim())
    .filter(Boolean)

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
        {contactParts.length > 0 ? (
          <Text style={styles.contact}>{contactParts.join('  |  ')}</Text>
        ) : null}

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
