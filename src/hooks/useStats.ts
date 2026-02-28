import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

export interface AppStats {
  totalCards: number
  totalDecks: number
  phoneticsDue: number
  meaningDue: number
  totalSessions: number
  tutorSessions: number
  studyDays: number
  diamonds: number
}

export function useStats(): AppStats | undefined {
  return useLiveQuery(async () => {
    const [cards, decks, sessions, settings] = await Promise.all([
      db.cards.toArray(),
      db.decks.count(),
      db.sessions.toArray(),
      db.settings.get('singleton'),
    ])

    const now = Date.now()
    const studyDays = new Set(sessions.map((s) => s.date)).size

    return {
      totalCards: cards.length,
      totalDecks: decks,
      phoneticsDue: cards.filter((c) => c.fsrsPhonetics.due <= now).length,
      meaningDue: cards.filter((c) => c.fsrsMeaning.due <= now).length,
      totalSessions: sessions.length,
      tutorSessions: sessions.filter((s) => s.isTutorSession).length,
      studyDays,
      diamonds: settings?.diamonds ?? 0,
    }
  })
}
