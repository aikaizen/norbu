import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { FlashCard } from '../components/FlashCard'
import { RatingButtons } from '../components/RatingButtons'
import { DiamondPop } from '../components/DiamondPop'
import { useReviewSession, type ReviewMode } from '../hooks/useReviewSession'
import type { RatingKey } from '../lib/fsrs'

function getHint(mode: ReviewMode, phonetic: string, english: string): string {
  if (mode === 'phonetics') {
    return phonetic.split(/[\s-]/)[0] + '...'
  } else {
    return english.charAt(0).toUpperCase() + '...'
  }
}

export function Review() {
  const { deckId, mode } = useParams<{ deckId: string; mode: string }>()
  const reviewMode: ReviewMode = mode === 'meaning' ? 'meaning' : 'phonetics'

  const [isFlipped, setIsFlipped] = useState(false)
  const [hintUsed, setHintUsed] = useState(false)
  const [showDiamond, setShowDiamond] = useState(false)

  const deck = useLiveQuery(() => db.decks.get(deckId!), [deckId])
  const { currentCard, remaining, reviewed, rateCard, isDone } = useReviewSession(deckId!, reviewMode)

  useEffect(() => {
    setHintUsed(false)
    setIsFlipped(false)
  }, [currentCard?.id])

  const handleRate = async (rating: RatingKey) => {
    if (!currentCard) return
    const earned = await rateCard(currentCard, rating)
    if (earned) {
      setShowDiamond(true)
      setTimeout(() => setShowDiamond(false), 800)
    }
    setIsFlipped(false)
  }

  const hint = currentCard
    ? getHint(reviewMode, currentCard.front.phonetic, currentCard.front.english)
    : undefined

  const modeLabel = reviewMode === 'phonetics' ? 'Phonetics' : 'Meanings'

  if (isDone) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="text-5xl">◈</div>
        <h2 className="text-2xl font-semibold">All done!</h2>
        <p className="text-stone-500">
          You reviewed {reviewed} card{reviewed !== 1 ? 's' : ''} — {modeLabel}.
        </p>
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
      <DiamondPop show={showDiamond} />

      <div className="flex items-center justify-between">
        <Link to="/" className="text-stone-400 hover:text-stone-700 text-sm">← back</Link>
        <p className="text-sm text-stone-400">
          {reviewed} done · {remaining} left
        </p>
      </div>

      <div className="flex items-center gap-2">
        <h2 className="font-medium text-stone-500 text-sm">{deck?.name}</h2>
        <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500">
          {modeLabel}
        </span>
      </div>

      <div className="h-1 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-600 transition-all duration-500"
          style={{
            width: `${reviewed + remaining > 0 ? (reviewed / (reviewed + remaining)) * 100 : 0}%`,
          }}
        />
      </div>

      {currentCard && (
        <>
          <FlashCard
            card={currentCard}
            mode={reviewMode}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(true)}
            hint={hintUsed ? hint : undefined}
          />

          {!isFlipped && (
            <div className="flex gap-2">
              <button
                onClick={() => setIsFlipped(true)}
                className="flex-1 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 py-4 font-medium hover:opacity-90 transition-opacity"
              >
                Show answer
              </button>
              {!hintUsed && (
                <button
                  onClick={() => setHintUsed(true)}
                  className="rounded-xl border border-stone-200 dark:border-stone-700 px-5 py-4 text-sm text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  Hint
                </button>
              )}
            </div>
          )}

          {isFlipped && (
            <div className="space-y-2">
              <p className="text-xs text-center text-stone-400">How well did you know this?</p>
              <RatingButtons onRate={handleRate} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
