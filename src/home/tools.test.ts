import { describe, expect, it } from 'vitest'
import { TOOLS, TOOL_BY_ID, TOOL_BY_ROUTE, TOOL_BY_SLUG, LIVE_TOOLS } from './tools'
import { TOOL_VIEWS } from './toolViews'

describe('tool registry', () => {
  it('has unique ids and slugs', () => {
    expect(new Set(TOOLS.map((t) => t.id)).size).toBe(TOOLS.length)
    expect(new Set(TOOLS.map((t) => t.slug)).size).toBe(TOOLS.length)
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