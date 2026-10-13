export interface SeoInput {
  title: string
  description: string
  url: string
  siteName: string
  imageAlt: string
}

export const LIMITS = { title: 60, description: 160 } as const

export const emptySeo = (): SeoInput => ({
  title: '',
  description: '',
  url: 'https://example.com',
  siteName: 'Example',
  imageAlt: '',
})

export function truncateText(text: string, max: number): string {
  const trimmed = text.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1).trimEnd()}…`
}

export const hostFromUrl = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] || url
  }
}

export const crumbsFromUrl = (url: string): string => {
  try {
    const parsed = new URL(url)
    const segments = parsed.pathname.split('/').filter(Boolean)
    return [parsed.hostname.replace(/^www\./, ''), ...segments].join(' › ')
  } catch {
    return hostFromUrl(url)
  }
}

export function seoWarnings(input: SeoInput): string[] {
  const warnings: string[] = []
  if (!input.title.trim()) warnings.push('Add a page title.')
  else if (input.title.trim().length > LIMITS.title)
    warnings.push(`Title is ${input.title.trim().length} characters — Google truncates after ~${LIMITS.title}.`)
  if (!input.description.trim()) warnings.push('Add a meta description.')
  else if (input.description.trim().length > LIMITS.description)
    warnings.push(`Description is ${input.description.trim().length} characters — aim for under ${LIMITS.description}.`)
  else if (input.description.trim().length < 70)
    warnings.push('Description is short; 120–160 characters uses the space well.')
  if (!input.imageAlt.trim()) warnings.push('Add social image alt text for accessibility.')
  if (!/^https?:\/\/.+/.test(input.url.trim())) warnings.push('URL should start with http:// or https://.')
  return warnings
}

export const titleStatus = (title: string): 'empty' | 'good' | 'short' | 'long' => {
  const length = title.trim().length
  if (length === 0) return 'empty'
  if (length > LIMITS.title) return 'long'
  if (length < 30) return 'short'
  return 'good'
}

export const descriptionStatus = (description: string): 'empty' | 'good' | 'short' | 'long' => {
  const length = description.trim().length
  if (length === 0) return 'empty'
  if (length > LIMITS.description) return 'long'
  if (length < 70) return 'short'
  return 'good'
}

export function metaTags(input: SeoInput): string {
  const lines = [
    `<title>${input.title.trim()}</title>`,
    `<meta name="description" content="${input.description.trim()}" />`,
    `<link rel="canonical" href="${input.url.trim()}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${input.title.trim()}" />`,
    `<meta property="og:description" content="${input.description.trim()}" />`,
    `<meta property="og:url" content="${input.url.trim()}" />`,
    `<meta property="og:site_name" content="${input.siteName.trim()}" />`,
    `<meta property="og:image:alt" content="${input.imageAlt.trim()}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ]
  return lines.join('\n')
}
