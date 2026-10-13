export type VolumeUnit = 'ml' | 'L' | 'oz'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active'
export type ClimateFactor = 'mild' | 'warm' | 'hot'

export interface BeverageType {
  label: string
  hydrationFactor: number
  caffeinePerLiter: number
}

export const BEVERAGE_MAP: Record<string, BeverageType> = {
  water: { label: 'Water', hydrationFactor: 1.0, caffeinePerLiter: 0 },
  coffee: { label: 'Coffee', hydrationFactor: 0.9, caffeinePerLiter: 400 },
  tea: { label: 'Tea', hydrationFactor: 0.95, caffeinePerLiter: 150 },
  juice: { label: 'Juice', hydrationFactor: 1.0, caffeinePerLiter: 0 },
  soda: { label: 'Soda', hydrationFactor: 0.8, caffeinePerLiter: 90 },
  sports: { label: 'Sports drink', hydrationFactor: 0.9, caffeinePerLiter: 0 },
}

export const BEVERAGE_IDS = Object.keys(BEVERAGE_MAP)

export const beverageLabel = (id: string): string => BEVERAGE_MAP[id]?.label ?? 'Water'

export const effectiveMl = (beverage: string, amountMl: number): number =>
  Math.round(amountMl * (BEVERAGE_MAP[beverage]?.hydrationFactor ?? 1))

export const caffeineMg = (beverage: string, amountMl: number): number =>
  Math.round((amountMl * (BEVERAGE_MAP[beverage]?.caffeinePerLiter ?? 0)) / 1000)

export interface IntakeEntry {
  id: string
  amountMl: number
  beverage: string
  loggedAt: string
  createdAt: string
  updatedAt: string
}

export interface DailyTarget {
  targetMl: number
  unit: VolumeUnit
}

export interface UserGoal {
  weightKg: number
  age: number
  activityLevel: ActivityLevel
}

export const VOLUME_UNIT_LABELS: Record<VolumeUnit, string> = { ml: 'ml', L: 'L', oz: 'oz' }

const ML_PER_OZ = 29.5735

export const formatVolume = (amountMl: number, unit: VolumeUnit): string => {
  if (unit === 'ml') return `${Math.round(amountMl)} ml`
  if (unit === 'L') {
    const liters = Number((amountMl / 1000).toFixed(3))
    return `${liters} L`
  }
  return `${(amountMl / ML_PER_OZ).toFixed(1)} oz`
}

const pad = (value: number): string => String(value).padStart(2, '0')

export const formatTime = (iso: string): string => {
  const date = new Date(iso)
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export const formatDayMonth = (iso: string): string => {
  const date = new Date(iso)
  const month = date.toLocaleString('en', { month: 'short' })
  return `${date.getDate()} ${month}`
}

export const sameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

export const startOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate())

export const daysAgo = (now: Date, days: number): Date => {
  const date = startOfDay(now)
  date.setDate(date.getDate() - days)
  return date
}

export interface DayTotal {
  date: Date
  totalMl: number
  metGoal: boolean
  caffeineTotal: number
}

/** Aggregate entries into per-calendar-day buckets (effective ml). */
export function bucketByDay(entries: IntakeEntry[], targetMl: number): Map<string, DayTotal> {
  const map = new Map<string, DayTotal>()
  for (const entry of entries) {
    const key = formatDayKey(new Date(entry.loggedAt))
    const bucket = map.get(key)
    if (bucket) {
      bucket.totalMl += effectiveMl(entry.beverage, entry.amountMl)
      bucket.caffeineTotal += caffeineMg(entry.beverage, entry.amountMl)
    } else {
      map.set(key, {
        date: new Date(entry.loggedAt),
        totalMl: effectiveMl(entry.beverage, entry.amountMl),
        caffeineTotal: caffeineMg(entry.beverage, entry.amountMl),
        metGoal: false,
      })
    }
  }
  for (const bucket of map.values()) bucket.metGoal = bucket.totalMl >= targetMl
  return map
}

export const formatDayKey = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export interface HydrationProgress {
  todayEntries: IntakeEntry[]
  totalMl: number
  caffeineMg: number
  ratio: number
}

export function progressFor(entries: IntakeEntry[], targetMl: number, now: Date): HydrationProgress {
  const today = entries.filter((entry) => sameDay(new Date(entry.loggedAt), now))
  const total = today.reduce((sum, entry) => sum + effectiveMl(entry.beverage, entry.amountMl), 0)
  const caffeine = today.reduce(
    (sum, entry) => sum + caffeineMg(entry.beverage, entry.amountMl),
    0,
  )
  return { todayEntries: today, totalMl: total, caffeineMg: caffeine, ratio: Math.min(1, total / targetMl) }
}

const MAX_TARGET_ML = 4000
export const CAFFEINE_CAP_MG = 400

export interface GoalRecommendation {
  base: number
  activityFactor: number
  seniorFactor: number
  climateFactor: number
  recommendedMl: number
}

/** weightKg 0–400, age 0–120; throws on invalid profiles. */
export function goalCalculator(
  weightKg: number,
  age: number,
  activityLevel: ActivityLevel,
  climate: ClimateFactor,
): GoalRecommendation {
  if (weightKg <= 0 || weightKg > 400 || age < 0 || age > 120) {
    throw new Error('Invalid profile')
  }
  const activityFactor: Record<ActivityLevel, number> = {
    sedentary: 1.0,
    light: 1.05,
    moderate: 1.1,
    active: 1.2,
  }
  const climateFactor: Record<ClimateFactor, number> = { mild: 1.0, warm: 1.1, hot: 1.2 }
  let value = weightKg * 33
  value *= activityFactor[activityLevel]
  const seniorFactor = age >= 65 ? 0.9 : 1
  value *= seniorFactor
  value *= climateFactor[climate]
  const rounded = Math.round(value / 10) * 10
  return {
    base: weightKg * 33,
    activityFactor: activityFactor[activityLevel],
    seniorFactor,
    climateFactor: climateFactor[climate],
    recommendedMl: Math.min(MAX_TARGET_ML, Math.max(1000, rounded)),
  }
}

export interface Insights {
  todayMl: number
  thisWeekMl: number
  thisMonthMl: number
  averageGlassMl: number
  mostLoggedBeverage: string | null
  lastSevenDaysMl: number[]
  weekLabels: string[]
  streak: StreakSummary
  freezes: FrozenStreakSummary
  score: number
  achievements: Achievement[]
  challenges: ChallengeResult[]
}

export const MONTH_DAY_MS = 30
export const DAY_MS = 86400000

const atMidnight = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate())

export function insightsFor(entries: IntakeEntry[], targetMl: number, now: Date): Insights {
  const today = atMidnight(now)
  const weekday = today.getDay()
  const mondayOffset = weekday === 0 ? 6 : weekday - 1
  const monday = new Date(today)
  monday.setDate(today.getDate() - mondayOffset)

  const buckets = bucketByDay(entries, targetMl)
  const sumRange = (start: Date, end: Date): number => {
    let sum = 0
    for (const bucket of buckets.values()) {
      if (bucket.date >= start && bucket.date < end) sum += bucket.totalMl
    }
    return sum
  }

  const todayMl = sumRange(today, new Date(today.getTime() + DAY_MS))
  const thisWeekMl = sumRange(monday, new Date(today.getTime() + DAY_MS))
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
  const thisMonthMl = sumRange(monthStart, nextMonth)

  const averageGlassMl = entries.length
    ? Math.floor(entries.reduce((sum, entry) => sum + entry.amountMl, 0) / entries.length)
    : 0

  const counts = new Map<string, number>()
  for (const entry of entries) {
    counts.set(entry.beverage, (counts.get(entry.beverage) ?? 0) + 1)
  }
  let mostLoggedBeverage: string | null = null
  let mostLoggedCount = 0
  for (const [beverage, count] of counts) {
    if (count > mostLoggedCount) {
      mostLoggedCount = count
      mostLoggedBeverage = beverage
    }
  }

  const lastSevenDaysMl: number[] = []
  const weekLabels: string[] = []
  for (let i = 6; i >= 0; i--) {
    const day = new Date(today)
    day.setDate(day.getDate() - i)
    lastSevenDaysMl.push(sumRange(day, new Date(day.getTime() + DAY_MS)))
    weekLabels.push(day.toLocaleString('en', { weekday: 'short' }))
  }

  return {
    todayMl,
    thisWeekMl,
    thisMonthMl,
    averageGlassMl,
    mostLoggedBeverage,
    lastSevenDaysMl,
    weekLabels,
    streak: calculateStreak(entries, targetMl, now),
    freezes: calculateFreezes(entries, targetMl, now),
    score: hydrationScore(entries, targetMl, now),
    achievements: evaluateAchievements(entries, targetMl, now),
    challenges: evaluateChallenges(entries, targetMl, now),
  }
}

export interface StreakSummary {
  current: number
  best: number
  goalHitToday: boolean
  lastDaysHit: boolean[]
}

/** Earliest logged day among entries, falling back to today when empty. */
export function earliestEntryDay(entries: IntakeEntry[], now: Date): Date {
  if (entries.length === 0) return startOfDay(now)
  let earliest = new Date(entries[0].loggedAt)
  for (const entry of entries) {
    const at = new Date(entry.loggedAt)
    if (at < earliest) earliest = at
  }
  return startOfDay(earliest)
}

/**
 * Goal-met flags for every day from the earliest entry to today (inclusive),
 * oldest → newest. Drives streaks, freezes, score regularity, and the
 * sparkline.
 */
export function allDayFlags(
  entries: IntakeEntry[],
  targetMl: number,
  now: Date,
): boolean[] {
  const buckets = bucketByDay(entries, targetMl)
  const first = earliestEntryDay(entries, now)
  const today = startOfDay(now)
  const flags: boolean[] = []
  for (let day = new Date(first); day <= today; day.setDate(day.getDate() + 1)) {
    flags.push(buckets.get(formatDayKey(day))?.metGoal ?? false)
  }
  return flags
}

/**
 * Streak over *effective* intake. `current` is anchored at today when the goal
 * is met, else yesterday (a pending today never breaks the run); `best` scans
 * the whole history; `lastDaysHit` covers the trailing sparkline window
 * (oldest → newest, ending today).
 */
export function calculateStreak(
  entries: IntakeEntry[],
  targetMl: number,
  now: Date,
  sparkDays = 14,
): StreakSummary {
  const flags = allDayFlags(entries, targetMl, now)

  let best = 0
  let run = 0
  for (let i = flags.length - 1; i >= 0; i--) {
    run = flags[i] ? run + 1 : 0
    best = Math.max(best, run)
  }

  const goalHitToday = flags[flags.length - 1]
  const anchorIndex = goalHitToday ? flags.length - 1 : flags.length - 2
  let current = 0
  for (let i = anchorIndex; i >= 0; i--) {
    if (!flags[i]) break
    current++
  }

  const lastDaysHit: boolean[] = []
  for (let i = sparkDays - 1; i >= 0; i--) {
    const index = flags.length - 1 - i
    lastDaysHit.push(index >= 0 ? flags[index] : false)
  }
  return { current, best, goalHitToday, lastDaysHit }
}

/** goal-hit flags for the last N days (oldest → newest), *including* today. */
export function hitFlags(entries: IntakeEntry[], targetMl: number, now: Date, days: number): boolean[] {
  const buckets = bucketByDay(entries, targetMl)
  const flags: boolean[] = []
  const today = startOfDay(now)
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(today)
    day.setDate(day.getDate() - i)
    flags.push(buckets.get(formatDayKey(day))?.metGoal ?? false)
  }
  return flags
}

export interface FrozenStreakSummary {
  current: number
  best: number
  bank: number
  sparkDays: number
  lastDaysHit: boolean[]
  lastDaysFrozen: boolean[]
}

/**
 * Freeze-aware streak: a goal-hit day banks a freeze (capped); a missed day
 * spends one instead of breaking the run. A missed day with empty bank resets
 * the run *and* the bank. A pending today never spends a freeze.
 */
export function calculateFreezes(
  entries: IntakeEntry[],
  targetMl: number,
  now: Date,
  freezeCap = 3,
  sparkDays = 14,
): FrozenStreakSummary {
  const buckets = bucketByDay(entries, targetMl)
  const today = startOfDay(now)
  const anchor = (buckets.get(formatDayKey(today))?.metGoal ?? false)
    ? today
    : (() => {
        const day = new Date(today)
        day.setDate(day.getDate() - 1)
        return day
      })()

  const first = earliestEntryDay(entries, now)
  const lastDaysHit = new Array<boolean>(sparkDays).fill(false)
  const lastDaysFrozen = new Array<boolean>(sparkDays).fill(false)
  const sparkStart = new Date(today)
  sparkStart.setDate(sparkStart.getDate() - (sparkDays - 1))

  if (entries.length === 0) {
    return { current: 0, best: 0, bank: 0, sparkDays, lastDaysHit, lastDaysFrozen }
  }

  let run = 0
  let best = 0
  let bank = 0
  for (let day = new Date(first); day <= anchor; day.setDate(day.getDate() + 1)) {
    let frozen = false
    const met = buckets.get(formatDayKey(day))?.metGoal ?? false
    if (met) {
      run += 1
      best = Math.max(best, run)
      bank = Math.min(bank + 1, freezeCap)
    } else if (bank > 0) {
      bank -= 1
      run += 1
      best = Math.max(best, run)
      frozen = true
    } else {
      run = 0
      bank = 0
    }
    const offset = Math.round((day.getTime() - sparkStart.getTime()) / DAY_MS)
    if (offset >= 0 && offset < sparkDays) {
      lastDaysHit[offset] = met
      lastDaysFrozen[offset] = frozen
    }
  }

  return { current: run, best, bank, sparkDays, lastDaysHit, lastDaysFrozen }
}

export function hydrationScore(entries: IntakeEntry[], targetMl: number, now: Date): number {
  const progress = progressFor(entries, targetMl, now).ratio
  let regularity = 0
  const flags = hitFlags(entries, targetMl, now, 7)
  regularity = flags.filter(Boolean).length / 7
  return Math.min(100, Math.max(0, Math.round((0.6 * progress + 0.4 * regularity) * 100)))
}

export type AchievementId =
  | 'firstLiter'
  | 'firstGoalDay'
  | 'weekStreak'
  | 'monthStreak'
  | 'caffeineFreeDay'

export interface Achievement {
  id: AchievementId
  title: string
  unlockedAt: string
}

export function evaluateAchievements(
  entries: IntakeEntry[],
  targetMl: number,
  now: Date,
): Achievement[] {
  if (entries.length === 0) return []
  const buckets = [...bucketByDay(entries, targetMl).values()]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
  const today = startOfDay(now)

  const awarded = new Set<AchievementId>()
  const unlocked: Achievement[] = []
  const awardIf = (id: AchievementId, title: string, condition: boolean, day: Date): void => {
    if (!condition || awarded.has(id)) return
    awarded.add(id)
    unlocked.push({ id, title, unlockedAt: day.toISOString() })
  }

  const caffeineTotal = (day: Date): number => {
    const end = new Date(day)
    end.setDate(end.getDate() + 1)
    let sum = 0
    for (const bucket of buckets) if (bucket.date >= day && bucket.date < end) sum += bucket.caffeineTotal
    return sum
  }

  let run = 0
  const first = earliestEntryDay(entries, now)
  for (let day = new Date(first); day <= today; day.setDate(day.getDate() + 1)) {
    const key = formatDayKey(day)
    const bucket = buckets.find((b) => formatDayKey(b.date) === key)
    const effective = bucket?.totalMl ?? 0
    const dayMet = bucket?.metGoal ?? false
    const caffeineFreeDay = !bucket || caffeineTotal(day) === 0

    run = dayMet ? run + 1 : 0
    awardIf('firstLiter', 'First liter', effective >= 1000, day)
    awardIf('firstGoalDay', 'Goal-getter', dayMet, day)
    awardIf('weekStreak', '7-day streak', run === 7, day)
    awardIf('monthStreak', '30-day streak', run === 30, day)
    awardIf('caffeineFreeDay', 'Pure day', dayMet && caffeineFreeDay, day)
  }

  return unlocked.sort((a, b) => a.unlockedAt.localeCompare(b.unlockedAt))
}

let idCounter = 0

/** id built like the native repo: microsecond timestamp + per-session counter. */
const makeId = (now: Date): string => {
  idCounter += 1
  return `${now.getTime() * 1000 + idCounter}-${idCounter}`
}

export type ChallengeId = 'weekendWarrior' | 'perfectWeek'

export interface ChallengeResult {
  id: ChallengeId
  title: string
  earned: boolean
}

const CHALLENGE_TITLES: Record<ChallengeId, string> = {
  weekendWarrior: 'Weekend warrior',
  perfectWeek: 'Perfect week',
}

/**
 * Evaluates light challenges against the history:
 * - weekendWarrior: the latest fully-elapsed weekend (Sat + Sun) both meet the goal.
 * - perfectWeek: the latest fully-elapsed calendar week (Mon–Sun, Sunday
 *   strictly before today) meets the goal every day.
 */
export function evaluateChallenges(
  entries: IntakeEntry[],
  targetMl: number,
  now: Date,
): ChallengeResult[] {
  const buckets = bucketByDay(entries, targetMl)
  const metKey = (day: Date): boolean => {
    const end = new Date(day)
    end.setDate(end.getDate() + 1)
    for (const bucket of buckets.values()) {
      if (bucket.date >= day && bucket.date < end) return bucket.metGoal
    }
    return false
  }

  const today = startOfDay(now)
  const latestSunday = ((): Date => {
    const day = new Date(today)
    day.setDate(day.getDate() - 1)
    while (day.getDay() !== 0) day.setDate(day.getDate() - 1)
    return day
  })()
  const weekendSat = new Date(latestSunday)
  weekendSat.setDate(weekendSat.getDate() - 1)
  const weekendEarned = metKey(weekendSat) && metKey(latestSunday)

  let perfectWeekEarned = false
  const weekStart = new Date(latestSunday)
  weekStart.setDate(weekStart.getDate() - 6)
  const weekEnd = new Date(latestSunday)
  for (let i = 0; i < 8 && !perfectWeekEarned; i++) {
    let allMet = true
    for (let day = new Date(weekStart); day <= weekEnd; day.setDate(day.getDate() + 1)) {
      if (!metKey(day)) {
        allMet = false
        break
      }
    }
    perfectWeekEarned = allMet
    if (!allMet) {
      weekStart.setDate(weekStart.getDate() - 7)
      weekEnd.setDate(weekEnd.getDate() - 7)
    }
  }

  return [
    { id: 'weekendWarrior', title: CHALLENGE_TITLES.weekendWarrior, earned: weekendEarned },
    { id: 'perfectWeek', title: CHALLENGE_TITLES.perfectWeek, earned: perfectWeekEarned },
  ]
}

export interface ReminderDecision {
  shouldRemind: boolean
  deficitMl: number
  reason: string
}

export function smartReminderPolicy(
  now: Date,
  consumedMl: number,
  targetMl: number,
  wakeHour = 8,
  sleepHour = 23,
  deficitThresholdMl = 50,
): ReminderDecision {
  const hours = now.getHours() + now.getMinutes() / 60
  if (hours < wakeHour || hours >= sleepHour) {
    return { shouldRemind: false, deficitMl: 0, reason: 'Out of window' }
  }
  if (consumedMl >= targetMl) {
    return { shouldRemind: false, deficitMl: 0, reason: 'Goal already reached' }
  }
  const windowHours = sleepHour - wakeHour
  const elapsed = hours - wakeHour
  const expected = (targetMl * elapsed) / windowHours
  const deficit = Math.round(expected - consumedMl)
  if (deficit < deficitThresholdMl) {
    return { shouldRemind: false, deficitMl: deficit, reason: 'Not behind' }
  }
  return { shouldRemind: true, deficitMl: deficit, reason: 'Behind' }
}

export function entriesCsv(entries: IntakeEntry[]): string {
  const sorted = [...entries].sort((a, b) => a.loggedAt.localeCompare(b.loggedAt))
  const rows = sorted.map((entry) => {
    const date = new Date(entry.loggedAt)
    const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`
    return `${day},${time},${entry.beverage},${entry.amountMl},${effectiveMl(entry.beverage, entry.amountMl)},${caffeineMg(entry.beverage, entry.amountMl)}`
  })
  return ['date,time,beverage,amount_ml,effective_ml,caffeine_mg', ...rows].join('\n')
}

export function shareSummary(
  now: Date,
  insights: Insights,
  targetMl: number,
): string {
  const score = insights.score
  const day = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const pct = Math.round((insights.todayMl / targetMl) * 100)
  const most = insights.mostLoggedBeverage
    ? beverageLabel(insights.mostLoggedBeverage)
    : '—'
  return [
    `Hydration summary — ${day}`,
    `Today: ${insights.todayMl} / ${targetMl} ml (${pct}%)`,
    `Score: ${score}/100`,
    `Streak: ${insights.streak.current} day(s) · best ${insights.streak.best}`,
    `This week: ${insights.thisWeekMl} ml`,
    `Most logged: ${most}`,
  ].join('\n')
}

export const DEFAULT_TARGET_ML = 2000
export const DEFAULT_QUICK_ML = 250

const ENTRIES_KEY = 'hydration.v1.entries'
const TARGET_KEY = 'hydration.v1.target'
const GOAL_KEY = 'hydration.v1.goal'

export const loadEntries = (): IntakeEntry[] => {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const saveEntries = (entries: IntakeEntry[]): void => {
  try {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries))
  } catch {
    // ignore storage failures
  }
}

export interface PersistedTarget {
  targetMl: number
  unit: VolumeUnit
}

export const loadTarget = (): PersistedTarget => {
  try {
    const raw = localStorage.getItem(TARGET_KEY)
    if (!raw) return { targetMl: DEFAULT_TARGET_ML, unit: 'ml' }
    const parsed = JSON.parse(raw) as PersistedTarget
    return { targetMl: parsed.targetMl || DEFAULT_TARGET_ML, unit: parsed.unit ?? 'ml' }
  } catch {
    return { targetMl: DEFAULT_TARGET_ML, unit: 'ml' }
  }
}

export const saveTarget = (target: PersistedTarget): void => {
  try {
    localStorage.setItem(TARGET_KEY, JSON.stringify(target))
  } catch {
    // ignore storage failures
  }
}

type GoalShape = Partial<UserGoal>

export const loadUserGoal = (): UserGoal | null => {
  try {
    const raw = localStorage.getItem(GOAL_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as GoalShape
    if (typeof parsed.weightKg !== 'number' || typeof parsed.age !== 'number') return null
    return {
      weightKg: parsed.weightKg,
      age: parsed.age,
      activityLevel: parsed.activityLevel ?? 'sedentary',
    }
  } catch {
    return null
  }
}

export const saveUserGoal = (goal: UserGoal): void => {
  try {
    localStorage.setItem(GOAL_KEY, JSON.stringify(goal))
  } catch {
    // ignore storage failures
  }
}

export const STORAGE_KEYS = { ENTRIES_KEY, TARGET_KEY, GOAL_KEY }

/**
 * Build a fresh entry. Ids follow the native repo scheme
 * (`{now µs}-{counter}`) — unique per session, not real UUIDs.
 */
export function newEntry(
  amountMl: number,
  beverage: string,
  when: Date = new Date(),
): IntakeEntry {
  const id = makeId(when)
  return {
    id,
    amountMl,
    beverage,
    loggedAt: when.toISOString(),
    createdAt: when.toISOString(),
    updatedAt: when.toISOString(),
  }
}

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Mostly sitting',
  light: 'Light activity',
  moderate: 'Moderate activity',
  active: 'Very active',
}

export type ActivityEntry = { value: ActivityLevel; label: string }

export const ACTIVITY_OPTIONS: ActivityEntry[] = (Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map(
  (value) => ({ value, label: ACTIVITY_LABELS[value] }),
)