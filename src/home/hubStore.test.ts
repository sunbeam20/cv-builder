import { beforeEach, describe, expect, it } from 'vitest'
import { useHubStore } from './hubStore'

beforeEach(() => {
  localStorage.clear()
  useHubStore.setState({ recents: [], favourites: [] })
})

describe('hubStore', () => {
  it('records recents most-recent-first and de-duplicates', () => {
    const { recordRecent } = useHubStore.getState()
    recordRecent('cv')
    recordRecent('ats')
    recordRecent('cv')
    expect(useHubStore.getState().recents).toEqual(['cv', 'ats'])
  })

  it('caps the recents list', () => {
    const { recordRecent } = useHubStore.getState()
    for (const slug of ['a', 'b', 'c', 'd', 'e', 'f', 'g']) recordRecent(slug)
    expect(useHubStore.getState().recents).toHaveLength(6)
    expect(useHubStore.getState().recents[0]).toBe('g')
  })

  it('toggles favourites', () => {
    const { toggleFavourite } = useHubStore.getState()
    toggleFavourite('favicon')
    expect(useHubStore.getState().favourites).toEqual(['favicon'])
    toggleFavourite('favicon')
    expect(useHubStore.getState().favourites).toEqual([])
  })
})
