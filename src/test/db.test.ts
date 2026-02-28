import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../db'
import type { Deck, Card } from '../db/schema'

const newDeck = (): Deck => ({
  id: 'test-deck-1',
  name: 'Test Deck',
  language: 'tibetan',
  description: 'Test',
  createdAt: Date.now(),
})

const initialState = () => ({
  due: Date.now(),
  stability: 0,
  difficulty: 0,
  elapsed_days: 0,
  scheduled_days: 0,
  reps: 0,
  lapses: 0,
  state: 0 as const,
})

describe('NorbuDB', () => {
  beforeEach(async () => {
    await db.decks.clear()
    await db.cards.clear()
  })

  it('can add and retrieve a deck', async () => {
    const deck = newDeck()
    await db.decks.add(deck)
    const found = await db.decks.get('test-deck-1')
    expect(found?.name).toBe('Test Deck')
  })

  it('can add a card to a deck', async () => {
    await db.decks.add(newDeck())
    const card: Card = {
      id: 'card-1',
      deckId: 'test-deck-1',
      front: { tibetan: 'སངས་རྒྱས་', phonetic: 'sangye', english: 'Buddha' },
      tags: ['alphabet'],
      difficulty: 1,
      fsrsPhonetics: initialState(),
      fsrsMeaning: initialState(),
      createdAt: Date.now(),
    }
    await db.cards.add(card)
    const cards = await db.cards.where('deckId').equals('test-deck-1').toArray()
    expect(cards).toHaveLength(1)
    expect(cards[0].front.tibetan).toBe('སངས་རྒྱས་')
  })
})
