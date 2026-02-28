export interface FSRSState {
  due: number           // timestamp ms
  stability: number
  difficulty: number
  elapsed_days: number
  scheduled_days: number
  reps: number
  lapses: number
  state: 0 | 1 | 2 | 3  // New=0, Learning=1, Review=2, Relearning=3
  last_review?: number  // timestamp ms
}

export interface CardFront {
  tibetan: string       // Uchen script e.g. "སངས་རྒྱས་"
  phonetic: string      // Romanization e.g. "sangye"
  english: string       // Translation e.g. "Buddha"
}

export interface Card {
  id: string
  deckId: string
  front: CardFront
  tags: string[]
  audioUrl?: string
  fsrsState: FSRSState
  createdAt: number
}

export interface Deck {
  id: string
  name: string
  language: 'tibetan' | 'english'
  description: string
  createdAt: number
}

export interface Session {
  id: string
  date: string          // ISO date string YYYY-MM-DD
  notes: string
  cardsReviewed: string[]
  isTutorSession: boolean
  duration: number      // minutes
  createdAt: number
}
