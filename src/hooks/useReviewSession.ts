import { useState, useCallback } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { scheduleCard, type RatingKey } from '../lib/fsrs'
import { addDiamond, earnsEasyDiamond, earnsGoodDiamond } from '../lib/diamonds'
import type { Card } from '../db/schema'

export type ReviewMode = 'phonetics' | 'meaning'

export function useReviewSession(deckId: string, mode: ReviewMode) {
  const [reviewed, setReviewed] = useState<string[]>([])
  const field = mode === 'phonetics' ? 'fsrsPhonetics' : 'fsrsMeaning'

  const dueCards = useLiveQuery(async () => {
    const now = Date.now()
    const cards = await db.cards.where('deckId').equals(deckId).toArray()
    return cards
      .filter((c) => c[field].due <= now)
      .sort((a, b) => a[field].due - b[field].due)
  }, [deckId, mode])

  const currentCard: Card | undefined = dueCards?.[0]

  const rateCard = useCallback(async (card: Card, rating: RatingKey): Promise<boolean> => {
    const newState = scheduleCard(card[field], rating)
    const update: Partial<Card> =
      field === 'fsrsPhonetics'
        ? { fsrsPhonetics: newState }
        : { fsrsMeaning: newState }
    await db.cards.update(card.id, update)
    setReviewed((prev) => [...prev, card.id])

    const earned =
      rating === 'easy'
        ? earnsEasyDiamond()
        : rating === 'good'
          ? earnsGoodDiamond(card[field].last_review)
          : false

    if (earned) await addDiamond()
    return earned
  }, [field])

  return {
    currentCard,
    remaining: dueCards?.length ?? 0,
    reviewed: reviewed.length,
    rateCard,
    isDone: dueCards?.length === 0,
  }
}
