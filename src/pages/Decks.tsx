import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDecksWithDue } from '../hooks/useDecksWithDue'
import { DeckForm } from '../components/DeckForm'

export function Decks() {
  const [showForm, setShowForm] = useState(false)
  const decks = useDecksWithDue()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Decks</h1>
        <button
          onClick={() => setShowForm(true)}
          className="text-sm rounded-lg px-3 py-1.5 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          + New deck
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-stone-200 dark:border-stone-800 p-4">
          <DeckForm onDone={() => setShowForm(false)} />
        </div>
      )}

      <div className="space-y-2">
        {decks?.map((deck) => (
          <div key={deck.id} className="rounded-xl border border-stone-200 dark:border-stone-800 p-4 flex items-center justify-between">
            <div>
              <Link to={`/decks/${deck.id}`} className="font-medium hover:text-amber-700 dark:hover:text-amber-500 transition-colors">
                {deck.name}
              </Link>
              <p className="text-sm text-stone-500 dark:text-stone-400">{deck.totalCards} cards · {deck.dueCards} due</p>
            </div>
            <Link
              to={`/decks/${deck.id}/review`}
              className="text-sm px-3 py-1.5 rounded-lg bg-amber-700 text-white hover:bg-amber-800 transition-colors"
            >
              Review
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
