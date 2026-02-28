import { Link } from 'react-router-dom'
import { useDecksWithDue } from '../hooks/useDecksWithDue'

export function Home() {
  const decks = useDecksWithDue()
  const totalDue = decks?.reduce((sum, d) => sum + d.dueCards, 0) ?? 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Norbu</h1>
        <p className="text-stone-500 dark:text-stone-400 mt-1 text-sm">ནོར་བུ — jewel</p>
      </div>

      {totalDue > 0 && (
        <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-5">
          <p className="text-amber-800 dark:text-amber-300 font-medium">
            {totalDue} card{totalDue !== 1 ? 's' : ''} due for review
          </p>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-widest text-stone-400">Decks</h2>
        {decks?.map((deck) => (
          <Link
            key={deck.id}
            to={`/decks/${deck.id}/review`}
            className="block rounded-xl border border-stone-200 dark:border-stone-800 p-4 hover:border-amber-400 dark:hover:border-amber-700 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{deck.name}</p>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">{deck.description}</p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="text-2xl font-semibold text-amber-700 dark:text-amber-500">
                  {deck.dueCards}
                </p>
                <p className="text-xs text-stone-400">due</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
