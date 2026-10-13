import { describe, expect, it, beforeEach } from 'vitest'
import { parseRoute, navigate, routeToHash } from './routes'

describe('parseRoute', () => {
  beforeEach(() => {
    window.location.hash = ''
  })

  it('treats an empty hash as the home page', () => {
    expect(parseRoute('')).toBe('home')
    expect(parseRoute('#')).toBe('home')
    expect(parseRoute('#/')).toBe('home')
  })

  it('maps the cv-builder path to the app', () => {
    expect(parseRoute('#/cv-builder')).toBe('app')
  })

  it('is case-insensitive on the path', () => {
    expect(parseRoute('#/CV-Builder')).toBe('app')
  })

  it('falls back to home for unknown paths', () => {
    expect(parseRoute('#/banner-maker')).toBe('home')
    expect(parseRoute('#/foo/bar')).toBe('home')
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