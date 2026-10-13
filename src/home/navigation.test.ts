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

  it('opens the ATS scanner by its registered route', () => {
    openTool('ats')
    expect(window.location.hash).toBe('#/ats-scanner')
  })

  it('opens the Banner Maker by its registered route', () => {
    openTool('banner')
    expect(window.location.hash).toBe('#/banner-maker')
  })

  it('opens the Portfolio Page by its registered route', () => {
    openTool('portfolio')
    expect(window.location.hash).toBe('#/portfolio')
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