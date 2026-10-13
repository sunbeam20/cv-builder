import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { LoremApp } from './LoremApp'

const output = () => screen.getByLabelText('Generated text')

describe('LoremApp', () => {
  it('generates paragraphs by default, starting with the opener', () => {
    render(<LoremApp />)
    expect(output().textContent).toContain('Lorem ipsum')
  })

  it('generates the requested number of words', () => {
    render(<LoremApp />)
    fireEvent.change(screen.getByLabelText('Unit'), { target: { value: 'words' } })
    fireEvent.change(screen.getByLabelText('How many'), { target: { value: '7' } })
    expect((output().textContent ?? '').split(' ')).toHaveLength(7)
  })

  it('drops the opener when unchecked', () => {
    render(<LoremApp />)
    fireEvent.change(screen.getByLabelText('Unit'), { target: { value: 'words' } })
    fireEvent.click(screen.getByLabelText(/Start with/))
    expect(output().textContent?.startsWith('Lorem ipsum')).toBe(false)
  })
})
