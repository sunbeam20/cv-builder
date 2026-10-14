import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ThemeToggle } from './ThemeToggle'
import { useThemeStore } from './themeStore'

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
  useThemeStore.setState({ theme: 'light' })
})

describe('ThemeToggle', () => {
  it('switches to dark and back again', () => {
    render(<ThemeToggle />)
    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark theme' }))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Switch to light theme' }))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
