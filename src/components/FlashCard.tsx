import { motion } from 'framer-motion'
import type { Card } from '../db/schema'
import type { ReviewMode } from '../hooks/useReviewSession'

interface Props {
  card: Card
  mode: ReviewMode
  isFlipped: boolean
  onFlip: () => void
  hint?: string
}

export function FlashCard({ card, mode, isFlipped, onFlip, hint }: Props) {
  return (
    <div
      className="relative w-full cursor-pointer select-none"
      style={{ perspective: '1200px' }}
      onClick={onFlip}
    >
      <motion.div
        className="relative w-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Front */}
        <div
          className="w-full rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-10 flex flex-col items-center justify-center min-h-[260px] gap-3"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <p className="font-tibetan text-6xl text-stone-900 dark:text-stone-100 leading-relaxed text-center">
            {card.front.tibetan}
          </p>
          {mode === 'meaning' && (
            <p className="text-lg text-stone-500 dark:text-stone-400 font-medium">
              {card.front.phonetic}
            </p>
          )}
          {hint && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
              Hint: {hint}
            </p>
          )}
          {!hint && (
            <p className="text-stone-400 text-xs mt-2">tap to reveal</p>
          )}
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 w-full rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 p-10 flex flex-col items-center justify-center gap-4"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <p className="font-tibetan text-5xl text-stone-900 dark:text-stone-100 leading-relaxed text-center">
            {card.front.tibetan}
          </p>
          {mode === 'phonetics' ? (
            <>
              <p className="text-2xl font-semibold text-stone-700 dark:text-stone-200">
                {card.front.phonetic}
              </p>
              <p className="text-stone-500 dark:text-stone-400 text-sm">
                {card.front.english}
              </p>
            </>
          ) : (
            <p className="text-2xl font-semibold text-stone-700 dark:text-stone-200 text-center">
              {card.front.english}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
