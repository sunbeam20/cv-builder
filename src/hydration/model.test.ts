import { describe, expect, it } from 'vitest'
import {
  beverageLabel,
  bucketByDay,
  caffeineMg,
  calculateFreezes,
  calculateStreak,
  effectiveMl,
  entriesCsv,
  evaluateAchievements,
  evaluateChallenges,
  formatVolume,
  goalCalculator,
  hitFlags,
  hydrationScore,
  insightsFor,
  newEntry,
  shareSummary,
  smartReminderPolicy,
  STORAGE_KEYS,
  type IntakeEntry,
} from './model'
import type { AchievementId } from './model'

// Tuesday 2026-09-22, 10:00 — mirrors the native test fixture.
const NOW = new Date(2026, 8, 22, 10)

const at = (year: number, month: number, day: number, hour = 8): Date =>
  new Date(year, month - 1, day, hour)

function entry(day: number, amountMl = 1000, beverage = 'water', hour = 8): IntakeEntry {
  return newEntry(amountMl, beverage, at(2026, 9, day, hour))
}

function twoLiters(day: number): IntakeEntry[] {
  return [entry(day, 1000, 'water', 8), entry(day, 1000, 'water', 12)]
}

function fullDay(day: number): IntakeEntry[] {
  return twoLiters(day)
}

describe('BeverageType', () => {
  it('computes effective ml from the hydration factor', () => {
    expect(effectiveMl('water', 250)).toBe(250)
    expect(effectiveMl('coffee', 250)).toBe(225)
    expect(effectiveMl('soda', 250)).toBe(200)
  })

  it('computes caffeine from mg per litre', () => {
    expect(caffeineMg('coffee', 250)).toBe(100)
    expect(caffeineMg('water', 1000)).toBe(0)
    expect(caffeineMg('soda', 500)).toBe(45)
  })

  it('provides a label for every beverage', () => {
    expect(beverageLabel('sports')).toBe('Sports drink')
    expect(beverageLabel('water')).toBe('Water')
  })
})

describe('formatVolume', () => {
  it('renders millilitres as integers', () => {
    expect(formatVolume(250, 'ml')).toBe('250 ml')
  })

  it('renders litres, trimming trailing zeros', () => {
    expect(formatVolume(250, 'L')).toBe('0.25 L')
    expect(formatVolume(1000, 'L')).toBe('1 L')
  })

  it('renders ounces with one decimal', () => {
    expect(formatVolume(250, 'oz')).toBe('8.5 oz')
  })
})

describe('goalCalculator', () => {
  it('recommends ~33 ml per kg rounded to 10', () => {
    expect(goalCalculator(70, 30, 'sedentary', 'mild').recommendedMl).toBe(2310)
  })

  it('lowers the baseline for age 65+', () => {
    const young = goalCalculator(70, 34, 'sedentary', 'mild').recommendedMl
    const senior = goalCalculator(70, 66, 'sedentary', 'mild').recommendedMl
    expect(senior).toBe(2080)
    expect(senior).toBeLessThan(young)
  })

  it('raises the baseline for activity and heat', () => {
    const mild = goalCalculator(80, 30, 'light', 'mild').recommendedMl
    const hot = goalCalculator(80, 30, 'light', 'hot').recommendedMl
    expect(hot).toBeGreaterThan(mild)
    expect(goalCalculator(70, 30, 'moderate', 'mild').recommendedMl).toBe(2540)
  })

  it('clamps to the 1000–4000 window', () => {
    expect(goalCalculator(20, 30, 'sedentary', 'mild').recommendedMl).toBe(1000)
    expect(goalCalculator(200, 30, 'active', 'hot').recommendedMl).toBe(4000)
  })

  it('rejects invalid profiles', () => {
    expect(() => goalCalculator(0, 30, 'sedentary', 'mild')).toThrow()
    expect(() => goalCalculator(70, -1, 'sedentary', 'mild')).toThrow()
  })
})

describe('hydrationScore', () => {
  it('scores zero with no history', () => {
    expect(hydrationScore([], 2000, NOW)).toBe(0)
  })

  it('scores 100 for a full today and perfect week', () => {
    const days = [16, 17, 18, 19, 20, 21, 22].flatMap(twoLiters)
    expect(hydrationScore(days, 2000, NOW)).toBe(100)
  })

  it('scores 30 for half a goal today and no history', () => {
    expect(hydrationScore([entry(22, 1000)], 2000, NOW)).toBe(30)
  })

  it('scores 34 when six of seven trailing days met but today empty', () => {
    const days = [16, 17, 18, 19, 20, 21].flatMap(twoLiters)
    expect(hydrationScore(days, 2000, NOW)).toBe(34)
  })

  it('clamps over-target progress at 1', () => {
    expect(hydrationScore([entry(22, 5000)], 2000, NOW)).toBe(66)
  })
})

describe('calculateStreak', () => {
  it('yields a zero streak and all-missed sparkline for an empty log', () => {
    const summary = calculateStreak([], 2000, NOW)
    expect(summary.current).toBe(0)
    expect(summary.best).toBe(0)
    expect(summary.goalHitToday).toBe(false)
    expect(summary.lastDaysHit).toHaveLength(14)
    expect(summary.lastDaysHit.every((hit) => !hit)).toBe(true)
  })

  it('counts a single met day even when today is pending', () => {
    const summary = calculateStreak(twoLiters(21), 2000, NOW)
    expect(summary.current).toBe(1)
    expect(summary.best).toBe(1)
  })

  it('a gap resets the current streak but keeps the best', () => {
    const summary = calculateStreak(
      [...twoLiters(18), ...twoLiters(19), ...twoLiters(21)],
      2000,
      NOW,
    )
    expect(summary.current).toBe(1)
    expect(summary.best).toBe(2)
  })

  it('extends the streak through today when the goal is met', () => {
    const summary = calculateStreak([...twoLiters(21), ...twoLiters(22)], 2000, NOW)
    expect(summary.current).toBe(2)
    expect(summary.goalHitToday).toBe(true)
  })

  it('reflects the trailing 14 days oldest-first in the sparkline', () => {
    const summary = calculateStreak([...twoLiters(9), ...twoLiters(10), ...twoLiters(22)], 2000, NOW)
    expect(summary.lastDaysHit).toHaveLength(14)
    expect(summary.lastDaysHit[0]).toBe(true)
    expect(summary.lastDaysHit[1]).toBe(true)
    expect(summary.lastDaysHit[2]).toBe(false)
    expect(summary.lastDaysHit[13]).toBe(true)
  })
})

describe('calculateFreezes', () => {
  it('banks goal days up to the freeze cap', () => {
    const summary = calculateFreezes([19, 20, 21].flatMap(twoLiters), 2000, NOW)
    expect(summary.current).toBe(3)
    expect(summary.best).toBe(3)
    expect(summary.bank).toBe(3)
    expect(summary.lastDaysFrozen.every((frozen) => !frozen)).toBe(true)
  })

  it('spends a freeze instead of breaking the run', () => {
    const summary = calculateFreezes([19, 20].flatMap(twoLiters), 2000, NOW)
    expect(summary.current).toBe(3)
    expect(summary.best).toBe(3)
    expect(summary.bank).toBe(1)
    expect(summary.lastDaysHit[12]).toBe(false)
    expect(summary.lastDaysFrozen[12]).toBe(true)
  })

  it('a missed day with no freeze breaks the run and resets the bank', () => {
    const summary = calculateFreezes(
      [...fullDay(17), ...fullDay(20), ...fullDay(21)],
      2000,
      NOW,
    )
    expect(summary.current).toBe(2)
    expect(summary.best).toBe(2)
    expect(summary.bank).toBe(2)
  })

  it('a pending today never spends a freeze', () => {
    const summary = calculateFreezes([19, 20, 21].flatMap(twoLiters), 2000, NOW)
    expect(summary.lastDaysHit[13]).toBe(false)
    expect(summary.lastDaysFrozen[13]).toBe(false)
    expect(summary.bank).toBe(3)
  })

  it('good days spark; freeze days show as frozen in the window', () => {
    const summary = calculateFreezes([...twoLiters(9), ...twoLiters(10)], 2000, NOW)
    expect(summary.lastDaysHit[0]).toBe(true)
    expect(summary.lastDaysHit[1]).toBe(true)
    expect(summary.lastDaysHit[2]).toBe(false)
    expect(summary.lastDaysFrozen[2]).toBe(true)
    expect(summary.lastDaysFrozen[3]).toBe(true)
  })
})

describe('evaluateAchievements', () => {
  const earned = (entries: IntakeEntry[], id: AchievementId): boolean =>
    evaluateAchievements(entries, 2000, NOW).some((achievement) => achievement.id === id)

  it('unlocks nothing for an empty log', () => {
    expect(evaluateAchievements([], 2000, NOW)).toHaveLength(0)
  })

  it('a first full water day unlocks liter, goal, and pure day', () => {
    const result = evaluateAchievements(fullDay(21), 2000, NOW)
    expect(result.some((a) => a.id === 'firstLiter')).toBe(true)
    expect(result.some((a) => a.id === 'firstGoalDay')).toBe(true)
    expect(result.some((a) => a.id === 'caffeineFreeDay')).toBe(true)
    expect(result.every((a) => new Date(a.unlockedAt).getDate() === 21)).toBe(true)
  })

  it('unlocks the 7-day streak on the seventh met day', () => {
    const days = Array.from({ length: 7 }, (_, i) => 10 + i).flatMap(twoLiters)
    const streak = evaluateAchievements(days, 2000, NOW).find((a) => a.id === 'weekStreak')
    expect(streak).toBeDefined()
    expect(new Date(streak!.unlockedAt).getDate()).toBe(16)
  })

  it('unlocks the 30-day streak after a month of met days', () => {
    const days: IntakeEntry[] = []
    for (let d = 29; d >= 0; d--) {
      const date = new Date(2026, 8, 22, 8)
      date.setDate(22 - d)
      days.push(
        newEntry(1000, 'water', new Date(date.getFullYear(), date.getMonth(), date.getDate(), 8)),
        newEntry(1000, 'water', new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12)),
      )
    }
    expect(earned(days, 'monthStreak')).toBe(true)
  })

  it('a caffeinated day does not unlock pure day', () => {
    expect(earned([entry(21, 2500, 'coffee')], 'caffeineFreeDay')).toBe(false)
    expect(earned([entry(21, 2500, 'coffee')], 'firstLiter')).toBe(true)
    expect(earned([entry(21, 2500, 'coffee')], 'firstGoalDay')).toBe(true)
  })
})

describe('evaluateChallenges', () => {
  const warrior = (entries: IntakeEntry[]): boolean =>
    evaluateChallenges(entries, 2000, NOW)[0].earned

  it('earns neither challenge with no history', () => {
    expect(evaluateChallenges([], 2000, NOW).every((result) => !result.earned)).toBe(true)
  })

  it('weekend warrior needs both days of the latest completed weekend', () => {
    expect(warrior([...fullDay(19)])).toBe(false)
    expect(warrior([...fullDay(19), ...fullDay(20)])).toBe(true)
  })

  it('a missed Sunday blocks weekend warrior', () => {
    const days = [14, 15, 16, 17, 18, 19].flatMap(twoLiters)
    expect(warrior(days)).toBe(false)
  })

  it('perfect week requires every day of a completed week', () => {
    const partial = Array.from({ length: 6 }, (_, i) => 14 + i).flatMap(twoLiters)
    expect(evaluateChallenges(partial, 2000, NOW)[1].earned).toBe(false)

    const full = Array.from({ length: 7 }, (_, i) => 14 + i).flatMap(twoLiters)
    const results = evaluateChallenges(full, 2000, NOW)
    expect(results[1].earned).toBe(true)
    expect(results[0].earned).toBe(true)
  })

  it('an older perfect week still counts when the latest is broken', () => {
    const older = [7, 8, 9, 10, 11, 12, 13].flatMap(twoLiters)
    const results = evaluateChallenges(older, 2000, NOW)
    expect(results[1].earned).toBe(true)
    expect(results[0].earned).toBe(false)
  })
})

describe('smartReminderPolicy', () => {
  it('is quiet outside the wake window', () => {
    expect(smartReminderPolicy(new Date(2026, 8, 22, 7), 0, 2000).shouldRemind).toBe(false)
    expect(smartReminderPolicy(new Date(2026, 8, 22, 23, 30), 0, 2000).shouldRemind).toBe(false)
  })

  it('is quiet once the goal is reached', () => {
    const decision = smartReminderPolicy(new Date(2026, 8, 22, 15), 2000, 2000)
    expect(decision.shouldRemind).toBe(false)
    expect(decision.reason).toBe('Goal already reached')
  })

  it('estimates the deficit against elapsed window time', () => {
    // 08:00–23:00 is 15h; at 15:00 (7h elapsed) expected for 2400 ml = 1120.
    const decision = smartReminderPolicy(new Date(2026, 8, 22, 15), 100, 2400)
    expect(decision.shouldRemind).toBe(true)
    expect(decision.deficitMl).toBe(1020)
  })

  it('ignores a small deficit under the threshold', () => {
    expect(smartReminderPolicy(new Date(2026, 8, 22, 9), 180, 2000).shouldRemind).toBe(false)
  })
})

describe('insightsFor', () => {
  it('yields zeroed, safe defaults for empty history', () => {
    const insights = insightsFor([], 2000, NOW)
    expect(insights.todayMl).toBe(0)
    expect(insights.thisWeekMl).toBe(0)
    expect(insights.thisMonthMl).toBe(0)
    expect(insights.averageGlassMl).toBe(0)
    expect(insights.mostLoggedBeverage).toBeNull()
    expect(insights.lastSevenDaysMl).toEqual([0, 0, 0, 0, 0, 0, 0])
  })

  it('aggregates effective volumes across the day window', () => {
    const insights = insightsFor(
      [
        newEntry(250, 'coffee', new Date(2026, 8, 22, 8)),
        newEntry(250, 'coffee', new Date(2026, 8, 22, 12)),
        newEntry(250, 'water', new Date(2026, 8, 22, 15)),
      ],
      2000,
      NOW,
    )
    expect(insights.todayMl).toBe(700)
    expect(insights.thisWeekMl).toBe(700)
    expect(insights.thisMonthMl).toBe(700)
  })

  it('excludes Sunday from this week but keeps it in the month', () => {
    const insights = insightsFor(
      [
        newEntry(250, 'water', new Date(2026, 8, 20, 9)),
        newEntry(250, 'water', new Date(2026, 8, 20, 22)),
        newEntry(250, 'water', new Date(2026, 8, 21, 9)),
      ],
      2000,
      NOW,
    )
    expect(insights.thisWeekMl).toBe(250)
    expect(insights.thisMonthMl).toBe(750)
    expect(insights.todayMl).toBe(0)
  })

  it('excludes previous months', () => {
    const insights = insightsFor(
      [
        newEntry(250, 'water', new Date(2026, 7, 31, 23, 59)),
        newEntry(250, 'water', new Date(2026, 8, 1, 0, 1)),
      ],
      2000,
      NOW,
    )
    expect(insights.thisMonthMl).toBe(250)
  })

  it('average glass uses physical ml and rounds down', () => {
    const insights = insightsFor(
      [
        newEntry(250, 'water', new Date(2026, 8, 22, 8)),
        newEntry(250, 'water', new Date(2026, 8, 22, 9)),
        newEntry(500, 'water', new Date(2026, 8, 22, 14)),
      ],
      2000,
      NOW,
    )
    expect(insights.averageGlassMl).toBe(333)
  })

  it('most logged is the mode, first seen wins ties', () => {
    const insights = insightsFor(
      [
        newEntry(250, 'coffee', new Date(2026, 8, 22, 8)),
        newEntry(500, 'water', new Date(2026, 8, 22, 9)),
        newEntry(250, 'coffee', new Date(2026, 8, 22, 10)),
        newEntry(250, 'water', new Date(2026, 8, 22, 11)),
      ],
      2000,
      NOW,
    )
    expect(insights.mostLoggedBeverage).toBe('coffee')
  })

  it('last seven days are oldest-first daily effective totals', () => {
    const insights = insightsFor(
      [
        newEntry(250, 'water', new Date(2026, 8, 16, 8)),
        newEntry(250, 'water', new Date(2026, 8, 21, 9)),
        newEntry(250, 'water', new Date(2026, 8, 22, 8)),
        newEntry(250, 'water', new Date(2026, 8, 22, 8, 30)),
      ],
      2000,
      NOW,
    )
    expect(insights.lastSevenDaysMl).toEqual([250, 0, 0, 0, 0, 250, 500])
  })

  it('computes score, streak, freezes, achievements, and challenges', () => {
    const insights = insightsFor([21, 20, 19].flatMap(twoLiters), 2000, NOW)
    expect(insights.streak.current).toBeGreaterThan(0)
    expect(insights.freezes.bank).toBeGreaterThan(0)
    expect(insights.achievements.length).toBeGreaterThan(0)
    expect(insights.challenges).toHaveLength(2)
  })
})

describe('hitFlags helper', () => {
  it('flags goal-met days for the trailing window', () => {
    const flags = hitFlags([...twoLiters(21)], 2000, NOW, 7)
    expect(flags).toHaveLength(7)
    expect(flags[5]).toBe(true)
    expect(flags[6]).toBe(false)
  })
})

describe('bucketByDay', () => {
  it('groups entries into calendar days with effective totals', () => {
    const buckets = bucketByDay(
      [
        newEntry(250, 'coffee', new Date(2026, 8, 22, 8)),
        newEntry(250, 'water', new Date(2026, 8, 22, 9)),
      ],
      2000,
    )
    const day = [...buckets.values()][0]
    expect(day.totalMl).toBe(475)
    expect(day.metGoal).toBe(false)
  })
})

describe('export services', () => {
  it('builds a CSV with a header and chronological rows', () => {
    const csv = entriesCsv([newEntry(250, 'water', new Date(2026, 8, 22, 9))])
    expect(csv.split('\n')[0]).toBe('date,time,beverage,amount_ml,effective_ml,caffeine_mg')
    expect(csv).toContain('2026-09-22,09:00,water,250,250,0')
  })

  it('builds a share summary line', () => {
    const insights = insightsFor([21, 22].flatMap(twoLiters), 2000, NOW)
    const summary = shareSummary(NOW, insights, 2000)
    expect(summary).toContain('Hydration summary — 2026-09-22')
    expect(summary).toContain('Today: 2000 / 2000 ml (100%)')
    expect(summary).toContain('Score: 71/100')
    expect(summary).toContain('This week:')
    expect(summary).toContain('Most logged: Water')
  })

  it('exposes stable storage keys', () => {
    expect(STORAGE_KEYS.ENTRIES_KEY).toBe('hydration.v1.entries')
    expect(STORAGE_KEYS.TARGET_KEY).toBe('hydration.v1.target')
    expect(STORAGE_KEYS.GOAL_KEY).toBe('hydration.v1.goal')
  })
})