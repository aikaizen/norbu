import { Link } from 'react-router-dom'
import { useDecksWithDue } from '../hooks/useDecksWithDue'
import { useDiamonds } from '../hooks/useDiamonds'

export function Home() {
  const decks = useDecksWithDue()
  const diamonds = useDiamonds()

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Norbu</h1>
          <p className="text-stone-500 dark:text-stone-400 mt-1 text-sm">ནོར་བུ — jewel</p>
        </div>
        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold text-lg pt-1">
          <span>◆</span>
          <span>{diamonds}</span>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-widest text-stone-400">Decks</h2>
        {decks?.map((deck) => (
          <div
            key={deck.id}
            className="rounded-xl border border-stone-200 dark:border-stone-800 p-4 space-y-3"
          >
            <div>
              <p className="font-medium">{deck.name}</p>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">{deck.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to={`/decks/${deck.id}/review/phonetics`}
                className="flex items-center justify-between rounded-lg bg-stone-100 dark:bg-stone-800 px-3 py-2.5 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Phonetics</span>
                <span className="text-sm font-semibold text-amber-700 dark:text-amber-500">
                  {deck.phoneticsReady}
                </span>
              </Link>
              <Link
                to={`/decks/${deck.id}/review/meaning`}
                className="flex items-center justify-between rounded-lg bg-stone-100 dark:bg-stone-800 px-3 py-2.5 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Meanings</span>
                <span className="text-sm font-semibold text-amber-700 dark:text-amber-500">
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
