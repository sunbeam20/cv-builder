import { beforeEach, describe, expect, it } from 'vitest'
import { applyTheme, useThemeStore } from './themeStore'

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
  useThemeStore.setState({ theme: 'system' })
})

describe('applyTheme', () => {
  it('adds the dark class for the dark theme', () => {
    applyTheme('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('removes the dark class for the light theme', () => {
    document.documentElement.classList.add('dark')
    applyTheme('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})

describe('useThemeStore', () => {
  it('toggles between light and dark and applies the result', () => {
    useThemeStore.setState({ theme: 'light' })
    useThemeStore.getState().toggle()
    expect(useThemeStore.getState().theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    useThemeStore.getState().toggle()
    expect(useThemeStore.getState().theme).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
