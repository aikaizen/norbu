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
        <div className="card-surface p-4">
          <DeckForm onDone={() => setShowForm(false)} />
        </div>
      )}

      <div className="space-y-2">
        {decks?.map((deck) => (
          <div key={deck.id} className="card-surface p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Link to={`/decks/${deck.id}`} className="hover:underline">
                <p className="font-medium">{deck.name}</p>
                <p className="text-sm text-stone-500 dark:text-stone-400">{deck.totalCards} cards</p>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to={`/decks/${deck.id}/review/phonetics`}
                className="text-center text-sm px-3 py-2 rounded-lg bg-saffron-600 text-white hover:bg-saffron-700 transition-colors"
              >
                Phonetics ({deck.phoneticsReady})
              </Link>
              <Link
                to={`/decks/${deck.id}/review/meaning`}
                className="text-center text-sm px-3 py-2 rounded-lg border border-saffron-600 text-saffron-600 dark:text-saffron-400 hover:bg-saffron-50 dark:hover:bg-saffron-950/20 transition-colors"
              >
                Meanings ({deck.meaningReady})
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
