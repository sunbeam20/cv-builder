import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { fillTemplate, type CoverLetter } from './model'

const styles = StyleSheet.create({
  page: { fontSize: 12, lineHeight: 1.6, color: '#111827' },
  name: { fontSize: 16, marginBottom: 3 },
  contact: { fontSize: 10, color: '#475569', marginBottom: 2 },
  date: { marginTop: 20, marginBottom: 12 },
  companyBlock: { marginBottom: 12 },
  paragraph: { marginBottom: 12 },
})

export function CoverLetterPdf({ letter }: { letter: CoverLetter }) {
  const fontFamily = letter.font === 'serif' ? 'Times-Roman' : 'Helvetica'
  const context = { jobTitle: letter.jobTitle, company: letter.company }

  const contactLines = [letter.sender.email, letter.sender.phone, letter.sender.location]
    .map((value) => value.trim())
    .filter(Boolean)
  const linkLine = letter.sender.links.filter(Boolean).join(' · ')
  const bodyParagraphs = letter.body.trim() ? letter.body.trim().split(/\n\s*\n/) : []

  return (
    <Document>
      <Page size="A4" style={[styles.page, { padding: letter.margin, fontFamily }]}>
        {letter.sender.name.trim() ? (
          <Text style={[styles.name, { color: letter.accent }]}>{letter.sender.name.trim()}</Text>
        ) : null}
        {contactLines.length ? <Text style={styles.contact}>{contactLines.join(' · ')}</Text> : null}
        {linkLine ? <Text style={styles.contact}>{linkLine}</Text> : null}

        {letter.date.trim() ? <Text style={styles.date}>{letter.date.trim()}</Text> : null}

        {letter.company.trim() || letter.jobTitle.trim() ? (
          <View style={styles.companyBlock}>
            {letter.company.trim() ? <Text>{letter.company.trim()}</Text> : null}
            {letter.jobTitle.trim() ? <Text>{letter.jobTitle.trim()}</Text> : null}
          </View>
        ) : null}

        <Text style={styles.paragraph}>Dear {letter.hiringManager.trim() || 'Hiring Manager'},</Text>

        {letter.opening.trim() ? (
          <Text style={styles.paragraph}>{fillTemplate(letter.opening.trim(), context)}</Text>
        ) : null}

        {bodyParagraphs.map((paragraph, index) => (
          <Text key={index} style={styles.paragraph}>
            {fillTemplate(paragraph, context)}
          </Text>
        ))}

        {letter.closing.trim() ? <Text style={styles.paragraph}>{letter.closing.trim()}</Text> : null}
      </Page>
    </Document>
  )
}

export default CoverLetterPdf
