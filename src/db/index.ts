import Dexie, { type EntityTable } from 'dexie'
import type { Card, Deck, Session } from './schema'

class NorbuDB extends Dexie {
  cards!: EntityTable<Card, 'id'>
  decks!: EntityTable<Deck, 'id'>
  sessions!: EntityTable<Session, 'id'>

  constructor() {
    super('NorbuDB')
    this.version(1).stores({
      cards: 'id, deckId, *tags, fsrsState.due, createdAt',
      decks: 'id, language, createdAt',
      sessions: 'id, date, createdAt',
    })
  }
}

export const db = new NorbuDB()
