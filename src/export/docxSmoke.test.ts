import { describe, expect, it } from 'vitest'
import { buildResumeDocx } from './exportDocx'
import { buildCoverLetterDocx } from './exportCoverLetterDocx'
import { sampleResume } from '../lib/sampleData'
import { emptyCoverLetter } from '../lib/coverLetter'
import { resolveTheme, TEMPLATES } from '../lib/templates'

const isZip = async (blob: Blob) => {
  const bytes = new Uint8Array(await blob.arrayBuffer())
  return bytes[0] === 0x50 && bytes[1] === 0x4b
}

describe('docx render smoke', () => {
  it('builds a valid resume .docx (zip) for the default theme', async () => {
    const blob = await buildResumeDocx(sampleResume(), TEMPLATES.modern)
    expect(blob.size).toBeGreaterThan(0)
    expect(await isZip(blob)).toBe(true)
  })

  it('builds a resume with split header, icons and bar headings', async () => {
    const theme = resolveTheme(TEMPLATES.ats, {
      headerLayout: 'split',
      contactIcons: true,
      bodyColor: '#123456',
      sectionHeadings: { skills: 'bar', summary: 'plain' },
    })
    const blob = await buildResumeDocx(sampleResume(), theme)
    expect(blob.size).toBeGreaterThan(0)
    expect(await isZip(blob)).toBe(true)
  })

  it('builds a valid cover letter .docx', async () => {
    const resume = sampleResume()
    const letter = { ...emptyCoverLetter(resume.profile), body: 'Hello there.\n\nSecond part.' }
    const theme = resolveTheme(TEMPLATES.elegant, { contactIcons: true })
    const blob = await buildCoverLetterDocx(letter, resume.profile, theme)
    expect(blob.size).toBeGreaterThan(0)
    expect(await isZip(blob)).toBe(true)
  })
})
