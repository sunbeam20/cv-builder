import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ConvertApp } from './ConvertApp'

const result = () => (document.querySelector('output') as HTMLOutputElement).textContent

describe('ConvertApp', () => {
  it('converts the default value', () => {
    render(<ConvertApp />)
    expect(result()).toBe('3.2808')
  })

  it('updates the result when the value changes', () => {
    render(<ConvertApp />)
    fireEvent.change(screen.getByLabelText('Value'), { target: { value: '10' } })
    expect(result()).toBe('32.8084')
  })

  it('switches categories and resets the units', () => {
    render(<ConvertApp />)
    fireEvent.click(screen.getByRole('button', { name: 'Temperature' }))
    fireEvent.change(screen.getByLabelText('Value'), { target: { value: '100' } })
    expect(result()).toBe('212')
  })

  it('swaps the from and to units', () => {
    render(<ConvertApp />)
    fireEvent.change(screen.getByLabelText('Value'), { target: { value: '1' } })
    expect(result()).toBe('3.2808')
    fireEvent.click(screen.getByLabelText('Swap units'))
    expect(result()).toBe('0.3048')
  })
})
