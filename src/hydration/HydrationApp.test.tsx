import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { HydrationApp } from './HydrationApp'
import { Toaster } from '../components/ui/Toaster'
import { useToastStore } from '../lib/toast'
import { saveEntries, STORAGE_KEYS } from './model'
import type { IntakeEntry } from './model'

// Fixed mid-afternoon Tuesday so pace/backfill logic is deterministic.
const NOW = () => new Date(2026, 8, 22, 15)

const renderApp = (): void => {
  render(
    <>
      <HydrationApp now={NOW} />
      <Toaster />
    </>,
  )
}

const entry = (amountMl: number, beverage = 'water'): IntakeEntry => ({
  id: `${Math.random()}-${amountMl}`,
  amountMl,
  beverage,
  loggedAt: NOW().toISOString(),
  createdAt: NOW().toISOString(),
  updatedAt: NOW().toISOString(),
})

const goalLine = (): HTMLElement =>
  screen.getByText((_, node) => typeof node?.className === 'string' && node.className.includes('text-2xl'))

beforeEach(() => {
  localStorage.clear()
  useToastStore.setState({ toasts: [] })
})

describe('HydrationApp', () => {
  it('renders the header and an empty state', () => {
    renderApp()
    expect(screen.getByText('Hydration Tracker')).toBeInTheDocument()
    expect(goalLine().textContent).toContain("of 2000 ml")
    expect(screen.getByText('Daily goal')).toBeInTheDocument()
    expect(screen.getByText('No intake yet — add your first glass of water.')).toBeInTheDocument()
  })

  it('logs a quick water preset and grows the daily total', () => {
    renderApp()
    fireEvent.click(screen.getByRole('button', { name: '250 ml' }))
    expect(goalLine().textContent).toContain("250 ml of 2000 ml")
    expect(screen.getByText('250 ml logged')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /250 ml/ })).toHaveAttribute('aria-pressed', 'true')
  })

  it('logs multiple presets and sums the effective intake', () => {
    renderApp()
    fireEvent.click(screen.getByRole('button', { name: '1000 ml' }))
    fireEvent.click(screen.getByRole('button', { name: '330 ml' }))
    expect(goalLine().textContent).toContain("1330 ml of 2000 ml")
  })

  it('shows the caffeine alert once coffee pushes over the cap', () => {
    renderApp()
    fireEvent.click(screen.getByRole('button', { name: 'Coffee' }))
    fireEvent.click(screen.getByRole('button', { name: '1000 ml' }))
    fireEvent.click(screen.getByRole('button', { name: '1000 ml' }))
    expect(screen.getByText('Caffeine alert')).toBeInTheDocument()
    expect(screen.getByText(/800 mg of caffeine today/)).toBeInTheDocument()
  })

  it('shows the pace reminder when behind schedule', () => {
    renderApp()
    fireEvent.click(screen.getByRole('button', { name: '250 ml' }))
    expect(screen.getByText('Pace reminder')).toBeInTheDocument()
    expect(screen.getByText(/ml behind where you should be today/)).toBeInTheDocument()
  })

  it('hides the pace reminder once the goal is reached', () => {
    renderApp()
    fireEvent.click(screen.getByRole('button', { name: '1000 ml' }))
    fireEvent.click(screen.getByRole('button', { name: '1000 ml' }))
    expect(screen.queryByText('Pace reminder')).not.toBeInTheDocument()
  })

  it('edits the daily goal via the goal dialog', () => {
    renderApp()
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    const input = screen.getByLabelText('Millilitres')
    fireEvent.change(input, { target: { value: '2500' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(goalLine().textContent).toContain('of 2500 ml')
    expect(screen.getByText('Daily goal updated')).toBeInTheDocument()
  })

  it('rejects an out-of-range goal', () => {
    renderApp()
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    const input = screen.getByLabelText('Millilitres')
    fireEvent.change(input, { target: { value: '20000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByText('Enter a value between 500 and 10000 ml')).toBeInTheDocument()
    expect(screen.queryByText(/of 20000 ml/)).not.toBeInTheDocument()
  })

  it('logs a custom amount', () => {
    renderApp()
    fireEvent.click(screen.getByRole('button', { name: 'Custom…' }))
    const input = screen.getByLabelText('Millilitres')
    fireEvent.change(input, { target: { value: '850' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(goalLine().textContent).toContain("850 ml of 2000 ml")
    expect(screen.getByText('850 ml logged')).toBeInTheDocument()
  })

  it('backfills an entry to an earlier time today', () => {
    renderApp()
    fireEvent.click(screen.getByRole('button', { name: 'Backfill …' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(goalLine().textContent).toContain("250 ml of 2000 ml")
    expect(screen.getByText('Backfilled 250 ml')).toBeInTheDocument()
  })

  it('deletes an entry after confirmation', () => {
    renderApp()
    fireEvent.click(screen.getByRole('button', { name: '250 ml' }))
    fireEvent.click(screen.getByRole('button', { name: 'Delete entry' }))
    expect(screen.getByText('Delete entry?')).toBeInTheDocument()
    expect(screen.getByText('Remove this 250 ml entry from your log.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(screen.getByText('No intake yet — add your first glass of water.')).toBeInTheDocument()
    expect(screen.getByText('Entry deleted')).toBeInTheDocument()
  })

  it('edits an existing entry', () => {
    renderApp()
    fireEvent.click(screen.getByRole('button', { name: '250 ml' }))
    fireEvent.click(screen.getByRole('button', { name: 'Edit entry' }))
    const input = screen.getByLabelText('Millilitres')
    fireEvent.change(input, { target: { value: '500' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(goalLine().textContent).toContain("500 ml of 2000 ml")
    expect(screen.getByText('Entry updated')).toBeInTheDocument()
  })

  it('shows insights with stats, score, and empty achievements', () => {
    renderApp()
    fireEvent.click(screen.getByRole('button', { name: 'Insights' }))
    expect(screen.getAllByText('Insights').length).toBeGreaterThan(0)
    expect(screen.getByText('Hydration score')).toBeInTheDocument()
    expect(screen.getByText('0/100')).toBeInTheDocument()
    expect(screen.getByText('Most logged')).toBeInTheDocument()
    expect(screen.getByText('No badges earned yet')).toBeInTheDocument()
    expect(screen.getByText('Challenges')).toBeInTheDocument()
    expect(screen.getAllByText('Open').length).toBe(2)
  })

  it('shows streak and challenges after logging a full day', () => {
    saveEntries([
      entry(1000),
      entry(1000, 'coffee'),
      entry(1000),
    ])
    renderApp()
    fireEvent.click(screen.getByRole('button', { name: 'Insights' }))
    expect(screen.getByText('Streak')).toBeInTheDocument()
    expect(screen.getByText('1 day · best 1')).toBeInTheDocument()
  })

  it('persists entries across remounts', async () => {
    const { unmount } = render(
      <>
        <HydrationApp now={NOW} />
        <Toaster />
      </>,
    )
    fireEvent.click(screen.getByRole('button', { name: '250 ml' }))
    expect(goalLine().textContent).toContain("250 ml of 2000 ml")
    unmount()
    render(
      <>
        <HydrationApp now={NOW} />
        <Toaster />
      </>,
    )
    await waitFor(() => expect(goalLine().textContent).toContain("250 ml of 2000 ml"))
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.ENTRIES_KEY) ?? '[]')
    expect(stored).toHaveLength(1)
  })

  it('exports the CSV only when there is data', () => {
    renderApp()
    fireEvent.click(screen.getByRole('button', { name: /Export CSV/ }))
    expect(screen.getByText('Nothing to export yet')).toBeInTheDocument()
  })
})