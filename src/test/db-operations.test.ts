import { beforeEach, describe, expect, it } from 'vitest'
import { db, replaceLocalData, getLocalDataSnapshot } from '../db'
import type { Deck, Card, Settings } from '../db/schema'
import { getInitialFSRSState } from '../lib/fsrs'

function makeDeck(id: string): Deck {
  return { id, name: `Deck ${id}`, language: 'tibetan', description: 'test', createdAt: Date.now() }
}

function makeCard(id: string, deckId: string): Card {
  return {
    id,
    deckId,
    front: { tibetan: 'ཀ', phonetic: 'ka', english: 'ka' },
    tags: [],
    difficulty: 1,
    fsrsPhonetics: getInitialFSRSState(),
    fsrsMeaning: getInitialFSRSState(),
    createdAt: Date.now(),
  }
}

describe('replaceLocalData', () => {
  beforeEach(async () => {
    await db.decks.clear()
    await db.cards.clear()
    await db.sessions.clear()
    await db.settings.clear()
    await db.reviewLogs.clear()
  })

  it('replaces decks, cards, and settings', async () => {
    await db.decks.add(makeDeck('old-deck'))

    await replaceLocalData({
      decks: [makeDeck('new-deck')],
      cards: [makeCard('card-1', 'new-deck')],
      sessions: [],
      settings: { id: 'singleton', diamonds: 42 },
    })

    const decks = await db.decks.toArray()
    expect(decks).toHaveLength(1)
    expect(decks[0].id).toBe('new-deck')

    const cards = await db.cards.toArray()
    expect(cards).toHaveLength(1)

    const settings = await db.settings.get('singleton')
    expect(settings?.diamonds).toBe(42)
  })

  it('does NOT wipe review logs when snapshot has no reviewLogs', async () => {
    await db.reviewLogs.add({
      cardId: 'card-1',
      mode: 'phonetics',
      answer: 'ka',
      rating: 'good',
      timestamp: Date.now(),
    })

    await replaceLocalData({
      decks: [],
      cards: [],
      sessions: [],
      settings: { id: 'singleton', diamonds: 0 },
    })

    const logs = await db.reviewLogs.toArray()
    expect(logs).toHaveLength(1)
  })

  it('replaces review logs when snapshot provides them', async () => {
    await db.reviewLogs.add({
      cardId: 'old-card',
      mode: 'phonetics',
      answer: 'old',
      rating: 'again',
      timestamp: Date.now(),
    })

    await replaceLocalData({
      decks: [],
      cards: [],
      sessions: [],
      settings: { id: 'singleton', diamonds: 0 },
      reviewLogs: [
        { cardId: 'new-card', mode: 'meaning', answer: 'new', rating: 'easy', timestamp: Date.now() },
      ],
    })

    const logs = await db.reviewLogs.toArray()
    expect(logs).toHaveLength(1)
    expect(logs[0].cardId).toBe('new-card')
  })
})

describe('getLocalDataSnapshot', () => {
  beforeEach(async () => {
    await db.decks.clear()
    await db.cards.clear()
    await db.sessions.clear()
    await db.settings.clear()
    await db.reviewLogs.clear()
  })

  it('returns all local data', async () => {
    await db.decks.add(makeDeck('d1'))
    await db.cards.add(makeCard('c1', 'd1'))
    await db.settings.put({ id: 'singleton', diamonds: 10 })

    const snapshot = await getLocalDataSnapshot()
    expect(snapshot.decks).toHaveLength(1)
    expect(snapshot.cards).toHaveLength(1)
    expect(snapshot.settings.diamonds).toBe(10)
  })

  it('returns default settings when none exist', async () => {
    const snapshot = await getLocalDataSnapshot()
    expect(snapshot.settings).toEqual({ id: 'singleton', diamonds: 0 })
  })
})
