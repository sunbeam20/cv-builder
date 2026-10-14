import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from './themeStore'

interface ThemeToggleProps {
  className?: string
}

/** Flips between light and dark. The choice is remembered in local storage. */
export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const theme = useThemeStore((state) => state.theme)
  const toggle = useThemeStore((state) => state.toggle)
  const dark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Light mode' : 'Dark mode'}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 ${className}`}
    >
      {dark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  )
}

export default ThemeToggle
