import { pdf } from '@react-pdf/renderer'
import type { Resume } from '../types'
import type { TemplateTheme } from '../lib/templates'
import { downloadBlob, slug } from '../lib/helpers'
import { PdfDocument } from './PdfDocument'

export async function exportPdf(resume: Resume, theme: TemplateTheme): Promise<void> {
  const blob = await pdf(<PdfDocument resume={resume} theme={theme} />).toBlob()
  downloadBlob(blob, `${slug(resume.profile.fullName)}_CV.pdf`)
}
