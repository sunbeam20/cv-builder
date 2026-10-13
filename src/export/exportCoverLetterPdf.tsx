import { pdf } from '@react-pdf/renderer'
import type { CoverLetter, Profile } from '../types'
import type { TemplateTheme } from '../lib/templates'
import { downloadBlob, slug } from '../lib/helpers'
import { CoverLetterDocument } from './CoverLetterDocument'

export async function exportCoverLetterPdf(
  letter: CoverLetter,
  profile: Profile,
  theme: TemplateTheme,
): Promise<void> {
  const blob = await pdf(
    <CoverLetterDocument letter={letter} profile={profile} theme={theme} />,
  ).toBlob()
  downloadBlob(blob, `${slug(profile.fullName)}_Cover_Letter.pdf`)
}
