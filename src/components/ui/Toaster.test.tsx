import { beforeEach, describe, expect, it } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { Toaster } from './Toaster'
import { toast, useToastStore } from '../../lib/toast'

beforeEach(() => {
  useToastStore.setState({ toasts: [] })
})

describe('Toaster', () => {
  it('renders notifications pushed through the toast helper', () => {
    render(<Toaster />)
    act(() => {
      toast.info('Heads up')
    })
    expect(screen.getByText('Heads up')).toBeInTheDocument()
  })

  it('renders action buttons for a confirm toast', () => {
    render(<Toaster />)
    act(() => {
      toast.confirm({ message: 'Clear data?', confirmLabel: 'Clear', onConfirm: () => {} })
    })
    expect(screen.getByText('Clear data?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('shows an animated spinner for a loading toast', () => {
    const { container } = render(<Toaster />)
    act(() => {
      toast.loading('Preparing PDF…')
    })
    expect(screen.getByText('Preparing PDF…')).toBeInTheDocument()
    expect(container.querySelector('.animate-spin')).not.toBeNull()
  })

  it('uses the alert role for errors', () => {
    render(<Toaster />)
    act(() => {
      toast.error('Invalid file')
    })
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid file')
  })
})