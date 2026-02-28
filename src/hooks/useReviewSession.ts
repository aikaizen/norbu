import { useState, useCallback } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { scheduleCard, type RatingKey } from '../lib/fsrs'
import type { Card } from '../db/schema'

export function useReviewSession(deckId: string) {
  const [reviewed, setReviewed] = useState<string[]>([])

  const dueCards = useLiveQuery(async () => {
    const now = Date.now()
    const cards = await db.cards.where('deckId').equals(deckId).toArray()
    return cards
      .filter((c) => c.fsrsState.due <= now)
      .sort((a, b) => a.fsrsState.due - b.fsrsState.due)
  }, [deckId])

  const currentCard: Card | undefined = dueCards?.[0]

  const rateCard = useCallback(async (card: Card, rating: RatingKey) => {
    const newState = scheduleCard(card.fsrsState, rating)
    await db.cards.update(card.id, { fsrsState: newState })
    setReviewed((prev) => [...prev, card.id])
  }, [])

  return {
    currentCard,
    remaining: dueCards?.length ?? 0,
    reviewed: reviewed.length,
    rateCard,
    isDone: dueCards?.length === 0,
  }
}
