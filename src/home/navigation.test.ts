import { describe, expect, it, beforeEach } from 'vitest'
import { goHome, openTool } from './navigation'

describe('navigation (dev host)', () => {
  beforeEach(() => {
    window.location.hash = '#/'
  })

  it('opens a tool by its registered route in-page', () => {
    openTool('cv')
    expect(window.location.hash).toBe('#/cv-builder')
  })

  it('falls back to the default app route for unknown slugs', () => {
    openTool('does-not-exist')
    expect(window.location.hash).toBe('#/cv-builder')
  })

  it('goes home on the hub', () => {
    window.location.hash = '#/cv-builder'
    goHome()
    expect(window.location.hash).toBe('#/')
  })
})