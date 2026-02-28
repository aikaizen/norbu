export interface FSRSState {
  due: number
  stability: number
  difficulty: number
  elapsed_days: number
  scheduled_days: number
  reps: number
  lapses: number
  state: 0 | 1 | 2 | 3
  last_review?: number
}

export interface CardFront {
  tibetan: string
  phonetic: string
  english: string
}

export interface Card {
  id: string
  deckId: string
  front: CardFront
  tags: string[]
  audioUrl?: string
  fsrsPhonetics: FSRSState   // was fsrsState — renamed
  fsrsMeaning: FSRSState     // NEW: independent meaning schedule
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
  date: string
  notes: string
  cardsReviewed: string[]
  isTutorSession: boolean
  duration: number
  createdAt: number
}

export interface Settings {
  id: 'singleton'
  diamonds: number
}
