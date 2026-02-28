import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { CardForm } from '../components/CardForm'

export function DeckDetail() {
  const { deckId } = useParams<{ deckId: string }>()
  const [showForm, setShowForm] = useState(false)

  const deck = useLiveQuery(() => db.decks.get(deckId!), [deckId])
  const cards = useLiveQuery(() => db.cards.where('deckId').equals(deckId!).toArray(), [deckId])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/decks" className="text-stone-400 hover:text-stone-700 text-sm">← Decks</Link>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{deck?.name}</h1>
        <div className="flex gap-2">
          <Link
            to={`/decks/${deckId}/review`}
            className="text-sm px-3 py-1.5 rounded-lg bg-amber-700 text-white hover:bg-amber-800"
          >
            Review
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
            <div className="flex items-baseline gap-3">
              <span className="font-tibetan text-2xl">{card.front.tibetan}</span>
              <span className="text-stone-500 text-sm">{card.front.phonetic}</span>
            </div>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">{card.front.english}</p>
          </div>
        ))}
        {cards?.length === 0 && (
          <p className="text-sm text-stone-400 text-center py-8">No cards yet — add one above.</p>
        )}
      </div>
    </div>
  )
}
