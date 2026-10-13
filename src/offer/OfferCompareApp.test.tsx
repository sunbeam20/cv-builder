import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { OfferCompareApp } from './OfferCompareApp'
import { useOfferStore } from './store'
import { emptyOffer } from './model'

beforeEach(() => {
  localStorage.clear()
  useOfferStore.setState({ offers: [emptyOffer('Offer A'), emptyOffer('Offer B')], currency: 'USD' })
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
})
