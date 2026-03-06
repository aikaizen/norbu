import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDecksWithDue } from '../hooks/useDecksWithDue'
import { useDiamonds } from '../hooks/useDiamonds'
import { CardForm } from '../components/CardForm'
import { BrandLogo } from '../components/BrandLogo'

export function Home() {
  const decks = useDecksWithDue()
  const diamonds = useDiamonds()
  const [showAddCard, setShowAddCard] = useState(false)

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <BrandLogo sizeClassName="h-16" />
        <div className="flex items-center gap-1.5 text-saffron-500 dark:text-saffron-400 font-semibold text-lg pt-1">
          <span>◆</span>
          <span>{diamonds}</span>
        </div>
      </div>

      <button
        onClick={() => setShowAddCard(!showAddCard)}
        className="w-full rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 py-3 text-sm text-stone-400 hover:text-stone-600 hover:border-stone-400 dark:hover:text-stone-300 dark:hover:border-stone-600 transition-colors"
      >
        + Add new card
      </button>

      {showAddCard && (
        <div className="card-surface p-4">
          <CardForm onDone={() => setShowAddCard(false)} />
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-widest text-stone-400">Decks</h2>
        {decks?.map((deck) => (
          <div
            key={deck.id}
            className="card-surface p-4 space-y-3"
          >
            <div>
              <p className="font-semibold text-stone-800 dark:text-stone-100">{deck.name}</p>
              <p className="text-sm text-stone-400 dark:text-stone-500 mt-0.5">{deck.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to={`/decks/${deck.id}/review/phonetics`}
                className="flex items-center justify-between rounded-xl bg-stone-50 dark:bg-stone-800/60 px-3 py-2.5 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <span className="text-sm font-medium text-stone-600 dark:text-stone-300">Phonetics</span>
                <span className="text-sm font-bold text-saffron-600 dark:text-saffron-400">
                  {deck.phoneticsReady}
                </span>
              </Link>
              <Link
                to={`/decks/${deck.id}/review/meaning`}
                className="flex items-center justify-between rounded-xl bg-stone-50 dark:bg-stone-800/60 px-3 py-2.5 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <span className="text-sm font-medium text-stone-600 dark:text-stone-300">Meanings</span>
                <span className="text-sm font-bold text-saffron-600 dark:text-saffron-400">
                  {deck.meaningReady}
                </span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
