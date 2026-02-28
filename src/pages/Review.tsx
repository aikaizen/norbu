import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { FlashCard } from '../components/FlashCard'
import { RatingButtons } from '../components/RatingButtons'
import { DiamondPop } from '../components/DiamondPop'
import { useReviewSession, type ReviewMode } from '../hooks/useReviewSession'
import { getSchedulePreview, type RatingKey } from '../lib/fsrs'

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
  const [answer, setAnswer] = useState('')

  const deck = useLiveQuery(() => db.decks.get(deckId!), [deckId])
  const { currentCard, remaining, reviewed, rateCard, isDone } = useReviewSession(deckId!, reviewMode)

  const field = reviewMode === 'phonetics' ? 'fsrsPhonetics' : 'fsrsMeaning'
  const intervals = currentCard ? getSchedulePreview(currentCard[field]) : undefined

  useEffect(() => {
    setHintUsed(false)
    setIsFlipped(false)
    setAnswer('')
  }, [currentCard?.id])

  const handleRate = async (rating: RatingKey) => {
    if (!currentCard) return
    const earned = await rateCard(currentCard, rating, answer)
    if (earned) {
      setShowDiamond(true)
      setTimeout(() => setShowDiamond(false), 800)
    }
    setIsFlipped(false)
  }

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault()
    setIsFlipped(true)
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
            <div className="space-y-2">
              <form onSubmit={handleSubmitAnswer} className="flex gap-2">
                <input
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="flex-1 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder={reviewMode === 'phonetics' ? 'Type the pronunciation...' : 'Type the meaning...'}
                  autoFocus
                />
                <button
                  type="submit"
                  className="rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-5 py-3 font-medium hover:opacity-90 transition-opacity text-sm"
                >
                  Reveal
                </button>
              </form>
              {!hintUsed && (
                <button
                  onClick={() => setHintUsed(true)}
                  className="w-full rounded-xl border border-stone-200 dark:border-stone-700 py-2.5 text-sm text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  Hint
                </button>
              )}
            </div>
          )}

          {isFlipped && intervals && (
            <div className="space-y-3">
              {answer && (
                <div className="rounded-lg bg-stone-100 dark:bg-stone-800 px-3 py-2 text-sm">
                  <span className="text-stone-400 text-xs">Your answer: </span>
                  <span className="text-stone-700 dark:text-stone-300">{answer}</span>
                </div>
              )}
              <p className="text-xs text-center text-stone-400">How well did you know this?</p>
              <RatingButtons onRate={handleRate} intervals={intervals} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
