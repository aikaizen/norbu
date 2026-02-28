import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

export interface AppStats {
  totalCards: number
  totalDecks: number
  dueToday: number
  totalSessions: number
  tutorSessions: number
  studyDays: number
}

export function useStats(): AppStats | undefined {
  return useLiveQuery(async () => {
    const [cards, decks, sessions] = await Promise.all([
      db.cards.toArray(),
      db.decks.count(),
      db.sessions.toArray(),
    ])

    const now = Date.now()
    const dueToday = cards.filter((c) => c.fsrsState.due <= now).length
    const studyDays = new Set(sessions.map((s) => s.date)).size

    return {
      totalCards: cards.length,
      totalDecks: decks,
      dueToday,
      totalSessions: sessions.length,
      tutorSessions: sessions.filter((s) => s.isTutorSession).length,
      studyDays,
    }
  })
}
