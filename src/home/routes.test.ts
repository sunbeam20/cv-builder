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

  it('maps the ats-scanner path to its tool on the hub domain', () => {
    const view = resolveView('#/ats-scanner', 'example.com')
    expect(view.kind).toBe('app')
    if (view.kind === 'app') expect(view.tool.slug).toBe('ats')
  })

  it('maps the banner-maker path to its tool on the hub domain', () => {
    const view = resolveView('#/banner-maker', 'example.com')
    expect(view.kind).toBe('app')
    if (view.kind === 'app') expect(view.tool.slug).toBe('banner')
  })

  it('maps the portfolio path to its tool on the hub domain', () => {
    const view = resolveView('#/portfolio', 'example.com')
    expect(view.kind).toBe('app')
    if (view.kind === 'app') expect(view.tool.slug).toBe('portfolio')
  })

  it('maps the hydrate path to its tool on the hub domain', () => {
    const view = resolveView('#/hydrate', 'example.com')
    expect(view.kind).toBe('app')
    if (view.kind === 'app') expect(view.tool.slug).toBe('hydrate')
  })

  it('maps the job-tracker path to its tool on the hub domain', () => {
    const view = resolveView('#/job-tracker', 'example.com')
    expect(view.kind).toBe('app')
    if (view.kind === 'app') expect(view.tool.slug).toBe('jobs')
  })

  it('maps the password path to its tool on the hub domain', () => {
    const view = resolveView('#/password', 'example.com')
    expect(view.kind).toBe('app')
    if (view.kind === 'app') expect(view.tool.slug).toBe('password')
  })

  it('maps the convert path to its tool on the hub domain', () => {
    const view = resolveView('#/convert', 'example.com')
    expect(view.kind).toBe('app')
    if (view.kind === 'app') expect(view.tool.slug).toBe('convert')
  })

  it('maps the text-diff path to its tool on the hub domain', () => {
    const view = resolveView('#/text-diff', 'example.com')
    expect(view.kind).toBe('app')
    if (view.kind === 'app') expect(view.tool.slug).toBe('diff')
  })

  it('maps the lorem path to its tool on the hub domain', () => {
    const view = resolveView('#/lorem', 'example.com')
    expect(view.kind).toBe('app')
    if (view.kind === 'app') expect(view.tool.slug).toBe('lorem')
  })

  it('maps the color-studio path to its tool on the hub domain', () => {
    const view = resolveView('#/color-studio', 'example.com')
    expect(view.kind).toBe('app')
    if (view.kind === 'app') expect(view.tool.slug).toBe('colors')
  })

  it('routes a shared portfolio payload to the viewer and keeps its case', () => {
    const view = resolveView('#/p/AbC-D_$xyz', 'example.com')
    expect(view.kind).toBe('portfolio')
    if (view.kind === 'portfolio') expect(view.payload).toBe('AbC-D_$xyz')
  })

  it('routes a shared portfolio payload even on tool subdomains', () => {
    expect(resolveView('#/p/somePayload', 'cv.example.com').kind).toBe('portfolio')
  })

  it('is case-insensitive on the path', () => {
    expect(resolveView('#/CV-Builder', 'example.com').kind).toBe('app')
  })

  it('falls back to home for unknown paths', () => {
    expect(resolveView('#/nope', 'example.com').kind).toBe('home')
    expect(resolveView('#/foo/bar', 'example.com').kind).toBe('home')
  })

  it('always boots a tool on its own subdomain regardless of the hash', () => {
    const view = resolveView('#/', 'cv.example.com')
    expect(view.kind).toBe('app')
    if (view.kind === 'app') expect(view.tool.slug).toBe('cv')
  })

  it('boots the hydration tracker on its own subdomain', () => {
    const view = resolveView('#/anything', 'hydrate.example.com')
    expect(view.kind).toBe('app')
    if (view.kind === 'app') expect(view.tool.slug).toBe('hydrate')
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