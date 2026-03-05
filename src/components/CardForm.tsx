import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { getInitialFSRSState } from '../lib/fsrs'
import { nanoid } from '../lib/utils'
import { useAuth } from '../auth/useAuth'
import { publishCardToCommunity, upsertCard } from '../lib/cloudStore'
import type { Card } from '../db/schema'

interface Props {
  deckId?: string
  onDone: () => void
}

export function CardForm({ deckId: initialDeckId, onDone }: Props) {
  const decks = useLiveQuery(() => db.decks.toArray())
  const [selectedDeckId, setSelectedDeckId] = useState(initialDeckId ?? '')
  const [tibetan, setTibetan] = useState('')
  const [phonetic, setPhonetic] = useState('')
  const [english, setEnglish] = useState('')
  const [difficulty, setDifficulty] = useState(1)
  const [added, setAdded] = useState(0)
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDeckId || !tibetan.trim() || !english.trim()) return
    const card: Card = {
      id: nanoid(),
      deckId: selectedDeckId,
      front: { tibetan: tibetan.trim(), phonetic: phonetic.trim(), english: english.trim() },
      tags: [],
      difficulty,
      fsrsPhonetics: getInitialFSRSState(),
      fsrsMeaning: getInitialFSRSState(),
      createdAt: Date.now(),
    }

    await db.cards.add(card)
    if (user) {
      await upsertCard(user.uid, card)
    }

    const totalAdded = 1
    if (user) {
      await publishCardToCommunity(user, card)
    }

    setTibetan('')
    setPhonetic('')
    setEnglish('')
    setAdded((n) => n + totalAdded)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {!initialDeckId && (
        <div>
          <label className="block text-xs font-medium mb-1 text-stone-500">Deck</label>
          <select
            value={selectedDeckId}
            onChange={(e) => setSelectedDeckId(e.target.value)}
            className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Select a deck...</option>
            {decks?.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="block text-xs font-medium mb-1 text-stone-500">Tibetan (Uchen script)</label>
        <input
          value={tibetan}
          onChange={(e) => setTibetan(e.target.value)}
          className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 font-tibetan text-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="སངས་རྒྱས་"
          dir="ltr"
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1 text-stone-500">Phonetic</label>
        <input
          value={phonetic}
          onChange={(e) => setPhonetic(e.target.value)}
          className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="sangye"
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1 text-stone-500">English meaning</label>
        <input
          value={english}
          onChange={(e) => setEnglish(e.target.value)}
          className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="Buddha"
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1 text-stone-500">Difficulty level</label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setDifficulty(n)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                difficulty === n
                  ? 'bg-amber-700 text-white'
                  : 'border border-stone-200 dark:border-stone-700 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-stone-500 dark:text-stone-400">New cards are published to Community.</p>
      <div className="flex items-center gap-2 justify-between pt-1">
        <div>
          {added > 0 && (
            <span className="text-xs text-green-600 dark:text-green-400">
              {added} card{added !== 1 ? 's' : ''} added
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onDone} className="px-3 py-1.5 text-sm text-stone-500 hover:text-stone-700">Done</button>
          <button type="submit" className="px-3 py-1.5 text-sm rounded-lg bg-amber-700 text-white hover:bg-amber-800">Add card</button>
        </div>
      </div>
    </form>
  )
}
