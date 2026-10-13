import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { FaviconApp } from './FaviconApp'
import { useFaviconStore } from './store'
import { emptyFavicon } from './model'

beforeEach(() => {
  localStorage.clear()
  useFaviconStore.setState({ config: emptyFavicon() })
})

describe('FaviconApp', () => {
  it('renders previews at multiple sizes', () => {
    render(<FaviconApp />)
    expect(screen.getByAltText('16px favicon')).toBeInTheDocument()
    expect(screen.getByAltText('512px favicon')).toBeInTheDocument()
  })

  it('updates the preview when letters change', () => {
    render(<FaviconApp />)
    fireEvent.change(screen.getByLabelText('Letters'), { target: { value: 'XY' } })
    expect((screen.getByLabelText('Letters') as HTMLInputElement).value).toBe('XY')
  })
})
