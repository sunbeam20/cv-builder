import { describe, expect, it } from 'vitest'
import { pdf } from '@react-pdf/renderer'
import { PdfDocument } from './PdfDocument'
import { CoverLetterDocument } from './CoverLetterDocument'
import { sampleResume } from '../lib/sampleData'
import { emptyCoverLetter } from '../lib/coverLetter'
import { TEMPLATES } from '../lib/templates'

describe('pdf render smoke', () => {
  it('renders the resume document', async () => {
    const blob = await pdf(<PdfDocument resume={sampleResume()} theme={TEMPLATES.modern} />).toBlob()
    expect(blob.size).toBeGreaterThan(0)
  })

  it('renders the resume document with a split header', async () => {
    const blob = await pdf(
      <PdfDocument
        resume={sampleResume()}
        theme={{ ...TEMPLATES.modern, headerLayout: 'split' }}
      />,
    ).toBlob()
    expect(blob.size).toBeGreaterThan(0)
  })

  it('renders the cover letter document', async () => {
    const resume = sampleResume()
    const blob = await pdf(
      <CoverLetterDocument
        letter={{ ...emptyCoverLetter(resume.profile), body: 'Hello there' }}
        profile={resume.profile}
        theme={TEMPLATES.modern}
      />,
    ).toBlob()
    expect(blob.size).toBeGreaterThan(0)
  })
})
