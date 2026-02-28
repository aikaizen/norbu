import type { RatingKey } from '../lib/fsrs'

interface Props {
  onRate: (rating: RatingKey) => void
}

const BUTTONS: { rating: RatingKey; label: string; sublabel: string; color: string }[] = [
  { rating: 'again', label: 'Again', sublabel: '<1m', color: 'border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30' },
  { rating: 'hard', label: 'Hard', sublabel: '~6m', color: 'border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-900 dark:text-orange-400 dark:hover:bg-orange-950/30' },
  { rating: 'good', label: 'Good', sublabel: '~10m', color: 'border-stone-200 text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800' },
  { rating: 'easy', label: 'Easy', sublabel: '4d+', color: 'border-green-200 text-green-700 hover:bg-green-50 dark:border-green-900 dark:text-green-400 dark:hover:bg-green-950/30' },
]

export function RatingButtons({ onRate }: Props) {
  return (
    <div className="grid grid-cols-4 gap-2 w-full">
      {BUTTONS.map(({ rating, label, sublabel, color }) => (
        <button
          key={rating}
          onClick={() => onRate(rating)}
          className={`rounded-xl border py-3 flex flex-col items-center gap-0.5 transition-colors ${color}`}
        >
          <span className="font-medium text-sm">{label}</span>
          <span className="text-xs opacity-60">{sublabel}</span>
        </button>
      ))}
    </div>
  )
}
