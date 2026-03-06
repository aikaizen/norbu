import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../db'
import { ensureStarterData, getStarterCards, getStarterDecks } from '../db/seeds'

function hasUndefinedDeep(value: unknown): boolean {
  if (value === undefined) return true
  if (Array.isArray(value)) return value.some((item) => hasUndefinedDeep(item))
  if (value && typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).some((item) => hasUndefinedDeep(item))
  }
  return false
}

describe('starter seeds', () => {
  beforeEach(async () => {
    await db.cards.clear()
    await db.decks.clear()
  })

  it('starter cards are firestore-safe (no undefined values)', () => {
    const cards = getStarterCards()
    expect(cards.length).toBeGreaterThan(0)
    for (const card of cards) {
      expect(hasUndefinedDeep(card)).toBe(false)
    }
  })

  it('ensureStarterData backfills missing starter decks and cards', async () => {
    await db.decks.add({
      id: 'test-deck-only',
      name: 'test',
      language: 'tibetan',
      description: 'user deck',
      createdAt: Date.now(),
    })

    await ensureStarterData()

    const decks = await db.decks.toArray()
    const cards = await db.cards.toArray()
    const deckIds = new Set(decks.map((deck) => deck.id))

    for (const starterDeck of getStarterDecks()) {
      expect(deckIds.has(starterDeck.id)).toBe(true)
    }
    expect(cards.length).toBeGreaterThanOrEqual(getStarterCards().length)
  })
})
