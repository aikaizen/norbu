import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

export interface DeckWithDue {
  id: string
  name: string
  description: string
  totalCards: number
  dueCards: number
}

export function useDecksWithDue(): DeckWithDue[] | undefined {
  return useLiveQuery(async () => {
    const decks = await db.decks.toArray()
    const now = Date.now()

    return Promise.all(
      decks.map(async (deck) => {
        const cards = await db.cards.where('deckId').equals(deck.id).toArray()
        const dueCards = cards.filter((c) => c.fsrsState.due <= now).length
        return {
          id: deck.id,
          name: deck.name,
          description: deck.description,
          totalCards: cards.length,
          dueCards,
        }
      })
    )
  })
}
