import Dexie, { type EntityTable } from 'dexie'
import type { Card, Deck, Session, Settings, ReviewLog } from './schema'
import { getInitialFSRSState } from '../lib/fsrs'

type MigratingCard = Partial<Card> & {
  fsrsState?: Card['fsrsPhonetics']
}

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
      await tx.table('cards').toCollection().modify((card: MigratingCard) => {
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

    this.version(4).stores({
      cards: 'id, deckId, *tags, difficulty, createdAt',
      decks: 'id, language, createdAt',
      sessions: 'id, date, createdAt',
      settings: 'id',
      reviewLogs: '++id, cardId, mode, timestamp',
    }).upgrade(async (tx) => {
      await tx.table('cards').toCollection().modify((card: MigratingCard) => {
        card.difficulty = card.difficulty ?? 1
      })
    })

    this.version(5).stores({
      cards: 'id, deckId, sourceCommunityId, *tags, difficulty, createdAt',
      decks: 'id, language, createdAt',
      sessions: 'id, date, createdAt',
      settings: 'id',
      reviewLogs: '++id, cardId, mode, timestamp',
    })
  }
}

export const db = new NorbuDB()

export async function clearLocalData() {
  await db.transaction('rw', db.sessions, db.cards, db.decks, db.settings, async () => {
    await db.sessions.clear()
    await db.cards.clear()
    await db.decks.clear()
    await db.settings.clear()
  })
  await db.transaction('rw', db.reviewLogs, async () => {
    await db.reviewLogs.clear()
  })
}

interface LocalSnapshot {
  decks: Deck[]
  cards: Card[]
  sessions: Session[]
  settings: Settings
  reviewLogs?: ReviewLog[]
}

export async function getLocalDataSnapshot(): Promise<LocalSnapshot> {
  const [decks, cards, sessions, settings, reviewLogs] = await Promise.all([
    db.decks.toArray(),
    db.cards.toArray(),
    db.sessions.toArray(),
    db.settings.get('singleton'),
    db.reviewLogs.toArray(),
  ])

  return {
    decks,
    cards,
    sessions,
    settings: settings ?? { id: 'singleton', diamonds: 0 },
    reviewLogs,
  }
}

export async function replaceLocalData(snapshot: LocalSnapshot) {
  await db.transaction('rw', db.sessions, db.cards, db.decks, db.settings, async () => {
    await db.sessions.clear()
    await db.cards.clear()
    await db.decks.clear()
    await db.settings.clear()

    if (snapshot.decks.length > 0) {
      await db.decks.bulkAdd(snapshot.decks)
    }
    if (snapshot.cards.length > 0) {
      await db.cards.bulkAdd(snapshot.cards)
    }
    if (snapshot.sessions.length > 0) {
      await db.sessions.bulkAdd(snapshot.sessions)
    }
    await db.settings.add(snapshot.settings)
  })
  await db.transaction('rw', db.reviewLogs, async () => {
    await db.reviewLogs.clear()
    if (snapshot.reviewLogs && snapshot.reviewLogs.length > 0) {
      await db.reviewLogs.bulkAdd(snapshot.reviewLogs)
    }
  })
}
