import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { CardForm } from '../components/CardForm'

export function DeckDetail() {
  const { deckId } = useParams<{ deckId: string }>()
  const [showForm, setShowForm] = useState(false)

  const deck = useLiveQuery(() => db.decks.get(deckId!), [deckId])
  const cards = useLiveQuery(
    () => db.cards.where('deckId').equals(deckId!).toArray().then(
      (c) => c.sort((a, b) => (a.difficulty ?? 1) - (b.difficulty ?? 1))
    ),
    [deckId]
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/decks" className="text-stone-400 hover:text-stone-700 text-sm">← Decks</Link>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{deck?.name}</h1>
        <div className="flex gap-2">
          <Link
            to={`/decks/${deckId}/review/phonetics`}
            className="text-sm px-3 py-1.5 rounded-lg bg-amber-700 text-white hover:bg-amber-800"
          >
            Phonetics
          </Link>
          <Link
            to={`/decks/${deckId}/review/meaning`}
            className="text-sm px-3 py-1.5 rounded-lg border border-amber-700 text-amber-700 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20"
          >
            Meanings
          </Link>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-sm px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            + Card
          </button>
        </div>
      </div>

      {showForm && (
        <div className="rounded-xl border border-stone-200 dark:border-stone-800 p-4">
          <CardForm deckId={deckId!} onDone={() => setShowForm(false)} />
        </div>
      )}

      <div className="space-y-2">
        {cards?.map((card) => (
          <div key={card.id} className="rounded-xl border border-stone-200 dark:border-stone-800 p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="font-tibetan text-2xl">{card.front.tibetan}</span>
                  <span className="text-stone-500 text-sm">{card.front.phonetic}</span>
                </div>
                <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">{card.front.english}</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 shrink-0">
                Lvl {card.difficulty ?? 1}
              </span>
            </div>
          </div>
        ))}
        {cards?.length === 0 && (
          <p className="text-sm text-stone-400 text-center py-8">No cards yet — add one above.</p>
        )}
      </div>
    </div>
  )
}
