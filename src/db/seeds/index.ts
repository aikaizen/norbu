import { db } from '../index'
import { alphabetCards, ALPHABET_DECK_ID } from './alphabet'
import { sadhanaCards, SADHANA_DECK_ID } from './sadhana-core'
import type { Deck } from '../schema'

export const STARTER_DECKS: Deck[] = [
  {
    id: ALPHABET_DECK_ID,
    name: 'Tibetan Alphabet',
    language: 'tibetan',
    description: 'The 30 letters of the Tibetan alphabet (Uchen script)',
    createdAt: Date.now(),
  },
  {
    id: SADHANA_DECK_ID,
    name: 'Sadhana Core Vocabulary',
    language: 'tibetan',
    description: 'Essential words from common Buddhist liturgy and sadhanas',
    createdAt: Date.now(),
  },
]

export function getStarterCards() {
  return [...alphabetCards, ...sadhanaCards]
}

export async function ensureStarterData() {
  const [existingDecks, existingCards] = await Promise.all([
    db.decks.toArray(),
    db.cards.toArray(),
  ])

  const existingDeckIds = new Set(existingDecks.map((deck) => deck.id))
  const existingCardIds = new Set(existingCards.map((card) => card.id))

  const missingDecks = STARTER_DECKS.filter((deck) => !existingDeckIds.has(deck.id))
  const missingCards = getStarterCards().filter((card) => !existingCardIds.has(card.id))

  if (missingDecks.length === 0 && missingCards.length === 0) return

  await db.transaction('rw', db.decks, db.cards, async () => {
    if (missingDecks.length > 0) {
      await db.decks.bulkAdd(missingDecks)
    }
    if (missingCards.length > 0) {
      await db.cards.bulkAdd(missingCards)
    }
  })
}

export async function seedIfEmpty() {
  const deckCount = await db.decks.count()
  if (deckCount > 0) return // already seeded

  await db.transaction('rw', db.decks, db.cards, async () => {
    await db.decks.bulkAdd(STARTER_DECKS)
    await db.cards.bulkAdd(getStarterCards())
  })
}
