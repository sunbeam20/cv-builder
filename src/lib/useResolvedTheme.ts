import { useResumeStore } from '../store/resumeStore'
import { TEMPLATES, resolveTheme, type TemplateTheme } from './templates'

/** The selected template with the user's customization overrides applied. */
export function useResolvedTheme(): TemplateTheme {
  const template = useResumeStore((s) => s.template)
  const customization = useResumeStore((s) => s.customization)
  return resolveTheme(TEMPLATES[template], customization)
}
