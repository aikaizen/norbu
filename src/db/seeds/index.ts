import { db } from '../index'
import { alphabetCards, ALPHABET_DECK_ID } from './alphabet'
import { sadhanaCards, SADHANA_DECK_ID } from './sadhana-core'
import type { Deck } from '../schema'

const STARTER_DECKS: Deck[] = [
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

export async function seedIfEmpty() {
  const deckCount = await db.decks.count()
  if (deckCount > 0) return // already seeded

  await db.transaction('rw', db.decks, db.cards, async () => {
    await db.decks.bulkAdd(STARTER_DECKS)
    await db.cards.bulkAdd([...alphabetCards, ...sadhanaCards])
  })
}
