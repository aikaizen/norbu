import { motion } from 'framer-motion'
import type { Card } from '../db/schema'

interface Props {
  card: Card
  isFlipped: boolean
  onFlip: () => void
}

export function FlashCard({ card, isFlipped, onFlip }: Props) {
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
          className="w-full rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-10 flex flex-col items-center justify-center min-h-[260px] gap-4"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <p className="font-tibetan text-6xl text-stone-900 dark:text-stone-100 leading-relaxed text-center">
            {card.front.tibetan}
          </p>
          <p className="text-stone-400 text-xs mt-2">tap to reveal</p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 w-full rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 p-10 flex flex-col items-center justify-center gap-4"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <p className="font-tibetan text-5xl text-stone-900 dark:text-stone-100 leading-relaxed text-center">
            {card.front.tibetan}
          </p>
          <p className="text-xl font-medium text-stone-600 dark:text-stone-300">
            {card.front.phonetic}
          </p>
          <p className="text-stone-500 dark:text-stone-400">
            {card.front.english}
          </p>
        </div>
      </motion.div>
    </div>
  )
}
