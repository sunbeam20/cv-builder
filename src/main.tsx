import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Root } from './home/Root'
import { applyTheme, useThemeStore } from './home/themeStore'

applyTheme(useThemeStore.getState().theme)
if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    applyTheme(useThemeStore.getState().theme)
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
