import { toPlainText, wordCount } from './markdown'

export interface Note {
  id: string
  content: string
  createdAt: string
  updatedAt: string
}

export const uid = (): string => Math.random().toString(36).slice(2, 11)

export const createNote = (content = ''): Note => {
  const now = new Date().toISOString()
  return { id: uid(), content, createdAt: now, updatedAt: now }
}

/** First heading, then first non-empty line, then a fallback. */
export function noteTitle(note: Note): string {
  const heading = note.content.match(/^#{1,6}\s+(.+)$/m)
  if (heading?.[1]) return heading[1].trim()
  const line = note.content.split('\n').find((value) => value.trim())
  return line ? toPlainText(line).slice(0, 60) : 'Untitled note'
}

export function noteExcerpt(note: Note): string {
  return toPlainText(note.content).slice(0, 80)
}

export const noteWords = (note: Note): number => wordCount(note.content)

export const sortNotes = (notes: Note[]): Note[] =>
  [...notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

export const DEFAULT_NOTE = `# Welcome 👋

This is a **Markdown** editor with a live preview.

## Formatting
- **Bold** and *italic*
- \`inline code\`
- [Links](https://example.com)

> Everything is stored locally in your browser.

\`\`\`js
const greet = (name) => \`Hello, \${name}!\`
\`\`\`
`
