import { describe, expect, it } from 'vitest'
import {
  CATEGORIES,
  CATEGORY_BY_ID,
  TOOLS,
  TOOL_BY_ID,
  TOOL_BY_ROUTE,
  TOOL_BY_SLUG,
  LIVE_TOOLS,
  searchTools,
  toolsByCategory,
} from './tools'
import { TOOL_VIEWS } from './toolViews'

describe('tool registry', () => {
  it('has unique ids and slugs', () => {
    expect(new Set(TOOLS.map((t) => t.id)).size).toBe(TOOLS.length)
    expect(new Set(TOOLS.map((t) => t.slug)).size).toBe(TOOLS.length)
  })

  it('assigns every tool to a known category', () => {
    for (const tool of TOOLS) {
      expect(CATEGORY_BY_ID.get(tool.category)).toBeDefined()
    }
    expect(new Set(CATEGORIES.map((c) => c.id)).size).toBe(CATEGORIES.length)
  })

  it('groups every tool exactly once, dropping empty categories', () => {
    const groups = toolsByCategory()
    const grouped = groups.flatMap((group) => group.tools)
    expect(grouped).toHaveLength(TOOLS.length)
    expect(new Set(grouped.map((t) => t.id)).size).toBe(TOOLS.length)
    for (const group of groups) {
      expect(group.tools.length).toBeGreaterThan(0)
      for (const tool of group.tools) expect(tool.category).toBe(group.category.id)
    }
  })

  it('indexes every tool by id and slug', () => {
    for (const tool of TOOLS) {
      expect(TOOL_BY_ID.get(tool.id)).toBe(tool)
      expect(TOOL_BY_SLUG.get(tool.slug)).toBe(tool)
    }
  })

  it('routes live tools through a normalized hash path', () => {
    for (const tool of LIVE_TOOLS) {
      expect(tool.route).not.toBe('')
      const key = tool.route.replace(/^#/, '').replace(/^\/+|\/+$/g, '').toLowerCase()
      expect(TOOL_BY_ROUTE.get(key)).toBe(tool)
    }
  })

  it('registers a view for every tool that is live', () => {
    for (const tool of LIVE_TOOLS) {
      expect(TOOL_VIEWS[tool.id]).toBeDefined()
    }
  })
})

describe('searchTools', () => {
  it('returns nothing for an empty query', () => {
    expect(searchTools('')).toEqual([])
    expect(searchTools('   ')).toEqual([])
  })

  it('matches on tool name, case-insensitively', () => {
    const ids = searchTools('password').map((t) => t.id)
    expect(ids).toContain('password-generator')
  })

  it('matches on category label', () => {
    const results = searchTools('finance')
    expect(results.length).toBeGreaterThan(0)
    expect(results.every((t) => t.category === 'finance')).toBe(true)
  })

  it('matches on tagline and slug', () => {
    expect(searchTools('hydrate').map((t) => t.id)).toContain('hydration-tracker')
    expect(searchTools('invoice').map((t) => t.id)).toContain('invoice-generator')
  })

  it('returns no matches for gibberish', () => {
    expect(searchTools('zzzzqqq')).toEqual([])
  })
})