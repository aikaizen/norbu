import Dexie, { type EntityTable } from 'dexie'
import type { Card, Deck, Session, Settings, ReviewLog } from './schema'
import { getInitialFSRSState } from '../lib/fsrs'

class NorbuDB extends Dexie {
  cards!: EntityTable<Card, 'id'>
  decks!: EntityTable<Deck, 'id'>
  sessions!: EntityTable<Session, 'id'>
  settings!: EntityTable<Settings, 'id'>
  reviewLogs!: EntityTable<ReviewLog, 'id'>

  constructor() {
    super('NorbuDB')

    this.version(1).stores({
      cards: 'id, deckId, *tags, fsrsState.due, createdAt',
      decks: 'id, language, createdAt',
      sessions: 'id, date, createdAt',
    })

    this.version(2).stores({
      cards: 'id, deckId, *tags, createdAt',
      decks: 'id, language, createdAt',
      sessions: 'id, date, createdAt',
      settings: 'id',
    }).upgrade(async (tx) => {
      const initial = getInitialFSRSState()
      await tx.table('cards').toCollection().modify((card: any) => {
        card.fsrsPhonetics = card.fsrsState ?? initial
        card.fsrsMeaning = initial
        delete card.fsrsState
      })
      await tx.table('settings').add({ id: 'singleton', diamonds: 0 })
    })

    this.version(3).stores({
      cards: 'id, deckId, *tags, createdAt',
      decks: 'id, language, createdAt',
      sessions: 'id, date, createdAt',
      settings: 'id',
      reviewLogs: '++id, cardId, mode, timestamp',
    })
  }
}

export const db = new NorbuDB()
