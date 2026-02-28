import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

export interface DeckWithDue {
  id: string
  name: string
  description: string
  totalCards: number
  phoneticsReady: number
  meaningReady: number
}

export function useDecksWithDue(): DeckWithDue[] | undefined {
  return useLiveQuery(async () => {
    const decks = await db.decks.toArray()
    const now = Date.now()

    return Promise.all(
      decks.map(async (deck) => {
        const cards = await db.cards.where('deckId').equals(deck.id).toArray()
        return {
          id: deck.id,
          name: deck.name,
          description: deck.description,
          totalCards: cards.length,
          phoneticsReady: cards.filter((c) => c.fsrsPhonetics.due <= now).length,
          meaningReady: cards.filter((c) => c.fsrsMeaning.due <= now).length,
        }
      })
    )
  })
}
