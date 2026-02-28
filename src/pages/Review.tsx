import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { FlashCard } from '../components/FlashCard'
import { RatingButtons } from '../components/RatingButtons'
import { useReviewSession } from '../hooks/useReviewSession'
import type { RatingKey } from '../lib/fsrs'

export function Review() {
  const { deckId } = useParams<{ deckId: string }>()
  const [isFlipped, setIsFlipped] = useState(false)

  const deck = useLiveQuery(() => db.decks.get(deckId!), [deckId])
  const { currentCard, remaining, reviewed, rateCard, isDone } = useReviewSession(deckId!)

  const handleRate = async (rating: RatingKey) => {
    if (!currentCard) return
    await rateCard(currentCard, rating)
    setIsFlipped(false)
  }

  if (isDone) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="text-5xl">◈</div>
        <h2 className="text-2xl font-semibold">All done!</h2>
        <p className="text-stone-500">You reviewed {reviewed} card{reviewed !== 1 ? 's' : ''}.</p>
        <Link
          to="/"
          className="rounded-xl bg-amber-700 text-white px-6 py-3 text-sm font-medium hover:bg-amber-800 transition-colors"
        >
          Back to home
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/" className="text-stone-400 hover:text-stone-700 text-sm">← back</Link>
        <p className="text-sm text-stone-400">
          {reviewed} done · {remaining} left
        </p>
      </div>

      <h2 className="font-medium text-stone-500 text-sm">{deck?.name}</h2>

      {/* Progress bar */}
      <div className="h-1 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-600 transition-all duration-500"
          style={{ width: `${reviewed + remaining > 0 ? (reviewed / (reviewed + remaining)) * 100 : 0}%` }}
        />
      </div>

      {currentCard && (
        <>
          <FlashCard
            card={currentCard}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(true)}
          />

          {isFlipped && (
            <div className="space-y-2">
              <p className="text-xs text-center text-stone-400">How well did you know this?</p>
              <RatingButtons onRate={handleRate} />
            </div>
          )}

          {!isFlipped && (
            <button
              onClick={() => setIsFlipped(true)}
              className="w-full rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 py-4 font-medium hover:opacity-90 transition-opacity"
            >
              Show answer
            </button>
          )}
        </>
      )}
    </div>
  )
}
