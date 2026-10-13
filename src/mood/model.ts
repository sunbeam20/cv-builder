export interface MoodEntry {
  id: string
  /** YYYY-MM-DD */
  date: string
  /** 1 (low) – 5 (great) */
  mood: number
  tags: string[]
  gratitude: string[]
  note: string
  createdAt: string
}

export const MOODS: { value: number; emoji: string; label: string }[] = [
  { value: 1, emoji: '😔', label: 'Low' },
  { value: 2, emoji: '😕', label: 'Meh' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Great' },
]

export const moodMeta = (value: number) =>
  MOODS.find((mood) => mood.value === value) ?? MOODS[2]!

export const MOOD_TAGS = [
  'work',
  'family',
  'health',
  'friends',
  'rest',
  'exercise',
  'money',
  'creative',
] as const

export const dateKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const addDays = (date: Date, days: number): Date => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export const sortByDateDesc = (entries: MoodEntry[]): MoodEntry[] =>
  [...entries].sort((a, b) => b.date.localeCompare(a.date))

export const createEntry = (input: {
  date: string
  mood: number
  tags?: string[]
  gratitude?: string[]
  note?: string
}): MoodEntry => ({
  id: Math.random().toString(36).slice(2, 11),
  date: input.date,
  mood: Math.min(5, Math.max(1, Math.round(input.mood))),
  tags: input.tags ?? [],
  gratitude: (input.gratitude ?? []).map((item) => item.trim()).filter(Boolean),
  note: input.note?.trim() ?? '',
  createdAt: new Date().toISOString(),
})

export interface MoodSummary {
  count: number
  average: number
  best: number
  distribution: Record<number, number>
  topTags: { tag: string; count: number }[]
  streak: number
}

export function summarise(entries: MoodEntry[], today: Date = new Date()): MoodSummary | null {
  if (entries.length === 0) return null
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  let total = 0
  const tagCounts = new Map<string, number>()
  for (const entry of entries) {
    distribution[entry.mood] = (distribution[entry.mood] ?? 0) + 1
    total += entry.mood
    for (const tag of entry.tags) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
  }
  const dates = new Set(entries.map((entry) => entry.date))
  let cursor = new Date(today)
  if (!dates.has(dateKey(cursor))) cursor = addDays(cursor, -1)
  let streak = 0
  while (dates.has(dateKey(cursor))) {
    streak += 1
    cursor = addDays(cursor, -1)
  }
  return {
    count: entries.length,
    average: Number((total / entries.length).toFixed(2)),
    best: Math.max(...entries.map((entry) => entry.mood)),
    distribution,
    topTags: [...tagCounts.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4),
    streak,
  }
}

/** Most recent `count` entries (oldest → newest) for the trend chart. */
export const trend = (entries: MoodEntry[], count = 14): MoodEntry[] =>
  sortByDateDesc(entries)
    .slice(0, count)
    .reverse()
