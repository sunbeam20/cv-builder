import { describe, expect, it, beforeEach } from 'vitest'
import { resolveView, navigate, routeToHash } from './routes'

describe('resolveView', () => {
  beforeEach(() => {
    window.location.hash = ''
  })

  it('treats an empty hash on the hub as the home page', () => {
    expect(resolveView('', 'example.com').kind).toBe('home')
    expect(resolveView('#', 'example.com').kind).toBe('home')
    expect(resolveView('#/', 'example.com').kind).toBe('home')
  })

  it('maps the cv-builder path to the app on the hub domain', () => {
    expect(resolveView('#/cv-builder', 'example.com')).toEqual({ kind: 'app', tool: expect.any(Object) })
  })

  it('is case-insensitive on the path', () => {
    expect(resolveView('#/CV-Builder', 'example.com').kind).toBe('app')
  })

  it('falls back to home for unknown paths', () => {
    expect(resolveView('#/banner-maker', 'example.com').kind).toBe('home')
    expect(resolveView('#/foo/bar', 'example.com').kind).toBe('home')
  })

  it('always boots a tool on its own subdomain regardless of the hash', () => {
    const view = resolveView('#/', 'cv.example.com')
    expect(view.kind).toBe('app')
    if (view.kind === 'app') expect(view.tool.slug).toBe('cv')
  })

  it('treats unknown subdomains as the hub', () => {
    expect(resolveView('#/', 'unknown.example.com').kind).toBe('home')
  })
})

describe('routeToHash / navigate', () => {
  beforeEach(() => {
    window.location.hash = '#/'
  })

  it('converts routes to canonical hashes', () => {
    expect(routeToHash('home')).toBe('#/')
    expect(routeToHash('app')).toBe('#/cv-builder')
  })

  it('navigates by setting the hash', () => {
    navigate('app')
    expect(window.location.hash).toBe('#/cv-builder')
    navigate('home')
    expect(window.location.hash).toBe('#/')
  })
})