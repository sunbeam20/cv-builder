import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { OfferCompareApp } from './OfferCompareApp'
import { useOfferStore } from './store'
import { emptyOffer, type Offer } from './model'

const makeOffer = (company: string): Offer => ({
  ...emptyOffer(company),
  base: 0,
  targetBonusPct: 0,
  signOn: 0,
  equityTotal: 0,
  vestingYears: 4,
  cliffYears: 1,
  taxRate: 0,
  costOfLiving: 100,
  remoteDays: 0,
})

beforeEach(() => {
  localStorage.clear()
  useOfferStore.setState({ offers: [makeOffer('Offer A'), makeOffer('Offer B')], currency: 'USD' })
})

describe('OfferCompareApp', () => {
  it('computes the total from the base salary', () => {
    render(<OfferCompareApp />)
    fireEvent.change(screen.getByLabelText('Base Offer A'), { target: { value: '100000' } })
    const cells = screen.getAllByText('$100,000')
    expect(cells.length).toBeGreaterThan(0)
  })

  it('adds an offer', () => {
    render(<OfferCompareApp />)
    fireEvent.click(screen.getByRole('button', { name: /Add offer/i }))
    expect(screen.getByLabelText('Base Offer C')).toBeInTheDocument()
  })

  it('removes an offer', () => {
    render(<OfferCompareApp />)
    fireEvent.click(screen.getByRole('button', { name: 'Delete Offer B' }))
    expect(screen.queryByLabelText('Base Offer B')).not.toBeInTheDocument()
  })

  it('renders a 4-year projection chart per offer', () => {
    render(<OfferCompareApp />)
    expect(screen.getAllByRole('img', { name: /4-year projection/i })).toHaveLength(2)
  })
})