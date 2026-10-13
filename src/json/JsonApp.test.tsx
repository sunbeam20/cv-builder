import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { JsonApp } from './JsonApp'

const output = () => screen.getByLabelText('Output') as HTMLTextAreaElement

describe('JsonApp', () => {
  it('formats JSON by default', () => {
    render(<JsonApp />)
    expect(output().value).toContain('"name": "Ada"')
  })

  it('converts JSON to CSV', () => {
    render(<JsonApp />)
    fireEvent.click(screen.getByRole('button', { name: 'JSON → CSV' }))
    expect(output().value).toBe('name,role\nAda,Engineer\nLinus,Maintainer')
  })

  it('reports invalid input', () => {
    render(<JsonApp />)
    fireEvent.change(screen.getByLabelText('Input'), { target: { value: '{oops}' } })
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('converts CSV to JSON', () => {
    render(<JsonApp />)
    fireEvent.click(screen.getByRole('button', { name: 'CSV → JSON' }))
    fireEvent.change(screen.getByLabelText('Input'), { target: { value: 'name,role\nAda,Engineer' } })
    expect(JSON.parse(output().value)).toEqual([{ name: 'Ada', role: 'Engineer' }])
  })
})
