import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { PasswordApp } from './PasswordApp'
import { Toaster } from '../components/ui/Toaster'
import { useToastStore } from '../lib/toast'

beforeEach(() => {
  useToastStore.setState({ toasts: [] })
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  })
})

const output = () => document.querySelector('output') as HTMLOutputElement

describe('PasswordApp', () => {
  it('generates a password of the default length', () => {
    render(<PasswordApp />)
    expect(output().textContent).toHaveLength(16)
  })

  it('warns when no character set is selected', () => {
    render(<PasswordApp />)
    for (const label of ['Lowercase (a–z)', 'Uppercase (A–Z)', 'Numbers (0–9)', 'Symbols (!@#$…)']) {
      fireEvent.click(screen.getByLabelText(label))
    }
    expect(screen.getByText(/Pick at least one character set/)).toBeInTheDocument()
  })

  it('regenerates when the length slider changes', () => {
    render(<PasswordApp />)
    fireEvent.change(screen.getByLabelText('Length'), { target: { value: '32' } })
    expect(output().textContent).toHaveLength(32)
  })

  it('switches to passphrase mode', () => {
    render(<PasswordApp />)
    fireEvent.click(screen.getByRole('button', { name: 'passphrase' }))
    expect(screen.getByLabelText('Words')).toBeInTheDocument()
    expect(output().textContent?.split('-')).toHaveLength(4)
  })

  it('copies the generated value to the clipboard', async () => {
    render(
      <>
        <PasswordApp />
        <Toaster />
      </>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(output().textContent)
    expect(await screen.findByText(/Copied to clipboard/)).toBeInTheDocument()
  })
})
